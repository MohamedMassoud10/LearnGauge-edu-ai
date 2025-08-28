const Courses = require("../models/coursesModel");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

// @desc    Assign instructor to course
// @route   PUT /api/v1/courses/:id/assign-instructor
// @access  Private (Admin)
exports.assignInstructorToCourse = async (req, res, next) => {
  try {
    const { instructorId } = req.body;

    if (!instructorId) {
      return next(new ApiError("Instructor ID is required", 400));
    }

    // Verify instructor exists and has the instructor role
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return next(new ApiError("Instructor not found", 404));
    }

    if (instructor.role !== "instructor") {
      return next(new ApiError("User is not an instructor", 400));
    }

    // Update the course with the new instructor
    const course = await Courses.findByIdAndUpdate(
      req.params.id,
      { instructor: instructorId },
      { new: true, runValidators: true }
    );

    if (!course) {
      return next(new ApiError(`No course found for id ${req.params.id}`, 404));
    }

    res.status(200).json({
      status: "success",
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get courses assigned to an instructor
// @route   GET /api/v1/instructors/:instructorId/courses
// @access  Private (Admin, Instructor - only their own)
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId;

    // Verify instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return next(
        new ApiError("Instructor not found or user is not an instructor", 404)
      );
    }

    // If instructor, verify they are requesting their own courses
    if (
      req.user.role === "instructor" &&
      req.user._id.toString() !== instructorId
    ) {
      return next(
        new ApiError(
          "You are not authorized to view courses for this instructor",
          403
        )
      );
    }

    const courses = await Courses.find({ instructor: instructorId });

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all instructors with their assigned courses
// @route   GET /api/v1/instructors-with-courses
// @access  Private (Admin)
exports.getInstructorsWithCourses = async (req, res, next) => {
  try {
    // Get all instructors
    const instructors = await User.find({ role: "instructor" });

    // For each instructor, get their courses
    const instructorsWithCourses = await Promise.all(
      instructors.map(async (instructor) => {
        const courses = await Courses.find({ instructor: instructor._id });
        return {
          _id: instructor._id,
          name: instructor.name,
          email: instructor.email,
          courses,
        };
      })
    );

    res.status(200).json({
      status: "success",
      results: instructorsWithCourses.length,
      data: instructorsWithCourses,
    });
  } catch (err) {
    next(err);
  }
};
