const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createCoursePrerequisiteValidator = [
  check("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID format"),
  check("prerequisite")
    .notEmpty()
    .withMessage("Prerequisite course ID is required")
    .isMongoId()
    .withMessage("Invalid prerequisite course ID format"),
  check("isRequired")
    .optional()
    .isBoolean()
    .withMessage("isRequired must be a boolean value"),
  check("minimumGrade")
    .optional()
    .isIn(["A", "B", "C", "D", "F", "Pass"])
    .withMessage("Invalid grade value"),
  validatorMiddleware,
];

exports.getCoursePrerequisitesValidator = [
  check("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID format"),
  validatorMiddleware,
];

exports.addCourseToSemesterValidator = [
  check("course")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID format"),
  check("semester")
    .notEmpty()
    .withMessage("Semester number is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),
  check("isRequired")
    .optional()
    .isBoolean()
    .withMessage("isRequired must be a boolean value"),
  check("department").notEmpty().withMessage("Department is required"),
  validatorMiddleware,
];

exports.getSemesterCoursesValidator = [
  check("semester")
    .notEmpty()
    .withMessage("Semester number is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),
  validatorMiddleware,
];

exports.registerCourseValidator = [
  check("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID format"),
  check("semester")
    .notEmpty()
    .withMessage("Semester number is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),
  check("academicYear").notEmpty().withMessage("Academic year is required"),
  validatorMiddleware,
];

exports.updateCourseRegistrationValidator = [
  check("id")
    .notEmpty()
    .withMessage("Registration ID is required")
    .isMongoId()
    .withMessage("Invalid registration ID format"),
  check("status")
    .optional()
    .isIn(["pending", "approved", "rejected", "completed", "dropped"])
    .withMessage("Invalid status value"),
  check("grade")
    .optional()
    .isIn(["A", "B", "C", "D", "F", "IP", "W", ""])
    .withMessage("Invalid grade value"),
  validatorMiddleware,
];

exports.getStudentRegistrationsValidator = [
  check("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid student ID format"),
  validatorMiddleware,
];

exports.getSuggestedCoursesValidator = [
  check("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid student ID format"),
  validatorMiddleware,
];

exports.autoRegisterFirstSemesterCoursesValidator = [
  check("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid student ID format"),
  check("academicYear").notEmpty().withMessage("Academic year is required"),
  validatorMiddleware,
];
