const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pdf = require("pdf-parse");
const crypto = require("crypto");

// Enhanced cache with size limits and TTL
class LectureContentCache {
  constructor(maxSize = 100, ttl = 3600000) {
    // 1 hour TTL, max 100 items
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.accessTimes = new Map();
  }

  generateKey(lecture) {
    // Create a more robust cache key
    const keyData = `${lecture.lectureId}-${lecture.lectureNumber}-${lecture.pdfUrl}`;
    return crypto.createHash("md5").update(keyData).digest("hex");
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.delete(key);
      return null;
    }

    // Update access time for LRU
    this.accessTimes.set(key, Date.now());
    return item.data;
  }

  set(key, data) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.accessTimes.set(key, Date.now());
  }

  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }

  evictLRU() {
    if (this.accessTimes.size === 0) return;

    // Find least recently used item
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

// Enhanced rate limiter with user-specific tracking
class ChatRateLimiter {
  constructor(maxRequests = 30, timeWindow = 60000, burstLimit = 5) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.burstLimit = burstLimit; // Max requests in a short burst
    this.requests = new Map();
    this.burstTracker = new Map();
  }

  async checkLimit(userId) {
    if (!userId) {
      throw new Error("User ID is required for rate limiting");
    }

    const now = Date.now();

    // Check burst limit (5 requests in 10 seconds)
    await this.checkBurstLimit(userId, now);

    // Check regular rate limit
    const userRequests = this.requests.get(userId) || [];
    const validRequests = userRequests.filter(
      (time) => now - time < this.timeWindow
    );

    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(
          waitTime / 1000
        )} seconds.`
      );
    }

    validRequests.push(now);
    this.requests.set(userId, validRequests);

    // Clean up old data periodically
    this.cleanupOldData(now);
  }

  async checkBurstLimit(userId, now) {
    const burstWindow = 10000; // 10 seconds
    const userBursts = this.burstTracker.get(userId) || [];
    const recentBursts = userBursts.filter((time) => now - time < burstWindow);

    if (recentBursts.length >= this.burstLimit) {
      throw new Error(
        `Too many requests in quick succession. Please slow down.`
      );
    }

    recentBursts.push(now);
    this.burstTracker.set(userId, recentBursts);
  }

  cleanupOldData(now) {
    // Clean up old request data every 100 requests
    if (Math.random() < 0.01) {
      for (const [userId, requests] of this.requests) {
        const validRequests = requests.filter(
          (time) => now - time < this.timeWindow
        );
        if (validRequests.length === 0) {
          this.requests.delete(userId);
        } else {
          this.requests.set(userId, validRequests);
        }
      }

      // Clean burst tracker
      for (const [userId, bursts] of this.burstTracker) {
        const validBursts = bursts.filter((time) => now - time < 10000);
        if (validBursts.length === 0) {
          this.burstTracker.delete(userId);
        } else {
          this.burstTracker.set(userId, validBursts);
        }
      }
    }
  }

  getUserStats(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const validRequests = userRequests.filter(
      (time) => now - time < this.timeWindow
    );

    return {
      requestsInWindow: validRequests.length,
      maxRequests: this.maxRequests,
      remainingRequests: Math.max(0, this.maxRequests - validRequests.length),
      windowResetTime:
        validRequests.length > 0
          ? Math.min(...validRequests) + this.timeWindow
          : now,
    };
  }
}

// Initialize cache and rate limiter
const lectureContentCache = new LectureContentCache(100, 3600000); // 1 hour cache
const chatRateLimiter = new ChatRateLimiter(30, 60000, 5); // 30 per minute, 5 burst

// Utility functions
const validateChatInput = (req) => {
  const { message, lectures, chatHistory = [] } = req.body;
  const errors = [];

  if (!message || typeof message !== "string" || !message.trim()) {
    errors.push("Message is required and must be a non-empty string");
  }

  if (message && message.length > 2000) {
    errors.push("Message must be less than 2000 characters");
  }

  if (!lectures || !Array.isArray(lectures) || lectures.length === 0) {
    errors.push("At least one lecture is required for context");
  }

  if (lectures && lectures.length > 10) {
    errors.push("Maximum 10 lectures allowed per chat");
  }

  if (chatHistory && !Array.isArray(chatHistory)) {
    errors.push("Chat history must be an array");
  }

  if (chatHistory && chatHistory.length > 20) {
    errors.push("Chat history is too long (max 20 messages)");
  }

  // Validate lecture structure
  if (lectures) {
    lectures.forEach((lecture, index) => {
      if (!lecture.lectureId || !lecture.lectureNumber || !lecture.pdfUrl) {
        errors.push(
          `Lecture ${
            index + 1
          }: lectureId, lectureNumber, and pdfUrl are required`
        );
      }
    });
  }

  return errors;
};

const sanitizeFilename = (filename) => {
  if (!filename) return "unknown.pdf";
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
};

const extractTextFromPDF = async (filePath, lectureNumber) => {
  try {
    // Check file existence and properties
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found: ${path.basename(filePath)}`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error(`PDF file is empty: ${path.basename(filePath)}`);
    }

    if (stats.size > 100 * 1024 * 1024) {
      // 100MB limit
      throw new Error(
        `PDF file too large (${Math.round(
          stats.size / 1024 / 1024
        )}MB): ${path.basename(filePath)}`
      );
    }

    // Extract text with options
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(pdfBuffer, {
      max: 100, // Maximum pages to process
      version: "v1.10.100",
    });

    let extractedText = pdfData.text?.trim() || "";

    if (!extractedText || extractedText.length < 50) {
      throw new Error(
        `Insufficient text extracted from lecture ${lectureNumber} (${extractedText.length} characters)`
      );
    }

    // Clean and normalize text
    extractedText = extractedText
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .trim();

    // Keep more content for chatbot (30KB max)
    const maxTextLength = 30000;
    if (extractedText.length > maxTextLength) {
      // Try to cut at sentence boundaries
      const truncated = extractedText.substring(0, maxTextLength);
      const lastPeriod = truncated.lastIndexOf(".");
      extractedText =
        lastPeriod > maxTextLength * 0.8
          ? truncated.substring(0, lastPeriod + 1) +
            "\n\n[Content continues...]"
          : truncated + "\n\n[Content truncated...]";
    }

    return extractedText;
  } catch (error) {
    console.error(
      `Error extracting text from PDF (lecture ${lectureNumber}):`,
      error.message
    );
    throw error;
  }
};

// Enhanced lecture content extraction with caching
const getLectureContent = async (lecture) => {
  try {
    const cacheKey = lectureContentCache.generateKey(lecture);

    // Check cache first
    const cachedContent = lectureContentCache.get(cacheKey);
    if (cachedContent) {
      console.log(`Cache hit for lecture ${lecture.lectureNumber}`);
      return cachedContent;
    }

    console.log(
      `Cache miss for lecture ${lecture.lectureNumber}, extracting...`
    );

    // Extract filename and create file path
    const filename = sanitizeFilename(lecture.pdfUrl.split("/").pop());
    const filePath = path.join(__dirname, "../uploads/lectures", filename);

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(
      filePath,
      lecture.lectureNumber
    );

    const content = {
      lectureId: lecture.lectureId,
      lectureNumber: lecture.lectureNumber,
      content: extractedText,
      extractedAt: new Date().toISOString(),
      wordCount: extractedText.split(" ").length,
      characterCount: extractedText.length,
    };

    // Cache the content
    lectureContentCache.set(cacheKey, content);

    console.log(
      `✓ Extracted and cached content for lecture ${lecture.lectureNumber} (${content.wordCount} words)`
    );
    return content;
  } catch (error) {
    console.error(
      `✗ Error processing lecture ${lecture.lectureNumber}:`,
      error.message
    );
    return null;
  }
};

const createInstructorPrompt = (lectureContents, chatHistory, message) => {
  // Prepare lecture context with better formatting
  const lectureContext = lectureContents
    .map((lc) => `=== LECTURE ${lc.lectureNumber} ===\n${lc.content}\n`)
    .join("\n");

  // Prepare chat history (keep last 10 messages for context)
  const recentHistory = chatHistory
    .slice(-10)
    .map(
      (msg) =>
        `${msg.type === "user" ? "Student" : "Instructor"}: ${msg.content}`
    )
    .join("\n");

  return `You are an expert AI instructor with deep knowledge of the provided lecture materials. Your role is to:

PERSONALITY & APPROACH:
- Be patient, encouraging, and supportive
- Explain complex concepts in simple terms
- Use examples and analogies when helpful
- Encourage critical thinking and deeper understanding
- Maintain a professional yet friendly tone

CONTENT GUIDELINES:
- Base all answers STRICTLY on the provided lecture content
- Quote relevant sections when appropriate
- If information isn't in the lectures, politely redirect to available content
- Suggest related topics that ARE covered in the lectures
- Help connect concepts across different lectures when relevant

RESPONSE FORMAT:
- Start with a direct answer to the question
- Provide supporting details from the lecture content
- Use examples from the material when possible
- End with a follow-up question or suggestion for deeper learning

AVAILABLE LECTURE CONTENT:
${lectureContext}

RECENT CONVERSATION HISTORY:
${recentHistory}

CURRENT STUDENT QUESTION: ${message}

Please provide a helpful, educational response based on the lecture content. If the question relates to something not covered in the lectures, acknowledge this and suggest related topics that are covered.`;
};

const makeAPICall = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const requestPayload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7, // Conversational but not too creative
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 1500, // Longer responses for better explanations
      candidateCount: 1,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(apiUrl, requestPayload, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AIChatbot/1.0",
      },
      timeout: 45000, // 45 second timeout
      maxRetries: 2,
      retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
    });

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid API response structure");
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error(
        "AI service rate limit exceeded. Please try again in a moment."
      );
    }
    if (error.response?.status === 403) {
      throw new Error(
        "AI service access denied. Please check API key configuration."
      );
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }
    throw error;
  }
};

const cleanAIResponse = (response) => {
  return response
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
    .replace(/\*(.*?)\*/g, "$1") // Remove markdown italic
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/#{1,6}\s/g, "") // Remove markdown headers
    .trim();
};

// Main controller functions
exports.chatWithInstructor = async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate input
    const validationErrors = validateChatInput(req);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const { message, lectures, chatHistory = [] } = req.body;
    const userId = req.user?.id || "anonymous";

    console.log(
      `Chat request from user ${userId}: "${message.substring(0, 100)}..."`
    );

    // Check rate limit
    try {
      await chatRateLimiter.checkLimit(userId);
    } catch (rateLimitError) {
      const userStats = chatRateLimiter.getUserStats(userId);
      return res.status(429).json({
        success: false,
        message: rateLimitError.message,
        retryAfter: Math.ceil((userStats.windowResetTime - Date.now()) / 1000),
        userStats,
      });
    }

    // Extract content from lectures
    console.log(`Processing ${lectures.length} lectures...`);
    const lectureContents = [];
    const failedLectures = [];

    for (const lecture of lectures) {
      try {
        const content = await getLectureContent(lecture);
        if (content) {
          lectureContents.push(content);
        } else {
          failedLectures.push(lecture.lectureNumber);
        }
      } catch (error) {
        console.error(
          `Failed to process lecture ${lecture.lectureNumber}:`,
          error.message
        );
        failedLectures.push(lecture.lectureNumber);
      }
    }

    if (lectureContents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Could not access content from any of the selected lectures",
        failedLectures,
      });
    }

    // Create instructor prompt
    const instructorPrompt = createInstructorPrompt(
      lectureContents,
      chatHistory,
      message
    );

    // Make API call
    console.log("Calling AI service...");
    const aiResponse = await makeAPICall(instructorPrompt);

    // Clean up response
    const cleanedResponse = cleanAIResponse(aiResponse);

    const processingTime = Date.now() - startTime;
    console.log(`✓ Chat completed in ${processingTime}ms`);

    res.status(200).json({
      success: true,
      response: cleanedResponse,
      metadata: {
        lecturesUsed: lectureContents.map((lc) => ({
          lectureNumber: lc.lectureNumber,
          wordCount: lc.wordCount,
        })),
        failedLectures,
        processingTime,
        timestamp: new Date().toISOString(),
        userStats: chatRateLimiter.getUserStats(userId),
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("Chat error:", error.message);

    // Handle specific error cases
    if (
      error.message.includes("rate limit") ||
      error.message.includes("Rate limit")
    ) {
      return res.status(429).json({
        success: false,
        message: error.message,
        retryAfter: 60,
        processingTime,
      });
    }

    if (
      error.message.includes("access denied") ||
      error.message.includes("API key")
    ) {
      return res.status(503).json({
        success: false,
        message: "AI service is currently unavailable. Please try again later.",
        processingTime,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error processing your question. Please try again.",
      processingTime,
    });
  }
};

exports.getChatbotStatus = async (req, res) => {
  try {
    const userId = req.user?.id || "anonymous";
    const userStats = chatRateLimiter.getUserStats(userId);
    const cacheStats = lectureContentCache.getStats();

    res.status(200).json({
      success: true,
      data: {
        available: true,
        status: "operational",
        cache: cacheStats,
        rateLimit: {
          maxRequests: 30,
          timeWindow: 60000,
          burstLimit: 5,
        },
        userStats,
        systemInfo: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: "2.0.0",
        },
      },
    });
  } catch (error) {
    console.error("Chatbot status error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting chatbot status",
      error: error.message,
    });
  }
};

// Additional utility endpoints
exports.clearUserCache = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Clear user's rate limit data
    chatRateLimiter.requests.delete(userId);
    chatRateLimiter.burstTracker.delete(userId);

    res.status(200).json({
      success: true,
      message: "User cache cleared successfully",
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cache",
    });
  }
};

exports.getCacheStats = async (req, res) => {
  try {
    const cacheStats = lectureContentCache.getStats();

    res.status(200).json({
      success: true,
      data: {
        cache: cacheStats,
        rateLimiter: {
          activeUsers: chatRateLimiter.requests.size,
          burstTrackedUsers: chatRateLimiter.burstTracker.size,
        },
      },
    });
  } catch (error) {
    console.error("Cache stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting cache statistics",
    });
  }
};
