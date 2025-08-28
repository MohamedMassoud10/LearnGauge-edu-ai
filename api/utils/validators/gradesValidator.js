const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
const Courses = require("../../models/coursesModel");

exports.createGradeValidator = [
  check("student")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid student ID format")
    .custom(async (val) => {
      const student = await User.findById(val);
      if (!student) {
        throw new Error("Student not found");
      }
      if (student.role !== "student") {
        throw new Error("User must be a student");
      }
      return true;
    }),
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
  check("midterm")
    .optional()
    .isNumeric()
    .withMessage("Midterm grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Midterm grade must be between 0 and 100"),
  check("final")
    .optional()
    .isNumeric()
    .withMessage("Final grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Final grade must be between 0 and 100"),
  check("assignments")
    .optional()
    .isNumeric()
    .withMessage("Assignments grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Assignments grade must be between 0 and 100"),
  check("quizzes")
    .optional()
    .isNumeric()
    .withMessage("Quizzes grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Quizzes grade must be between 0 and 100"),
  validatorMiddleware,
];

exports.updateGradeValidator = [
  check("id").isMongoId().withMessage("Invalid grade ID format"),
  check("midterm")
    .optional()
    .isNumeric()
    .withMessage("Midterm grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Midterm grade must be between 0 and 100"),
  check("final")
    .optional()
    .isNumeric()
    .withMessage("Final grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Final grade must be between 0 and 100"),
  check("assignments")
    .optional()
    .isNumeric()
    .withMessage("Assignments grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Assignments grade must be between 0 and 100"),
  check("quizzes")
    .optional()
    .isNumeric()
    .withMessage("Quizzes grade must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Quizzes grade must be between 0 and 100"),
  validatorMiddleware,
];

exports.getGradeValidator = [
  check("id").isMongoId().withMessage("Invalid grade ID format"),
  validatorMiddleware,
];

exports.deleteGradeValidator = [
  check("id").isMongoId().withMessage("Invalid grade ID format"),
  validatorMiddleware,
];
