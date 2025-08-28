"use client";
import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaGraduationCap,
  FaHeadset,
  FaSpinner,
  FaBookOpen,
} from "react-icons/fa";

const ChatBot = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: "system",
      content:
        "Hello! I'm your Academic Learning Assistant. I'm here to help students with all academic subjects , i am created by Massoud,Esmat,Reem,Khaled,Arwa and Menna What would you like to learn about today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Gemini API configuration
  const GEMINI_API_KEY = "";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const generateAcademicPrompt = (userMessage, conversationHistory) => {
    const recentHistory = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map(
        (msg) =>
          `${msg.type === "user" ? "Student" : "Academic Assistant"}: ${
            msg.content
          }`
      )
      .join("\n");

    return `You are a specialized Academic Learning Assistant for university and high school students. Your role is to help with ALL academic subjects and educational topics. Your expertise includes:

ACADEMIC SUBJECTS:
- Mathematics (Algebra, Calculus, Statistics, Geometry, etc.)
- Sciences (Physics, Chemistry, Biology, Earth Science, etc.)
- Computer Science (Programming, Algorithms, Data Structures, etc.)
- Engineering (All branches - Mechanical, Electrical, Civil, etc.)
- Literature and Language Arts (Analysis, Writing, Grammar, etc.)
- History and Social Studies (World History, Government, Economics, etc.)
- Foreign Languages (Grammar, Vocabulary, Conversation, etc.)
- Business Studies (Accounting, Marketing, Management, etc.)
- Psychology and Social Sciences
- Art and Design Theory
- Philosophy and Ethics

YOUR TEACHING APPROACH:
1. Provide clear, educational explanations appropriate for the student's level
2. Break down complex concepts into understandable steps
3. Use examples and analogies to illustrate difficult concepts
4. Encourage critical thinking and deeper understanding
5. Offer study strategies and learning techniques
6. Help with homework, assignments, and exam preparation
7. Be patient, supportive, and encouraging
8. Adapt explanations to different learning styles

IMPORTANT GUIDELINES:
- Focus ONLY on academic and educational topics
- If asked about non-academic topics, politely redirect to educational content
- Provide step-by-step solutions when appropriate
- Encourage learning rather than just giving answers
- Ask clarifying questions when needed
- Suggest additional resources or study methods
- Be supportive of students' learning journey

CONVERSATION HISTORY:
${recentHistory}

CURRENT STUDENT QUESTION: ${userMessage}

Please provide a helpful, educational response that supports the student's academic learning. If the question is not academic-related, politely redirect them to educational topics you can help with.`;
  };

  const callGeminiAPI = async (userMessage) => {
    try {
      const prompt = generateAcademicPrompt(userMessage, chatHistory);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1024,
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

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid response format from AI service");
      }
    } catch (error) {
      console.error("AI API Error:", error);
      throw error;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMessage = message.trim();
    setMessage("");
    setError(null);

    // Add user message to chat
    setChatHistory((prev) => [
      ...prev,
      {
        type: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Call AI API
      const aiResponse = await callGeminiAPI(userMessage);

      // Add AI response to chat
      setChatHistory((prev) => [
        ...prev,
        {
          type: "system",
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setError(
        "Sorry, I'm having trouble connecting right now. Please try again."
      );

      // Add error message to chat
      setChatHistory((prev) => [
        ...prev,
        {
          type: "system",
          content:
            "I apologize, but I'm experiencing some technical difficulties. Please try asking your question again, or check your internet connection.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickTopic = (topic) => {
    setMessage(`I need help with ${topic}`);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearChat = () => {
    setChatHistory([
      {
        type: "system",
        content:
          "Hello! I'm your Academic Learning Assistant. I'm here to help students with all academic subjects including mathematics, science, literature, history, computer science, engineering, and more. Whether you need help understanding concepts, solving problems, or preparing for exams, I'm here to support your learning journey. What would you like to learn about today?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
              <FaGraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Academic Learning Assistant</h3>
              <p className="text-sm opacity-90">All Subjects • All Levels</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
              title="New Conversation"
            >
              <FaBookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subject Selection Bar */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-3">
          <div className="flex items-center text-sm text-emerald-800 overflow-x-auto pb-2">
            <span className="font-medium mr-2">Popular Subjects:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickTopic("mathematics and calculus")}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors"
              >
                Mathematics
              </button>
              <button
                onClick={() => handleQuickTopic("physics concepts")}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors"
              >
                Physics
              </button>
              <button
                onClick={() => handleQuickTopic("chemistry problems")}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors"
              >
                Chemistry
              </button>
              <button
                onClick={() => handleQuickTopic("biology and life sciences")}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors"
              >
                Biology
              </button>
              <button
                onClick={() => handleQuickTopic("literature analysis")}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors"
              >
                Literature
              </button>
              <button
                onClick={() => handleQuickTopic("history and social studies")}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors"
              >
                History
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 mx-4 mt-2 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory &&
            chatHistory.length > 0 &&
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : msg.isError
                      ? "bg-red-50 border border-red-200 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.type === "system" && (
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.isError
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-emerald-500 to-blue-600"
                        }`}
                      >
                        <FaGraduationCap className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap">
                        {msg.content || ""}
                      </div>
                      <div
                        className={`text-xs mt-2 opacity-70 ${
                          msg.type === "user"
                            ? "text-blue-100"
                            : msg.isError
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp
                          ? msg.timestamp.toLocaleTimeString()
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                    <FaSpinner className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    Analyzing your question...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 p-4"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about any academic subject: math, science, literature, history..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!message.trim() || isTyping}
              className="bg-gradient-to-r from-emerald-600 to-blue-700 hover:from-emerald-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[50px] shadow-lg hover:shadow-xl"
            >
              {isTyping ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                <FaHeadset className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              🎓 Academic support for all subjects and learning levels
            </p>
            <p className="text-xs text-emerald-600 font-medium">
              Powered by LearnGauge Team
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
