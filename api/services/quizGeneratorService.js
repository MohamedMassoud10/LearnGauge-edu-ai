const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pdf = require("pdf-parse");

// Enhanced Rate limiting with exponential backoff
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000, maxRetries = 3) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.maxRetries = maxRetries;
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(
          waitTime / 1000
        )} seconds.`
      );
    }

    this.requests.push(now);
  }

  async executeWithRetry(asyncFunction, retryCount = 0) {
    try {
      await this.checkLimit();
      return await asyncFunction();
    } catch (error) {
      if (
        retryCount < this.maxRetries &&
        (error.message.includes("Rate limit") || error.code === "ECONNRESET")
      ) {
        const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(
          `Retry ${retryCount + 1}/${this.maxRetries} after ${backoffTime}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return this.executeWithRetry(asyncFunction, retryCount + 1);
      }
      throw error;
    }
  }
}

const rateLimiter = new RateLimiter(8, 60000, 3); // More conservative limits

// Utility functions
const validateInput = (req) => {
  const { lectures, courseId, totalQuestions = 10 } = req.body;

  const errors = [];

  if (!lectures || !Array.isArray(lectures) || lectures.length === 0) {
    errors.push("At least one lecture is required");
  }

  if (!courseId || typeof courseId !== "string") {
    errors.push("Valid courseId is required");
  }

  if (totalQuestions < 1 || totalQuestions > 100) {
    errors.push("Total questions must be between 1 and 100");
  }

  // Validate each lecture
  if (lectures) {
    lectures.forEach((lecture, index) => {
      if (!lecture.pdfUrl || typeof lecture.pdfUrl !== "string") {
        errors.push(`Lecture ${index + 1}: pdfUrl is required`);
      }
      if (!lecture.lectureId) {
        errors.push(`Lecture ${index + 1}: lectureId is required`);
      }
      if (
        lecture.questionsCount &&
        (lecture.questionsCount < 1 || lecture.questionsCount > 20)
      ) {
        errors.push(
          `Lecture ${index + 1}: questionsCount must be between 1 and 20`
        );
      }
    });
  }

  return errors;
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
};

const extractTextFromPDF = async (filePath, lectureNumber) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error(`PDF file is empty: ${filePath}`);
    }

    if (stats.size > 50 * 1024 * 1024) {
      // 50MB limit
      throw new Error(
        `PDF file too large (${Math.round(
          stats.size / 1024 / 1024
        )}MB): ${filePath}`
      );
    }

    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(pdfBuffer, {
      max: 50, // Limit pages processed
      version: "v1.10.100",
    });

    let extractedText = pdfData.text?.trim() || "";

    if (!extractedText || extractedText.length < 100) {
      throw new Error(
        `Insufficient text extracted from lecture ${lectureNumber} (${extractedText.length} chars)`
      );
    }

    // Clean and normalize text
    extractedText = extractedText
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .trim();

    return extractedText;
  } catch (error) {
    console.error(
      `Error extracting text from PDF (lecture ${lectureNumber}):`,
      error.message
    );
    throw error;
  }
};

const createPrompt = (extractedText, questionsCount, lectureNumber) => {
  // Dynamically adjust text length based on question count
  const maxTextLength = Math.min(20000, 5000 + questionsCount * 2000);

  if (extractedText.length > maxTextLength) {
    // Try to cut at sentence boundaries
    const truncated = extractedText.substring(0, maxTextLength);
    const lastPeriod = truncated.lastIndexOf(".");
    extractedText =
      lastPeriod > maxTextLength * 0.8
        ? truncated.substring(0, lastPeriod + 1)
        : truncated + "...";
  }

  return `You are an expert educational content creator. Based on the following lecture content, create exactly ${questionsCount} high-quality multiple-choice questions in valid JSON format.

IMPORTANT: Respond ONLY with a valid JSON array. No extra text, explanations, or markdown formatting.

Required JSON format:
[
  {
    "question": "Clear, specific question text?",
    "options": {
      "A": "First option",
      "B": "Second option", 
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this answer is correct",
    "lectureNumber": ${lectureNumber}
  }
]

Requirements:
- Create exactly ${questionsCount} questions
- Questions must be factual and based on the content
- All 4 options must be plausible and related to the topic
- Avoid obvious wrong answers
- Questions should test understanding, not just memorization
- Keep questions and options concise but clear
- Explanations should be 1-2 sentences maximum

Lecture ${lectureNumber} Content:
${extractedText}`;
};

const parseQuestions = (responseText, lectureNumber, questionsCount) => {
  try {
    // Multiple parsing strategies
    let cleanedResponse = responseText.trim();

    // Remove markdown code blocks
    cleanedResponse = cleanedResponse
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "");

    // Extract JSON array
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    let questions;

    if (jsonMatch) {
      questions = JSON.parse(jsonMatch[0]);
    } else {
      // Try parsing the entire response
      questions = JSON.parse(cleanedResponse);
    }

    if (!Array.isArray(questions)) {
      throw new Error("Response is not an array");
    }

    // Validate and clean questions
    const validQuestions = questions
      .filter((q) => {
        return (
          q &&
          typeof q.question === "string" &&
          q.question.trim() &&
          q.options &&
          typeof q.options === "object" &&
          Object.keys(q.options).length >= 4 &&
          typeof q.correctAnswer === "string" &&
          ["A", "B", "C", "D"].includes(q.correctAnswer) &&
          q.options[q.correctAnswer] &&
          typeof q.explanation === "string" &&
          q.explanation.trim()
        );
      })
      .map((q) => ({
        question: q.question.trim(),
        options: {
          A: q.options.A?.toString().trim() || "",
          B: q.options.B?.toString().trim() || "",
          C: q.options.C?.toString().trim() || "",
          D: q.options.D?.toString().trim() || "",
        },
        correctAnswer: q.correctAnswer,
        explanation: q.explanation.trim(),
        lectureNumber: lectureNumber,
      }))
      .slice(0, questionsCount); // Ensure we don't exceed requested count

    if (validQuestions.length === 0) {
      throw new Error("No valid questions found in response");
    }

    return validQuestions;
  } catch (error) {
    console.error(
      `Error parsing questions for lecture ${lectureNumber}:`,
      error.message
    );
    throw new Error(`Failed to parse questions: ${error.message}`);
  }
};

const makeAPICall = async (prompt, questionsCount) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const requestPayload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3, // Lower for more consistent output
      topK: 20,
      topP: 0.8,
      maxOutputTokens: Math.min(8192, 800 * questionsCount),
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

  const response = await axios.post(apiUrl, requestPayload, {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "QuizGenerator/1.0",
    },
    timeout: 60000, // 60 second timeout
    maxRetries: 3,
    retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
  });

  if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Invalid API response structure");
  }

  return response.data.candidates[0].content.parts[0].text;
};

// Main functions
exports.generateQuizFromPDF = async (req, res) => {
  const startTime = Date.now();
  let processedLectures = [];
  let allQuestions = [];

  try {
    // Validate input
    const validationErrors = validateInput(req);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const { lectures, courseId, totalQuestions = 10 } = req.body;

    console.log(
      `Starting quiz generation: ${lectures.length} lectures, ${totalQuestions} total questions`
    );

    // Process each lecture
    for (let i = 0; i < lectures.length; i++) {
      const lecture = lectures[i];
      const { pdfUrl, lectureId, lectureNumber, questionsCount = 3 } = lecture;

      try {
        console.log(
          `Processing lecture ${i + 1}/${lectures.length}: ${lectureNumber}`
        );

        // Extract and sanitize filename
        const filename = sanitizeFilename(
          pdfUrl.split("/").pop() || `lecture_${lectureNumber}.pdf`
        );
        const filePath = path.join(__dirname, "../uploads/lectures", filename);

        // Extract text from PDF
        const extractedText = await extractTextFromPDF(filePath, lectureNumber);

        // Create prompt
        const prompt = createPrompt(
          extractedText,
          questionsCount,
          lectureNumber
        );

        // Make API call with retry logic
        const responseText = await rateLimiter.executeWithRetry(async () => {
          return await makeAPICall(prompt, questionsCount);
        });

        // Parse questions
        const questions = parseQuestions(
          responseText,
          lectureNumber,
          questionsCount
        );

        // Add lecture metadata
        const questionsWithMetadata = questions.map((q) => ({
          ...q,
          lectureId: lectureId,
          generatedAt: new Date().toISOString(),
        }));

        allQuestions.push(...questionsWithMetadata);
        processedLectures.push({
          lectureNumber,
          lectureId,
          questionsGenerated: questionsWithMetadata.length,
          questionsRequested: questionsCount,
          status: "success",
        });

        console.log(
          `✓ Generated ${questionsWithMetadata.length}/${questionsCount} questions for lecture ${lectureNumber}`
        );

        // Add delay between requests
        if (i < lectures.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(
          `✗ Error processing lecture ${lectureNumber}:`,
          error.message
        );
        processedLectures.push({
          lectureNumber: lecture.lectureNumber,
          lectureId: lecture.lectureId,
          questionsGenerated: 0,
          questionsRequested: lecture.questionsCount || 3,
          status: "failed",
          error: error.message,
        });
        continue; // Continue with next lecture
      }
    }

    // Check if we have any questions
    if (allQuestions.length === 0) {
      return res.status(500).json({
        success: false,
        message:
          "Could not generate questions from any of the selected lectures",
        processedLectures,
        processingTime: Date.now() - startTime,
      });
    }

    // Shuffle and limit questions
    const shuffledQuestions = allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);

    const successfulLectures = processedLectures.filter(
      (l) => l.status === "success"
    ).length;
    const failedLectures = processedLectures.filter(
      (l) => l.status === "failed"
    ).length;

    console.log(
      `✓ Quiz generation completed: ${shuffledQuestions.length}/${totalQuestions} questions from ${successfulLectures}/${lectures.length} lectures`
    );

    res.status(200).json({
      success: true,
      data: {
        questions: shuffledQuestions,
        courseId,
        totalQuestions: shuffledQuestions.length,
        requestedQuestions: totalQuestions,
        processedLectures,
        summary: {
          lecturesTotal: lectures.length,
          lecturesSuccessful: successfulLectures,
          lecturesFailed: failedLectures,
          questionsGenerated: allQuestions.length,
          questionsFinal: shuffledQuestions.length,
        },
      },
      processingTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Fatal error generating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Error generating quiz from lectures",
      error: error.message,
      processedLectures,
      processingTime: Date.now() - startTime,
    });
  }
};

exports.saveGeneratedQuiz = async (req, res) => {
  try {
    // Validate input
    const { questions, courseId, lectureIds, title, questionCount } = req.body;

    const errors = [];
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      errors.push("Valid questions array is required");
    }
    if (!courseId || typeof courseId !== "string") {
      errors.push("Valid courseId is required");
    }
    if (!lectureIds || !Array.isArray(lectureIds) || lectureIds.length === 0) {
      errors.push("Valid lectureIds array is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Validate each question structure
    const validQuestions = questions.filter(
      (q) => q.question && q.options && q.correctAnswer && q.explanation
    );

    if (validQuestions.length !== questions.length) {
      console.warn(
        `Filtered out ${
          questions.length - validQuestions.length
        } invalid questions`
      );
    }

    const quizData = {
      title: title || `Custom Quiz (${validQuestions.length} Questions)`,
      course: courseId,
      lectures: lectureIds,
      questions: validQuestions,
      questionCount: questionCount || validQuestions.length,
      actualQuestionCount: validQuestions.length,
      createdBy: req.user?.id || "system",
      createdAt: new Date(),
      isActive: true,
      metadata: {
        generatedAt: new Date().toISOString(),
        lectureCount: lectureIds.length,
        averageQuestionsPerLecture:
          Math.round((validQuestions.length / lectureIds.length) * 100) / 100,
      },
    };

    console.log(
      `✓ Quiz saved: "${quizData.title}" with ${validQuestions.length} questions from ${lectureIds.length} lectures`
    );

    res.status(201).json({
      success: true,
      message: "Quiz saved successfully",
      data: quizData,
    });
  } catch (error) {
    console.error("Error saving quiz:", error);
    res.status(500).json({
      success: false,
      message: "Error saving quiz",
      error: error.message,
    });
  }
};
