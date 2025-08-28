const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Courses = require("../models/coursesModel");
const CoursePrerequisite = require("../models/coursePrerequisiteModel");
const StudentCourseRegistration = require("../models/studentCourseRegistrationModel");

/**
 * @desc    Get recommended courses for a student based on all constraints
 * @route   GET /api/v1/:studentId/suggested-courses
 * @access  Private (Student, Admin)
 */

exports.getSuggestedCourses = asyncHandler(async (req, res, next) => {
  const studentId =
    req.user.role === "student" ? req.user._id : req.params.studentId;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  // Get student
  const user = await User.findById(studentId);
  if (!user) {
    return res.status(404).json({ message: "Student not found" });
  }
  // Check holds
  if (user.holds && user.holds.length > 0) {
    return res
      .status(403)
      .json({ message: "You have holds and cannot register courses." });
  }

  // Get all courses
  const allCourses = await Courses.find({});
  const courseIdToCourseMap = {};
  allCourses.forEach((course) => {
    courseIdToCourseMap[course._id.toString()] = course;
  });

  // Passed courses
  const passedCourseIds = user.passedCourses.map((id) => id.toString());
  const passedSet = new Set(passedCourseIds);
  console.log("passedCourseIds:", passedCourseIds);

  // Failed or current courses
  const registrations = await StudentCourseRegistration.find({
    student: studentId,
  });
  const failedOrCurrentCourseIds = registrations
    .filter(
      (r) =>
        (r.status === "completed" && !r.isPassed) || r.status !== "completed"
    )
    .map((r) => r.course.toString());
  console.log("failedOrCurrentCourseIds:", failedOrCurrentCourseIds);

  const excludedCourseIds = new Set([
    ...passedCourseIds,
    ...failedOrCurrentCourseIds,
  ]);

  console.log("All Courses:");
  allCourses.forEach((course) => {
    console.log(
      `- ${course.name} | Active: ${course.isActive} | Level: ${course.academicLevel} | Majors: ${course.majors}`
    );
  });

  // Filter available courses
  const availableCourses = allCourses.filter((course) => {
    if (!course.isActive) return false;
    if (course.academicLevel > user.academicLevel) return false;
    if (
      !course.majors.includes("General") &&
      !course.majors.includes(user.major)
    )
      return false;
    if (excludedCourseIds.has(course._id.toString())) return false;
    return true;
  });

  console.log("Available Courses Before Checking Prerequisites:");
  availableCourses.forEach((course) => {
    console.log(`- ${course.name} (${course._id})`);
  });

  // Get all prerequisites
  const allPrerequisites = await CoursePrerequisite.find({});
  const prereqMap = {};
  allPrerequisites.forEach((prereq) => {
    const courseId = prereq.course.toString();
    if (!prereqMap[courseId]) prereqMap[courseId] = [];
    prereqMap[courseId].push(prereq.prerequisite.toString());
  });

  // Show what each course needs
  availableCourses.forEach((course) => {
    const courseId = course._id.toString();
    const prereqs = prereqMap[courseId] || [];
    console.log(`Course "${course.name}" needs prerequisites:`, prereqs);
  });

  // Filter based on prerequisites
  const suggestedCourses = availableCourses.filter((course) => {
    const courseId = course._id.toString();
    const requiredPrereqs = prereqMap[courseId] || [];
    return requiredPrereqs.every((prereqId) => passedSet.has(prereqId));
  });

  console.log("Final Suggested Courses:");
  suggestedCourses.forEach((course) => console.log(`✔️ ${course.name}`));

  // Response
  res.status(200).json({
    status: "success",
    results: suggestedCourses.length,
    data: suggestedCourses,
  });
});
