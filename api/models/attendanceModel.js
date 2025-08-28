const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Courses",
      required: [true, "Attendance must be associated with a course"],
    },
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: "Lectures",
      required: [true, "Attendance must be associated with a lecture"],
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Attendance must be associated with a student"],
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Attendance must be associated with an instructor"],
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "absent",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a student has only one attendance record per lecture
attendanceSchema.index({ student: 1, lecture: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
