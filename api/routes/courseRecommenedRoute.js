const express = require("express");
const courseRecommenedService = require("../services/courseRecommenedService");
const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

// Apply authentication middleware to all routes
router.use(authService.protect);

// Student course suggestions and auto-registration
// @desc    Get suggested courses for a student
// @route   GET /api/v1/:studentId/suggested-courses
// @access  Private (Student, Admin)
router
  .route("/:studentId/suggested-courses")
  .get(
    authService.allowedTO("admin"),
    courseRecommenedService.getSuggestedCourses
  );

router
  .route("/suggested-courses")
  .get(
    authService.allowedTO("admin", "student"),
    courseRecommenedService.getSuggestedCourses
  );

module.exports = router;
