const express = require("express");
const {
  generateQuizFromPDF,
  saveGeneratedQuiz,
} = require("../services/quizGeneratorService");

const authService = require("../services/authService");

const router = express.Router();

router
  .route("/generate")
  .post(
    authService.protect,
    authService.allowedTO("admin", "instructor", "student"),
    generateQuizFromPDF
  );

router
  .route("/save")
  .post(
    authService.protect,
    authService.allowedTO("admin", "instructor", "student"),
    saveGeneratedQuiz
  );

module.exports = router;
