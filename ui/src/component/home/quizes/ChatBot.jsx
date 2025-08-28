"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaUser,
  FaGraduationCap,
  FaSpinner,
  FaBookOpen,
  FaLightbulb,
  FaQuestionCircle,
} from "react-icons/fa";
import { useAuthContext } from "../../../hooks/useAuthContext";

const ChatBot = ({ lectures, onClose, isOpen }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthContext();
  const token = user?.token;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && lectures && lectures.length > 0) {
      initializeChatBot();
    }
  }, [isOpen, lectures]);

  const initializeChatBot = async () => {
    setIsInitializing(true);

    const lectureNumbers = lectures.map((l) => l.number).sort((a, b) => a - b);
    const welcomeMessage = {
      id: Date.now(),
      type: "bot",
      content: `👋 Hello! I'm your AI instructor for Lecture${
        lectures.length > 1 ? "s" : ""
      } ${lectureNumbers.join(", ")}.

I have analyzed the content from your selected lecture${
        lectures.length > 1 ? "s" : ""
      } and I'm here to help you understand the material better!

You can ask me:
📚 Questions about specific topics
💡 Explanations of complex concepts  
🔍 Clarifications on any part of the content
📝 Help with understanding key points

What would you like to learn about today?`,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
    setIsInitializing(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          lectures: lectures.map((lecture) => ({
            lectureId: lecture._id,
            lectureNumber: lecture.number,
            pdfUrl: lecture.pdf,
          })),
          chatHistory: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: "bot",
          content:
            "I apologize, but I'm having trouble processing your question right now. Please try again or rephrase your question.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Can you explain the main concepts from this lecture?",
    "What are the key takeaways I should remember?",
    "Can you give me examples to help understand this topic?",
    "What might be on a test about this material?",
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#014D89] to-[#01396a] text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
              <FaGraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Lecture Instructor</h3>
              <p className="text-sm opacity-90">
                Teaching Lecture{lectures.length > 1 ? "s" : ""}{" "}
                {lectures
                  .map((l) => l.number)
                  .sort((a, b) => a - b)
                  .join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Lecture Context Bar */}
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-center text-sm text-blue-800">
            <FaBookOpen className="w-4 h-4 mr-2" />
            <span className="font-medium">Context:</span>
            <div className="flex flex-wrap gap-1 ml-2">
              {lectures.map((lecture) => (
                <span
                  key={lecture._id}
                  className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  Lecture {lecture.number}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isInitializing ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-[#014D89] mx-auto mb-4" />
                <p className="text-gray-600">Initializing AI instructor...</p>
                <p className="text-sm text-gray-500">
                  Analyzing lecture content
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === "user"
                        ? "bg-[#014D89] text-white"
                        : message.isError
                        ? "bg-red-50 border border-red-200 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === "bot" && (
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.isError ? "bg-red-200" : "bg-[#014D89]"
                          }`}
                        >
                          {message.isError ? (
                            <FaTimes className="w-4 h-4 text-red-600" />
                          ) : (
                            <FaRobot className="w-4 h-4 text-white" />
                          )}
                        </div>
                      )}
                      {message.type === "user" && (
                        <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <FaUser className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-2 opacity-70 ${
                            message.type === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#014D89] rounded-full flex items-center justify-center">
                        <FaRobot className="w-4 h-4 text-white" />
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
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {messages.length === 1 && !isLoading && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <FaLightbulb className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      Suggested Questions:
                    </span>
                  </div>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="block w-full text-left p-2 text-sm text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        <FaQuestionCircle className="w-3 h-3 mr-2 inline" />
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the lecture content..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#014D89] focus:border-transparent"
                rows="2"
                disabled={isLoading || isInitializing}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading || isInitializing}
              className="bg-[#014D89] hover:bg-[#01396a] disabled:bg-gray-400 text-white p-3 rounded-lg transition-colors flex items-center justify-center min-w-[50px]"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin w-5 h-5" />
              ) : (
                <FaPaperPlane className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line • Ask about concepts,
            examples, or clarifications
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
