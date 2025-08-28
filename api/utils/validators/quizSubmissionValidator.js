const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Quiz = require("../../models/quizModel");
const User = require("../../models/userModel");

exports.createQuizSubmissionValidator = [
  check("quiz")
    .notEmpty()
    .withMessage("Quiz ID is required")
    .isMongoId()
    .withMessage("Invalid quiz ID format")
    .custom(async (val) => {
      const quiz = await Quiz.findById(val);
      if (!quiz) {
        throw new Error("Quiz not found");
      }

      // Check if quiz is active
      if (!quiz.isActive) {
        throw new Error("Quiz is not active");
      }

      // Check if quiz is within the valid time period
      const now = new Date();
      if (now < quiz.startDate) {
        throw new Error("Quiz has not started yet");
      }
      if (now > quiz.endDate) {
        throw new Error("Quiz has already ended");
      }

      return true;
    }),
  check("answers").isArray().withMessage("Answers must be an array"),
  validatorMiddleware,
];

exports.updateQuizSubmissionValidator = [
  check("id").isMongoId().withMessage("Invalid submission ID format"),
  check("answers").optional().isArray().withMessage("Answers must be an array"),
  check("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
  validatorMiddleware,
];

exports.getQuizSubmissionValidator = [
  check("id").isMongoId().withMessage("Invalid submission ID format"),
  validatorMiddleware,
];

exports.deleteQuizSubmissionValidator = [
  check("id").isMongoId().withMessage("Invalid submission ID format"),
  validatorMiddleware,
];
