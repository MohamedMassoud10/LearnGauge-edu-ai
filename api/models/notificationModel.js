const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Notification title is required"],
  },
  message: {
    type: String,
    required: [true, "Notification message is required"],
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  role: {
    type: String,
    enum: ["manager", "student", "instructor", "admin"],
  },
  allUsers: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
