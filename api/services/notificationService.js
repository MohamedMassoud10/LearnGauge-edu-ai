const asyncHandler = require("express-async-handler");
const factory = require("./handlerFactory");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

exports.getNotifications = factory.getAll(Notification, "Notification", {
  path: "recipient createdBy",
  select: "name email role",
});
exports.getNotification = factory.getOne(Notification);

exports.createNotification = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;

  if (req.body.allUsers) {
    // Send to all users
    const users = await User.find({}, "_id");
    const notifications = users.map((user) => ({
      ...req.body,
      recipient: user._id,
    }));
    await Notification.insertMany(notifications);
    return res.status(201).json({ message: "Notification sent to all users" });
  }

  if (req.body.role) {
    // Send to all users of a specific role
    const users = await User.find({ role: req.body.role }, "_id");
    if (users.length === 0) {
      return res.status(400).json({ message: "No users found for this role" });
    }
    const notifications = users.map((user) => ({
      ...req.body,
      recipient: user._id,
    }));
    await Notification.insertMany(notifications);
    return res
      .status(201)
      .json({ message: `Notification sent to all ${req.body.role} users` });
  }

  // Send to a specific user
  if (!req.body.recipient) {
    return res.status(400).json({ message: "Recipient or role is required" });
  }
  const notification = await Notification.create(req.body);
  res.status(201).json({ notification });
});

exports.updateNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id }, // Ensure user can only update their own notifications
    { read: req.body.read },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json({ notification });
});

// Mark all notifications as read for the logged-in user
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({ message: "All notifications marked as read" });
});

exports.deleteNotification = factory.deleteOne(Notification);
exports.getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate({ path: "recipient", select: "name email role" })
    .populate({ path: "createdBy", select: "name email role" })
    .sort({ createdAt: -1 });

  res.status(200).json({
    count: notifications.length,
    notifications,
  });
});
