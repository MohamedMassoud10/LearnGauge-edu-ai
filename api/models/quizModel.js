const mongoose = require("mongoose");
const slugify = require("slugify");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Question text is required"],
  },
  options: {
    type: [String],
    required: [true, "Question options are required"],
    validate: {
      validator: (options) => {
        return options.length >= 2; // At least 2 options required
      },
      message: "A question must have at least 2 options",
    },
  },
  correctAnswer: {
    type: Number, // Index of the correct option
    required: [true, "Correct answer is required"],
  },
  points: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Courses",
      required: [true, "Quiz must be associated with a course"],
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Quiz must be associated with an instructor"],
    },
    questions: [questionSchema],
    duration: {
      type: Number, // Duration in minutes
      required: [true, "Quiz duration is required"],
      min: 1,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, "Quiz start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Quiz end date is required"],
    },
  },
  { timestamps: true }
);

// Create slug from title
quizSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });

  // Calculate total points
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce(
      (sum, question) => sum + question.points,
      0
    );
  }

  next();
});

// Validate that end date is after start date
quizSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
