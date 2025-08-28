const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    code: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    creditHours: {
      type: Number,
      required: [true, "Credit hours are required"],
      default: 3,
      min: 1,
      max: 6,
    },
    academicLevel: {
      type: Number,
      required: [true, "Academic level is required"],
      default: 1,
      min: 1,
      max: 8,
    },
    courseType: {
      type: String,
      required: [true, "Course type is required"],
      enum: ["core", "elective"],
      default: "elective",
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    duration: {
      type: Number,
      default: 1,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    majors: {
      type: [String],
      default: ["General"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Courses = mongoose.model("Courses", coursesSchema);

module.exports = Courses;
