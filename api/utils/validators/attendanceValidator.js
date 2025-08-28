const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
const Courses = require("../../models/coursesModel");
const Lectures = require("../../models/lecturesModel");

exports.createAttendanceValidator = [
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
  check("lecture")
    .notEmpty()
    .withMessage("Lecture ID is required")
    .isMongoId()
    .withMessage("Invalid lecture ID format")
    .custom(async (val, { req }) => {
      const lecture = await Lectures.findById(val);
      if (!lecture) {
        throw new Error("Lecture not found");
      }

      // Verify lecture belongs to the specified course
      if (req.body.course && lecture.course.toString() !== req.body.course) {
        throw new Error("Lecture does not belong to the specified course");
      }

      return true;
    }),
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
  check("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["present", "absent", "late", "excused"])
    .withMessage("Status must be one of: present, absent, late, excused"),
  check("date").optional().isISO8601().withMessage("Date must be a valid date"),
  check("notes").optional().isString().withMessage("Notes must be a string"),
  validatorMiddleware,
];

exports.updateAttendanceValidator = [
  check("id").isMongoId().withMessage("Invalid attendance ID format"),
  check("status")
    .optional()
    .isIn(["present", "absent", "late", "excused"])
    .withMessage("Status must be one of: present, absent, late, excused"),
  check("date").optional().isISO8601().withMessage("Date must be a valid date"),
  check("notes").optional().isString().withMessage("Notes must be a string"),
  validatorMiddleware,
];

exports.getAttendanceValidator = [
  check("id").isMongoId().withMessage("Invalid attendance ID format"),
  validatorMiddleware,
];

exports.deleteAttendanceValidator = [
  check("id").isMongoId().withMessage("Invalid attendance ID format"),
  validatorMiddleware,
];
