const mongoose = require("mongoose");

const semesterCourseSchema = new mongoose.Schema(
  {
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
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    capacity: {
      type: Number,
      required: [true, "Course capacity is required"],
      min: 1,
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    waitlistCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    waitlistCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Admin ID is required"],
    },
  },
  { timestamps: true }
);

// Ensure no duplicate course offerings in the same semester
semesterCourseSchema.index(
  { course: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

const SemesterCourse = mongoose.model("SemesterCourse", semesterCourseSchema);

module.exports = SemesterCourse;
