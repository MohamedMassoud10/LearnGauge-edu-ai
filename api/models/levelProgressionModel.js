const mongoose = require("mongoose");

const levelProgressionSchema = new mongoose.Schema(
  {
    fromLevel: {
      type: Number,
      required: [true, "From level is required"],
      min: 1,
      max: 7,
    },
    toLevel: {
      type: Number,
      required: [true, "To level is required"],
      min: 2,
      max: 8,
    },
    requiredCreditHours: {
      type: Number,
      required: [true, "Required credit hours is required"],
      min: 0,
    },
    requiredGPA: {
      type: Number,
      required: [true, "Required GPA is required"],
      min: 0,
      max: 4.0,
      default: 2.0,
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

// Validate that toLevel is greater than fromLevel
levelProgressionSchema.pre("validate", function (next) {
  if (this.toLevel <= this.fromLevel) {
    const error = new Error("To level must be greater than from level");
    return next(error);
  }
  next();
});

// Ensure no duplicate level progressions
levelProgressionSchema.index({ fromLevel: 1, toLevel: 1 }, { unique: true });

const LevelProgression = mongoose.model(
  "LevelProgression",
  levelProgressionSchema
);

module.exports = LevelProgression;
