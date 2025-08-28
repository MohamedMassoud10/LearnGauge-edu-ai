const { default: slugify } = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getCourseValidator = [
  check("id").isMongoId().withMessage("Invalid course id"),
  validatorMiddleware,
];

exports.createCourseValidator = [
  check("name")
    .notEmpty()
    .withMessage("Course name is required")
    .isLength({ min: 3 })
    .withMessage("Too short course name")
    .isLength({ max: 100 })
    .withMessage("Too long course name")
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("code")
    .trim()
    .notEmpty()
    .withMessage("Course code is required")
    .isLength({ max: 10 })
    .withMessage("Too long course code"),

  check("department")
    .notEmpty()
    .withMessage("Department is required")
    .isString()
    .withMessage("Department must be a string")
    .trim(),

  check("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  check("duration")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Duration must be a positive integer"),
  validatorMiddleware,
];

exports.updateCourseValidator = [
  check("id").isMongoId().withMessage("Invalid course id"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short course name")
    .isLength({ max: 100 })
    .withMessage("Too long course name")
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Course code is required")
    .isLength({ max: 5 })
    .withMessage("Too long course code"),

  body("department")
    .optional()
    .isString()
    .withMessage("Department must be a string")
    .trim(),

  body("instructor")
    .optional()
    .isMongoId()
    .withMessage("Invalid instructor ID"),

  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  body("duration")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Duration must be a positive integer"),
  validatorMiddleware,
];

exports.deleteCourseValidator = [
  check("id").isMongoId().withMessage("Invalid course id"),
  validatorMiddleware,
];
