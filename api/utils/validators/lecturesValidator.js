const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID"),
  validatorMiddleware,
];

exports.createLectureValidator = [
  check("course").isMongoId().withMessage("Invalid course ID"),

  check("instructor").isMongoId().withMessage("Invalid instructor ID"),

  check("pdf")
    .notEmpty()
    .withMessage("Lecture PDF is required")
    .isURL()
    .withMessage("Invalid PDF URL"),

  check("video").optional().isURL().withMessage("Invalid video URL"),

  check("audio").optional().isURL().withMessage("Invalid audio URL"),

  validatorMiddleware,
];

exports.updateLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID"),

  check("instructor")
    .optional()
    .isMongoId()
    .withMessage("Invalid instructor ID"),

  check("pdf").optional().isURL().withMessage("Invalid PDF URL"),

  check("video").optional().isURL().withMessage("Invalid video URL"),

  check("audio").optional().isURL().withMessage("Invalid audio URL"),

  validatorMiddleware,
];

exports.deleteLectureValidator = [
  check("id").isMongoId().withMessage("Invalid lecture ID"),
  validatorMiddleware,
];
