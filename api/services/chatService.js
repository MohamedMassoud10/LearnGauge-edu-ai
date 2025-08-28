const ChatMessage = require('../models/chatModel');
const asyncHandler = require('express-async-handler');

// @desc    Send a chat message
// @route   POST /api/chat
// @access  Private (student, instructor, admin)
exports.sendMessage = asyncHandler(async (req, res) => {

  const { receiver, message, aboutUser } = req.body;

  // 1. Generate unique conversationId
  const senderId = req.user._id.toString();
  const receiverId = receiver.toString();

  const conversationId = [senderId, receiverId].sort().join('_');

  const newMessage = await ChatMessage.create({
    sender: senderId,
    receiver: receiverId,
    message,
    conversationId,
    aboutUser,
  });

  res.status(201).json({
    status: 'success',
    data: newMessage,
  });
});

// @desc    Get conversations list for the logged-in user
// @route   GET /api/chat
// @access  Private (students, admins, instructors)
exports.getConversationsList = asyncHandler(async (req, res) => {
  const conversations = await ChatMessage.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id }
        ]
      }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $last: '$message' },
        lastUpdated: { $last: '$createdAt' },
        unreadMessagesCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$read', false] }] }, 1, 0]
          }
        }
      }
    },
    { $sort: { lastUpdated: -1 } } 
  ]);

  res.status(200).json({ status: 'success', results: conversations.length, data: conversations });
});

// @desc    Get all messages in a specific conversation
// @route   GET /api/chat/:conversationId
// @access  Private (User or Admin)
exports.getConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await ChatMessage.find({ conversationId })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ createdAt: 1 });

  if (messages.length === 0) {
    return res.status(404).json({ status: 'error', message: 'No messages found for this conversation' });
  }

  res.status(200).json({ status: 'success', results: messages.length, data: messages });
});


// @desc    Admin - Get all users' conversations
// @route   GET /api/chat/admin
// @access  Private (Admin)
exports.getAdminConversations = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find({}).sort({ createdAt: -1 });

  const conversationsMap = {};

  for (const msg of messages) {
    const key = [msg.sender.toString(), msg.receiver.toString()].sort().join('_');
    if (!conversationsMap[key]) {
      conversationsMap[key] = msg;
    }
  }

  const conversations = Object.values(conversationsMap);
  res.status(200).json({ status: 'success', conversations });
});

// @desc    Mark all messages as read in a conversation
// @route   PUT /api/chat/:userId
// @access  Private
exports.markMessagesAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id; 
  const otherUserId = req.params.userId;

  const unreadMessages = await ChatMessage.find({
    sender: otherUserId,
    receiver: userId,
    read: false
  });

  if (unreadMessages.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'No unread messages found'
    });
  }

  await ChatMessage.updateMany(
    { sender: otherUserId, receiver: userId, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read'
  });
});

// @desc    Mark single message as read
// @route   PUT /api/chat/:messageId/read
// @access  Private
exports.markSingleMessageAsRead = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;

  await ChatMessage.findByIdAndUpdate(messageId, { read: true });

  res.status(200).json({ status: 'success', message: 'Message marked as read' });
});

// @desc    Mark multiple messages as read
// @route   PUT /api/chat/read
// @access  Private
exports.markMultipleMessagesAsRead = asyncHandler(async (req, res) => {
  const messageIds = req.body.messageIds; // array

  if (!Array.isArray(messageIds)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid message IDs' });
  }

  await ChatMessage.updateMany(
    { _id: { $in: messageIds } },
    { $set: { read: true } }
  );

  res.status(200).json({ status: 'success', message: 'Messages marked as read' });
});

