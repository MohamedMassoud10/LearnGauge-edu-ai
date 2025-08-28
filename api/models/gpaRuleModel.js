const mongoose = require("mongoose");

const gpaRuleSchema = new mongoose.Schema(
  {
    minGPA: {
      type: Number,
      required: [true, "Minimum GPA is required"],
      min: 0,
      max: 4.0,
    },
    maxGPA: {
      type: Number,
      required: [true, "Maximum GPA is required"],
      min: 0,
      max: 4.0,
    },
    maxCreditHours: {
      type: Number,
      required: [true, "Maximum credit hours is required"],
      min: 3,
      max: 24,
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

// Ensure GPA ranges don't overlap
gpaRuleSchema.pre("save", async function (next) {
  const overlappingRule = await this.constructor.findOne({
    _id: { $ne: this._id },
    $or: [
      { minGPA: { $lte: this.minGPA }, maxGPA: { $gte: this.minGPA } },
      { minGPA: { $lte: this.maxGPA }, maxGPA: { $gte: this.maxGPA } },
      { minGPA: { $gte: this.minGPA }, maxGPA: { $lte: this.maxGPA } },
    ],
  });

  if (overlappingRule) {
    const error = new Error("GPA range overlaps with an existing rule");
    return next(error);
  }

  next();
});

const GPARule = mongoose.model("GPARule", gpaRuleSchema);

module.exports = GPARule;
