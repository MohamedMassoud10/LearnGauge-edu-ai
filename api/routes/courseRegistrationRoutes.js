const express = require("express");
const courseRegistrationService = require("../services/courseRegistrationService");
const coursePrerequisiteService = require("../services/coursePrerequisiteService");
const semesterCourseService = require("../services/semesterCourseService");
const authService = require("../services/authService");
const {
  courseRegistrationValidator,
  updateRegistrationValidator,
  semesterCourseValidator,
  autoRegisterValidator,
} = require("../utils/validators/registrationValidator");

const router = express.Router({ mergeParams: true });

// Apply authentication middleware to all routes
router.use(authService.protect);

// Course prerequisites routes
// @desc    Create a course prerequisite
// @route   POST /api/v1/course-prerequisites
// @access  Private (Admin)
router
  .route("/course-prerequisites")
  .post(
    authService.allowedTO("admin"),
    coursePrerequisiteService.createCoursePrerequisite
  );

// @desc    Get all prerequisites for a course
// @route   GET /api/v1/courses/:courseId/prerequisites
// @access  Public
router
  .route("/courses/:courseId/prerequisites")
  .get(coursePrerequisiteService.getCoursePrerequisites);

// @desc    Get all students registered for a course
// @route   GET /api/v1/courses/:courseId/students
// @access  Private (Admin, Instructor)
router
  .route("/courses/:courseId/students")
  .get(
    authService.allowedTO("admin", "instructor"),
    courseRegistrationService.getStudentsByCourse
  );

// Semester courses routes
// @desc    Add a course to a semester
// @route   POST /api/v1/semester-courses
// @access  Private (Admin)
router
  .route("/semester-courses")
  .post(
    authService.allowedTO("admin"),
    semesterCourseValidator,
    semesterCourseService.addCourseToSemester
  );

// @desc    Get all courses for a semester
// @route   GET /api/v1/semester-courses/:semester
// @access  Public
router
  .route("/semester-courses/:semester")
  .get(semesterCourseService.getSemesterCourses);

// @desc    Update a semester course
// @route   PUT /api/v1/semester-courses/:id
// @access  Private (Admin)
router
  .route("/semester-courses/:id")
  .put(
    authService.allowedTO("admin"),
    semesterCourseService.updateSemesterCourse
  )
  .delete(
    authService.allowedTO("admin"),
    semesterCourseService.deleteSemesterCourse
  );

// Course registration routes
// @desc    Register a student for a course
// @route   POST /api/v1/course-registrations
// @access  Private (Student, Admin)
router
  .route("/course-registrations")
  .post(
    authService.allowedTO("admin", "student"),
    courseRegistrationValidator,
    courseRegistrationService.registerCourse
  );

// @desc    Update course registration status and grade
// @route   PUT /api/v1/course-registrations/:id
// @access  Private (Admin, Instructor)
router
  .route("/course-registrations/:id")
  .put(
    authService.allowedTO("admin", "instructor"),
    updateRegistrationValidator,
    courseRegistrationService.updateCourseRegistration
  );

// Student course suggestions and auto-registration
// @desc    Get suggested courses for a student
// @route   GET /api/v1/students/:studentId/suggested-courses
// @access  Private (Student, Admin)
router
  .route("/students/:studentId/suggested-courses")
  .get(
    authService.allowedTO("admin", "student"),
    courseRegistrationService.getSuggestedCourses
  );
router
  .route("/recommendations")
  .get(
    authService.allowedTO("admin", "student"),
    courseRegistrationService.recommendedCourses
  );

// @desc    Auto-register first semester courses for a student
// @route   POST /api/v1/students/:studentId/auto-register
// @access  Private (Admin)
router
  .route("/students/:studentId/auto-register")
  .post(
    authService.allowedTO("admin"),
    autoRegisterValidator,
    courseRegistrationService.autoRegisterFirstSemesterCourses
  );

// @desc    Get student's course registrations
// @route   GET /api/v1/students/:studentId/registrations
// @access  Private (Student, Admin, Instructor)
router
  .route("/students/:studentId/registrations")
  .get(
    authService.allowedTO("admin", "instructor", "student"),
    courseRegistrationService.getStudentRegistrations
  );

module.exports = router;
