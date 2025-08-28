const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Courses = require("../../models/coursesModel");

exports.createQuizValidator = [
  check("title")
    .notEmpty()
    .withMessage("Quiz title is required")
    .isLength({ min: 3 })
    .withMessage("Quiz title must be at least 3 characters"),
  check("description").optional(),
  check("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID format")
    .custom(async (val) => {
      const course = await Courses.findById(val);
      if (!course) {
        throw new Error("Course not found");
      }
      return true;
    }),
  check("questions")
    .isArray()
    .withMessage("Questions must be an array")
    .custom((questions) => {
      if (questions.length === 0) {
        throw new Error("Quiz must have at least one question");
      }

      // Validate each question
      questions.forEach((question, index) => {
        if (!question.text) {
          throw new Error(`Question ${index + 1} must have text`);
        }
        if (!Array.isArray(question.options) || question.options.length < 2) {
          throw new Error(`Question ${index + 1} must have at least 2 options`);
        }
        if (
          question.correctAnswer === undefined ||
          question.correctAnswer < 0 ||
          question.correctAnswer >= question.options.length
        ) {
          throw new Error(
            `Question ${index + 1} must have a valid correct answer`
          );
        }
      });

      return true;
    }),
  check("duration")
    .notEmpty()
    .withMessage("Quiz duration is required")
    .isNumeric()
    .withMessage("Duration must be a number")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 minute"),
  check("isAIGenerated")
    .optional()
    .isBoolean()
    .withMessage("isAIGenerated must be a boolean"),
  check("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  check("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateQuizValidator = [
  check("id").isMongoId().withMessage("Invalid quiz ID format"),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Quiz title must be at least 3 characters"),
  check("questions")
    .optional()
    .isArray()
    .withMessage("Questions must be an array")
    .custom((questions) => {
      if (questions.length === 0) {
        throw new Error("Quiz must have at least one question");
      }

      // Validate each question
      questions.forEach((question, index) => {
        if (!question.text) {
          throw new Error(`Question ${index + 1} must have text`);
        }
        if (!Array.isArray(question.options) || question.options.length < 2) {
          throw new Error(`Question ${index + 1} must have at least 2 options`);
        }
        if (
          question.correctAnswer === undefined ||
          question.correctAnswer < 0 ||
          question.correctAnswer >= question.options.length
        ) {
          throw new Error(
            `Question ${index + 1} must have a valid correct answer`
          );
        }
      });

      return true;
    }),
  check("duration")
    .optional()
    .isNumeric()
    .withMessage("Duration must be a number")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 minute"),
  check("isAIGenerated")
    .optional()
    .isBoolean()
    .withMessage("isAIGenerated must be a boolean"),
  check("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  check("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (
        req.body.startDate &&
        new Date(endDate) <= new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.getQuizValidator = [
  check("id").isMongoId().withMessage("Invalid quiz ID format"),
  validatorMiddleware,
];

exports.deleteQuizValidator = [
  check("id").isMongoId().withMessage("Invalid quiz ID format"),
  validatorMiddleware,
];
