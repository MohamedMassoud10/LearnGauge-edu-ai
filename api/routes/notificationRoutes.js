const express = require("express");
const {
  getNotificationValidator,
  createNotificationValidator,
  updateNotificationValidator,
  deleteNotificationValidator,
} = require("../utils/validators/notificationValidator");

const {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  getUserNotifications,
  markAllAsRead,
} = require("../services/notificationService");

const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect);
router.get("/my-notifications", getUserNotifications);

router.put("/mark-all-as-read", markAllAsRead);
router
  .route("/")
  .get(getNotifications)
  .post(
    authService.allowedTO("manager", "student", "instructor", "admin"),
    createNotificationValidator,
    createNotification
  );

router
  .route("/:id")
  .get(getNotificationValidator, getNotification)
  .put(updateNotificationValidator, updateNotification)
  .delete(deleteNotificationValidator, deleteNotification);

module.exports = router;
