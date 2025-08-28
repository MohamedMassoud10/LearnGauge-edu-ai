const express = require("express");
const router = express.Router();
const {
  chatWithInstructor,
  getChatbotStatus,
} = require("../services/chatBotService");
const authService = require("../services/authService");

// @route   POST /api/v1/chatbot/chat
// @desc    Chat with AI instructor
// @access  Private
router.post(
  "/chat",
  authService.protect,
  authService.allowedTO("admin", "instructor", "student"),
  chatWithInstructor
);

// @route   GET /api/v1/chatbot/status
// @desc    Get chatbot status
// @access  Private
router.get(
  "/status",
  authService.allowedTO("admin", "instructor", "student"),
  getChatbotStatus
);

module.exports = router;
