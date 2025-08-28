const mongoose = require("mongoose");

const quizSubmissionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: "Quiz",
      required: [true, "Submission must be associated with a quiz"],
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Submission must be associated with a student"],
    },
    answers: [
      {
        questionIndex: Number,
        selectedOption: Number,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number, // Time spent in minutes
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a student has only one submission per quiz
quizSubmissionSchema.index({ student: 1, quiz: 1 }, { unique: true });

const QuizSubmission = mongoose.model("QuizSubmission", quizSubmissionSchema);

module.exports = QuizSubmission;
