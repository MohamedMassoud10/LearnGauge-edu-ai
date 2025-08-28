const mongoose = require("mongoose");

const studentCourseRegistrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Courses",
      required: [true, "Course ID is required"],
    },
    semester: {
      type: Number,
      required: [true, "Semester number is required"],
      min: 1,
      max: 8,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      match: [/^\d{4}-\d{4}$/, "Academic year must be in the format YYYY-YYYY"],
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "waitlisted",
        "dropped",
        "completed",
      ],
      default: "pending",
    },
    grade: {
      type: String,
      enum: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", ""],
      default: "",
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure a student can't register for the same course in the same semester
studentCourseRegistrationSchema.index(
  { student: 1, course: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

const StudentCourseRegistration = mongoose.model(
  "StudentCourseRegistration",
  studentCourseRegistrationSchema
);

module.exports = StudentCourseRegistration;
