const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Courses = require("../models/coursesModel");
const User = require("../models/userModel");
const GPARule = require("../models/gpaRuleModel");
const LevelProgression = require("../models/levelProgressionModel");
const CoursePrerequisite = require("../models/coursePrerequisiteModel");
const enrollmentService = require("./enrollmentService");

/**
 * @desc    Create a new course
 * @route   POST /api/v1/admin/registration/courses
 * @access  Private (Admin)
 */
exports.createCourse = asyncHandler(async (req, res, next) => {
  const {
    name,
    code,
    description,
    creditHours,
    academicLevel,
    courseType,
    majors,
    department,
    instructorId,
  } = req.body;

  // Check if course code already exists
  const existingCourse = await Courses.findOne({ code });
  if (existingCourse) {
    return next(new ApiError("Course code already exists", 400));
  }

  // Check if instructor exists and is an instructor
  if (instructorId) {
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return next(new ApiError("Instructor not found", 404));
    }

    if (instructor.role !== "instructor") {
      return next(new ApiError("The specified user is not an instructor", 400));
    }
  }

  // Create course
  const course = await Courses.create({
    name,
    code,
    description,
    creditHours: creditHours || 3,
    academicLevel: academicLevel || 1,
    courseType: courseType || "core",
    majors: majors || ["General"],
    department,
    instructor: instructorId,
  });

  res.status(201).json({
    status: "success",
    data: course,
  });
});

/**
 * @desc    Update a course
 * @route   PUT /api/v1/admin/registration/courses/:id
 * @access  Private (Admin)
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    code,
    description,
    creditHours,
    academicLevel,
    courseType,
    majors,
    department,
    instructorId,
    isActive,
  } = req.body;

  // Check if course exists
  const course = await Courses.findById(id);
  if (!course) {
    return next(new ApiError("Course not found", 404));
  }

  // Check if new code already exists (if changing code)
  if (code && code !== course.code) {
    const existingCourse = await Courses.findOne({ code });
    if (existingCourse) {
      return next(new ApiError("Course code already exists", 400));
    }
  }

  // Check if instructor exists and is an instructor
  if (instructorId) {
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return next(new ApiError("Instructor not found", 404));
    }

    if (instructor.role !== "instructor") {
      return next(new ApiError("The specified user is not an instructor", 400));
    }
  }

  // Update course
  const updatedCourse = await Courses.findByIdAndUpdate(
    id,
    {
      name,
      code,
      description,
      creditHours,
      academicLevel,
      courseType,
      majors,
      department,
      instructor: instructorId,
      isActive,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedCourse,
  });
});

/**
 * @desc    Add a prerequisite to a course
 * @route   POST /api/v1/admin/registration/courses/:courseId/prerequisites
 * @access  Private (Admin)
 */
exports.addPrerequisite = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { prerequisiteId, isRequired, minimumGrade, description } = req.body;

  // Check if course exists
  const course = await Courses.findById(courseId);
  if (!course) {
    return next(new ApiError("Course not found", 404));
  }

  // Check if prerequisite course exists
  const prerequisite = await Courses.findById(prerequisiteId);
  if (!prerequisite) {
    return next(new ApiError("Prerequisite course not found", 404));
  }

  // Check if prerequisite already exists
  const existingPrereq = await CoursePrerequisite.findOne({
    course: courseId,
    prerequisite: prerequisiteId,
  });

  if (existingPrereq) {
    return next(
      new ApiError("This prerequisite already exists for this course", 400)
    );
  }

  // Create prerequisite
  const coursePrerequisite = await CoursePrerequisite.create({
    course: courseId,
    prerequisite: prerequisiteId,
    isRequired: isRequired !== undefined ? isRequired : true,
    minimumGrade: minimumGrade || "D",
    description,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: coursePrerequisite,
  });
});

/**
 * @desc    Create a GPA rule
 * @route   POST /api/v1/admin/registration/gpa-rules
 * @access  Private (Admin)
 */
exports.createGPARule = asyncHandler(async (req, res, next) => {
  const { minGPA, maxGPA, maxCreditHours, description } = req.body;

  // Check for overlapping GPA ranges
  const overlappingRule = await GPARule.findOne({
    $or: [
      { minGPA: { $lte: minGPA }, maxGPA: { $gte: minGPA } },
      { minGPA: { $lte: maxGPA }, maxGPA: { $gte: maxGPA } },
      { minGPA: { $gte: minGPA }, maxGPA: { $lte: maxGPA } },
    ],
  });

  if (overlappingRule) {
    return next(new ApiError("GPA range overlaps with an existing rule", 400));
  }

  // Create GPA rule
  const gpaRule = await GPARule.create({
    minGPA,
    maxGPA,
    maxCreditHours,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: gpaRule,
  });
});

/**
 * @desc    Get all GPA rules
 * @route   GET /api/v1/admin/registration/gpa-rules
 * @access  Private (Admin)
 */
exports.getGPARules = asyncHandler(async (req, res, next) => {
  const gpaRules = await GPARule.find().sort({ minGPA: 1 });

  res.status(200).json({
    status: "success",
    results: gpaRules.length,
    data: gpaRules,
  });
});

/**
 * @desc    Create a level progression rule
 * @route   POST /api/v1/admin/registration/level-progressions
 * @access  Private (Admin)
 */
exports.createLevelProgression = asyncHandler(async (req, res, next) => {
  const { fromLevel, toLevel, requiredCreditHours, requiredGPA, description } =
    req.body;

  // Check if progression already exists
  const existingProgression = await LevelProgression.findOne({
    fromLevel,
    toLevel,
  });

  if (existingProgression) {
    return next(
      new ApiError(
        `Progression from level ${fromLevel} to ${toLevel} already exists`,
        400
      )
    );
  }

  // Validate that toLevel is greater than fromLevel
  if (toLevel <= fromLevel) {
    return next(new ApiError("To level must be greater than from level", 400));
  }

  // Create level progression
  const levelProgression = await LevelProgression.create({
    fromLevel,
    toLevel,
    requiredCreditHours,
    requiredGPA,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: levelProgression,
  });
});

/**
 * @desc    Get all level progression rules
 * @route   GET /api/v1/admin/registration/level-progressions
 * @access  Private (Admin)
 */
exports.getLevelProgressions = asyncHandler(async (req, res, next) => {
  const levelProgressions = await LevelProgression.find().sort({
    fromLevel: 1,
    toLevel: 1,
  });

  res.status(200).json({
    status: "success",
    results: levelProgressions.length,
    data: levelProgressions,
  });
});

/**
 * @desc    Update a student's academic level
 * @route   PUT /api/v1/admin/registration/students/:studentId/level
 * @access  Private (Admin)
 */
exports.updateStudentLevel = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { academicLevel, forceUpdate } = req.body;

  // Check if student exists
  const student = await User.findById(studentId);
  if (!student) {
    return next(new ApiError("Student not found", 404));
  }

  // If not forcing update, check if student meets requirements for the new level
  if (!forceUpdate && academicLevel > student.academicLevel) {
    // Check each level progression
    let currentLevel = student.academicLevel;

    while (currentLevel < academicLevel) {
      const progressionRule = await LevelProgression.findOne({
        fromLevel: currentLevel,
        toLevel: currentLevel + 1,
      });

      if (!progressionRule) {
        return next(
          new ApiError(
            `No progression rule found from level ${currentLevel} to ${
              currentLevel + 1
            }`,
            400
          )
        );
      }

      // Check credit hours
      if (student.completedCreditHours < progressionRule.requiredCreditHours) {
        return next(
          new ApiError(
            `Student does not have enough credit hours to progress to level ${
              currentLevel + 1
            }. Needs ${progressionRule.requiredCreditHours}, has ${
              student.completedCreditHours
            }`,
            400
          )
        );
      }

      // Check GPA
      const gpa =
        student.gpa || (await enrollmentService.calculateStudentGPA(studentId));
      if (gpa < progressionRule.requiredGPA) {
        return next(
          new ApiError(
            `Student's GPA is too low to progress to level ${
              currentLevel + 1
            }. Needs ${progressionRule.requiredGPA}, has ${gpa}`,
            400
          )
        );
      }

      currentLevel++;
    }
  }

  // Update student's level
  const updatedStudent = await User.findByIdAndUpdate(
    studentId,
    { academicLevel },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedStudent,
  });
});
