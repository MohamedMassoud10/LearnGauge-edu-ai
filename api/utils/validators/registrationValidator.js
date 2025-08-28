const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.courseRegistrationValidator = [
  check("studentId")
    .optional()
    .isMongoId()
    .withMessage("Invalid student ID format"),

  check("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID format"),

  check("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),

  check("academicYear")
    .notEmpty()
    .withMessage("Academic year is required")
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in the format YYYY-YYYY"),

  validatorMiddleware,
];

exports.updateRegistrationValidator = [
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

exports.semesterCourseValidator = [
  check("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid course ID format"),

  check("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),

  check("isRequired")
    .optional()
    .isBoolean()
    .withMessage("isRequired must be a boolean value"),

  check("department")
    .notEmpty()
    .withMessage("Department is required")
    .isString()
    .withMessage("Department must be a string"),

  validatorMiddleware,
];

exports.gpaRuleValidator = [
  check("minGPA")
    .notEmpty()
    .withMessage("Minimum GPA is required")
    .isFloat({ min: 0, max: 4.0 })
    .withMessage("Minimum GPA must be between 0 and 4.0"),

  check("maxGPA")
    .notEmpty()
    .withMessage("Maximum GPA is required")
    .isFloat({ min: 0, max: 4.0 })
    .withMessage("Maximum GPA must be between 0 and 4.0")
    .custom((value, { req }) => {
      if (value <= req.body.minGPA) {
        throw new Error("Maximum GPA must be greater than minimum GPA");
      }
      return true;
    }),

  check("maxCreditHours")
    .notEmpty()
    .withMessage("Maximum credit hours is required")
    .isInt({ min: 3, max: 24 })
    .withMessage("Maximum credit hours must be between 3 and 24"),

  validatorMiddleware,
];

exports.levelProgressionValidator = [
  check("fromLevel")
    .notEmpty()
    .withMessage("From level is required")
    .isInt({ min: 1, max: 7 })
    .withMessage("From level must be between 1 and 7"),

  check("toLevel")
    .notEmpty()
    .withMessage("To level is required")
    .isInt({ min: 2, max: 8 })
    .withMessage("To level must be between 2 and 8")
    .custom((value, { req }) => {
      if (value <= req.body.fromLevel) {
        throw new Error("To level must be greater than from level");
      }
      return true;
    }),

  check("requiredCreditHours")
    .notEmpty()
    .withMessage("Required credit hours is required")
    .isInt({ min: 0 })
    .withMessage("Required credit hours must be a positive number"),

  check("requiredGPA")
    .notEmpty()
    .withMessage("Required GPA is required")
    .isFloat({ min: 0, max: 4.0 })
    .withMessage("Required GPA must be between 0 and 4.0"),

  validatorMiddleware,
];

exports.autoRegisterValidator = [
  check("academicYear")
    .notEmpty()
    .withMessage("Academic year is required")
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in the format YYYY-YYYY"),

  validatorMiddleware,
];
