const express = require("express");

const {
  createQuizValidator,
  updateQuizValidator,
  getQuizValidator,
  deleteQuizValidator,
} = require("../utils/validators/quizValidator");

const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesForCourse,
  generateQuizWithAI,
} = require("../services/quizService");

const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

// Public routes
router.get("/", getQuizzes);
router.get("/:id", getQuizValidator, getQuiz);

// Protected routes
router.use(authService.protect);

router.post(
  "/",
  authService.allowedTO("admin", "instructor"),
  createQuizValidator,
  createQuiz
);

router
  .route("/:id")
  .put(
    authService.allowedTO("admin", "instructor"),
    updateQuizValidator,
    updateQuiz
  )
  .delete(
    authService.allowedTO("admin", "instructor"),
    deleteQuizValidator,
    deleteQuiz
  );

// Nested routes
// GET /api/v1/courses/:courseId/quizzes
router.get("/courses/:courseId/quizzes", getQuizzesForCourse);

// POST /api/v1/courses/:courseId/generate-quiz
router.post(
  "/courses/:courseId/generate-quiz",
  authService.allowedTO("admin", "instructor"),
  generateQuizWithAI
);

module.exports = router;
