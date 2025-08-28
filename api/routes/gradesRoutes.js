const express = require("express");

const {
  createGradeValidator,
  updateGradeValidator,
  getGradeValidator,
  deleteGradeValidator,
} = require("../utils/validators/gradesValidator");

const {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradesForCourse,
  getGradesForStudent,
} = require("../services/gradesService");

const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

router.use(authService.protect);

router
  .route("/")
  .get(authService.allowedTO("admin", "instructor"), getGrades)
  .post(
    authService.allowedTO("admin", "instructor"),
    createGradeValidator,
    createGrade
  );

router
  .route("/:id")
  .get(getGradeValidator, getGrade)
  .put(
    authService.allowedTO("admin", "instructor"),
    updateGradeValidator,
    updateGrade
  )
  .delete(
    authService.allowedTO("admin", "instructor"),
    deleteGradeValidator,
    deleteGrade
  );

// Nested routes
// GET /api/v1/courses/:courseId/grades
router.get(
  "/courses/:courseId/grades",
  authService.allowedTO("admin", "instructor"),
  getGradesForCourse
);

// GET /api/v1/students/:studentId/grades
router.get(
  "/students/:studentId/grades",
  authService.allowedTO("admin", "instructor", "student"),
  getGradesForStudent
);

module.exports = router;
