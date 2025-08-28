const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    major: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },
    academicLevel: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0,
      default: 0,
    },
    completedCreditHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    program: String,
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    creditHours: Number,
    department: String,
    phone: String,
    profileImg: String,

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["manager", "student", "instructor", "admin"],
      default: "admin",
    },
    active: {
      type: Boolean,
      default: true,
    },

    passedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
      },
    ],
    holds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Create slug before saving
userSchema.pre("save", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

//hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
