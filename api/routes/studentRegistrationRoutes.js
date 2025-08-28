const express = require("express");
const courseRegistrationService = require("../services/courseRegistrationService");
const authService = require("../services/authService");

const router = express.Router();

// Protect all routes
router.use(authService.protect);

// Student registration routes
// @desc    Get suggested courses for registration
// @route   GET /api/v1/student-registration/suggested-courses
// @access  Private (Student)
router.route("/suggested-courses").get(
  authService.allowedTO("student"),
  (req, res, next) => {
    req.params.studentId = req.user._id;
    next();
  },
  courseRegistrationService.getSuggestedCourses
);

// @desc    Get student's course registrations
// @route   GET /api/v1/student-registration/my-registrations
// @access  Private (Student)
router.route("/my-registrations").get(
  authService.allowedTO("student"),
  (req, res, next) => {
    req.params.studentId = req.user._id;
    next();
  },
  courseRegistrationService.getStudentRegistrations
);

// @desc    Register for a course
// @route   POST /api/v1/student-registration/register-course
// @access  Private (Student)
router.route("/register-course").post(
  authService.allowedTO("student"),
  (req, res, next) => {
    req.body.studentId = req.user._id;
    next();
  },
  courseRegistrationService.registerCourse
);

module.exports = router;
