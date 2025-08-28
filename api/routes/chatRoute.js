const express = require('express');
const {
    sendMessage,
    getConversationsList,
    getConversation,
    getAdminConversations,
    markMessagesAsRead,
    markSingleMessageAsRead,
    markMultipleMessagesAsRead
} = require("../services/chatService");

const authService = require('../services/authService');
const router = express.Router();

router.route("/")
  .get(authService.protect, getConversationsList)
  .post(
      authService.protect,
      sendMessage
  );

router.route("/read").put(authService.protect,markMultipleMessagesAsRead);
router.route("/:messageId/read").put(authService.protect,markSingleMessageAsRead);
router.route("/admin").get(
    authService.protect,
    authService.allowedTO('admin'),
    getAdminConversations
);
router.route("/:userId")
  .put(authService.protect,markMessagesAsRead);

router.route("/:conversationId")
  .get(getConversation)

module.exports = router;
