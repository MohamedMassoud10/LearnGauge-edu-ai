const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createEmotionRecordValidator = [
  check("lectureName")
    .notEmpty()
    .withMessage("Lecture name is required")
    .isLength({ max: 100 })
    .withMessage("Lecture name cannot exceed 100 characters"),

  check("sessionData")
    .isArray({ min: 1 })
    .withMessage("Session data must be a non-empty array"),

  check("sessionData.*.faces")
    .isArray()
    .withMessage("Each session entry must have a faces array"),

  check("sessionData.*.timestamp")
    .isISO8601()
    .withMessage("Timestamp must be a valid ISO 8601 date"),

  check("sessionData.*.faces.*.id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Face ID must be a positive integer"),

  check("sessionData.*.faces.*.emotion")
    .optional()
    .isIn([
      "happy",
      "sad",
      "angry",
      "neutral",
      "surprised",
      "fearful",
      "disgusted",
      "contempt",
    ])
    .withMessage("Invalid emotion"),

  check("sessionData.*.faces.*.confidence")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Confidence must be between 0 and 1"),

  validatorMiddleware,
];

exports.getEmotionRecordsValidator = [
  check("lectureName")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Lecture name cannot exceed 100 characters"),

  validatorMiddleware,
];
