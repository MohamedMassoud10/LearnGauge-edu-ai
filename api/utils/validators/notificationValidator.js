const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID format"),
  validatorMiddleware,
];

exports.createNotificationValidator = [
  check("title").notEmpty().withMessage("Title is required"),
  check("message").notEmpty().withMessage("Message is required"),
  check("recipient")
    .optional()
    .isMongoId()
    .withMessage("Invalid recipient ID format"),
  check("role")
    .optional()
    .isIn(["manager", "student", "instructor", "admin"])
    .withMessage("Invalid role"),
  check("allUsers").optional().isBoolean(),
  validatorMiddleware,
];

exports.updateNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID format"),
  validatorMiddleware,
];

exports.deleteNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID format"),
  validatorMiddleware,
];
