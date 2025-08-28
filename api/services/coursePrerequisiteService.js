const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const CoursePrerequisite = require("../models/coursePrerequisiteModel");

/**
 * @desc    Create a course prerequisite
 * @route   POST /api/v1/course-prerequisites
 * @access  Private (Admin)
 */
exports.createCoursePrerequisite = asyncHandler(async (req, res, next) => {
  const { course, prerequisite, isRequired, minimumGrade } = req.body;

  // Check if course and prerequisite are the same
  if (course === prerequisite) {
    return next(
      new ApiError("A course cannot be a prerequisite for itself", 400)
    );
  }

  const prerequisiteObj = await CoursePrerequisite.create({
    course,
    prerequisite,
    isRequired: isRequired !== undefined ? isRequired : true,
    minimumGrade: minimumGrade || "Pass",
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: prerequisiteObj,
  });
});

/**
 * @desc    Get all prerequisites for a course
 * @route   GET /api/v1/courses/:courseId/prerequisites
 * @access  Public
 */
exports.getCoursePrerequisites = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const prerequisites = await CoursePrerequisite.find({ course: courseId })
    .populate("prerequisite")
    .populate("createdBy", "name");

  res.status(200).json({
    status: "success",
    results: prerequisites.length,
    data: prerequisites,
  });
});
