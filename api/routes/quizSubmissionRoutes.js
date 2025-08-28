const express = require("express");

const {
  createQuizSubmissionValidator,
  updateQuizSubmissionValidator,
  getQuizSubmissionValidator,
  deleteQuizSubmissionValidator,
} = require("../utils/validators/quizSubmissionValidator");

const {
  getQuizSubmissions,
  getQuizSubmission,
  createQuizSubmission,
  updateQuizSubmission,
  deleteQuizSubmission,
  getSubmissionsForQuiz,
  getSubmissionsForStudent,
} = require("../services/quizSubmissionService");

const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

router.use(authService.protect);

router
  .route("/")
  .get(
    authService.allowedTO("admin", "instructor", "student"),
    getQuizSubmissions
  )
  .post(
    authService.allowedTO("student"),
    createQuizSubmissionValidator,
    createQuizSubmission
  );

router
  .route("/:id")
  .get(getQuizSubmissionValidator, getQuizSubmission)
  .put(
    authService.allowedTO("admin", "instructor"),
    updateQuizSubmissionValidator,
    updateQuizSubmission
  )
  .delete(
    authService.allowedTO("admin"),
    deleteQuizSubmissionValidator,
    deleteQuizSubmission
  );

// Nested routes
// GET /api/v1/quizzes/:quizId/submissions
router.get(
  "/quizzes/:quizId/submissions",
  authService.allowedTO("admin", "instructor", "student"),
  getSubmissionsForQuiz
);

// GET /api/v1/students/:studentId/submissions
router.get(
  "/students/:studentId/submissions",
  authService.allowedTO("admin", "instructor", "student"),
  getSubmissionsForStudent
);

module.exports = router;
