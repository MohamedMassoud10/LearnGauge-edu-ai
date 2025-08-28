const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Courses = require("../models/coursesModel");
const SemesterCourse = require("../models/semesterCourseModel");

/**
 * @desc    Add a course to a semester
 * @route   POST /api/v1/semester-courses
 * @access  Private (Admin)
 */
exports.addCourseToSemester = asyncHandler(async (req, res, next) => {
  const { courseId, semester, isRequired, department } = req.body;

  // Check if course exists
  const course = await Courses.findById(courseId);
  if (!course) {
    return next(new ApiError("Course not found", 404));
  }

  // Check if course is already assigned to this semester
  const existingSemesterCourse = await SemesterCourse.findOne({
    course: courseId,
    semester,
  });

  if (existingSemesterCourse) {
    return next(
      new ApiError("This course is already assigned to this semester", 400)
    );
  }

  // Create semester course
  const semesterCourse = await SemesterCourse.create({
    course: courseId,
    semester,
    isRequired: isRequired !== undefined ? isRequired : true,
    department: department || course.department,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: semesterCourse,
  });
});

/**
 * @desc    Get all courses for a semester
 * @route   GET /api/v1/semester-courses/:semester
 * @access  Public
 */
exports.getSemesterCourses = asyncHandler(async (req, res, next) => {
  const { semester } = req.params;
  const { department, major } = req.query;

  // Build query
  const query = { semester: Number(semester) };

  if (department) {
    query.department = department;
  }

  // Find semester courses
  const semesterCourses = await SemesterCourse.find(query).populate({
    path: "course",
    select:
      "name code description creditHours academicLevel courseType majors department isActive",
  });

  // Filter by major if specified
  let filteredCourses = semesterCourses;
  if (major) {
    filteredCourses = semesterCourses.filter(
      (sc) =>
        sc.course &&
        (sc.course.majors.includes(major) ||
          sc.course.majors.includes("General"))
    );
  }

  // Filter out inactive courses
  filteredCourses = filteredCourses.filter(
    (sc) => sc.course && sc.course.isActive
  );

  res.status(200).json({
    status: "success",
    results: filteredCourses.length,
    data: filteredCourses,
  });
});

/**
 * @desc    Update a semester course
 * @route   PUT /api/v1/semester-courses/:id
 * @access  Private (Admin)
 */
exports.updateSemesterCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isRequired, department } = req.body;

  const semesterCourse = await SemesterCourse.findById(id);
  if (!semesterCourse) {
    return next(new ApiError("Semester course not found", 404));
  }

  // Update fields
  if (isRequired !== undefined) semesterCourse.isRequired = isRequired;
  if (department) semesterCourse.department = department;

  await semesterCourse.save();

  res.status(200).json({
    status: "success",
    data: semesterCourse,
  });
});

/**
 * @desc    Delete a semester course
 * @route   DELETE /api/v1/semester-courses/:id
 * @access  Private (Admin)
 */
exports.deleteSemesterCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const semesterCourse = await SemesterCourse.findById(id);
  if (!semesterCourse) {
    return next(new ApiError("Semester course not found", 404));
  }

  await SemesterCourse.findByIdAndDelete(id);

  res.status(204).send();
});
