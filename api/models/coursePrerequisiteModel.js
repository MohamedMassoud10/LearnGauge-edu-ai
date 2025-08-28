const mongoose = require("mongoose");

const coursePrerequisiteSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Courses",
      required: [true, "Course ID is required"],
    },
    prerequisite: {
      type: mongoose.Schema.ObjectId,
      ref: "Courses",
      required: [true, "Prerequisite course ID is required"],
    },
    isRequired: {
      type: Boolean,
      default: true,
      description: "Whether this prerequisite is required or optional",
    },
    minimumGrade: {
      type: String,
      enum: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "Pass"],
      default: "D",
      description: "Minimum grade required to satisfy this prerequisite",
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Admin ID is required"],
    },
  },
  { timestamps: true }
);

// Ensure no duplicate prerequisites for the same course
coursePrerequisiteSchema.index(
  { course: 1, prerequisite: 1 },
  { unique: true }
);

// Prevent self-referential prerequisites
coursePrerequisiteSchema.pre("validate", function (next) {
  if (
    this.course &&
    this.prerequisite &&
    this.course.equals(this.prerequisite)
  ) {
    const error = new Error("A course cannot be a prerequisite for itself");
    return next(error);
  }
  next();
});

const CoursePrerequisite = mongoose.model(
  "CoursePrerequisite",
  coursePrerequisiteSchema
);

module.exports = CoursePrerequisite;
