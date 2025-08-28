const express = require("express");
const {
  assignInstructorToCourse,
  getInstructorCourses,
  getInstructorsWithCourses,
} = require("../services/courseAssignmentService");
const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect);

// Assign instructor to course
router.put(
  "/courses/:id/assign-instructor",
  authService.allowedTO("admin"),
  assignInstructorToCourse
);

// Get courses assigned to an instructor
router.get(
  "/instructors/:instructorId/courses",
  authService.allowedTO("admin", "instructor"),
  getInstructorCourses
);

// Get all instructors with their assigned courses
router.get(
  "/instructors-with-courses",
  authService.allowedTO("admin"),
  getInstructorsWithCourses
);

module.exports = router;
