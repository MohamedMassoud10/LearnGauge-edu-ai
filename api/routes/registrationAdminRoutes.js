const express = require("express");
const adminService = require("../services/adminService");
const authService = require("../services/authService");

const router = express.Router();

// Protect all routes and restrict to admin
router.use(authService.protect);
router.use(authService.allowedTO("admin"));

// Course management for registration
router.route("/registration/courses").post(adminService.createCourse);

router.route("/registration/courses/:id").put(adminService.updateCourse);

router
  .route("/registration/courses/:courseId/prerequisites")
  .post(adminService.addPrerequisite);

// GPA rules for registration
router
  .route("/registration/gpa-rules")
  .post(adminService.createGPARule)
  .get(adminService.getGPARules);

// Level progression rules for registration
router
  .route("/registration/level-progressions")
  .post(adminService.createLevelProgression)
  .get(adminService.getLevelProgressions);

// Student academic level management
router
  .route("/registration/students/:studentId/level")
  .put(adminService.updateStudentLevel);

module.exports = router;
