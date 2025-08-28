const mongoose = require("mongoose");

const gradesSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Grade must be associated with a student"],
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Courses",
      required: [true, "Grade must be associated with a course"],
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Grade must be associated with an instructor"],
    },
    midterm: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    final: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    assignments: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quizzes: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    totalGrade: {
      type: Number,
      min: 0,
      max: 100,
    },
    letterGrade: {
      type: String,
      enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"],
    },
  },
  { timestamps: true }
);

// Compound index to ensure a student has only one grade record per course
gradesSchema.index({ student: 1, course: 1 }, { unique: true });

const Grades = mongoose.model("Grades", gradesSchema);

module.exports = Grades;
