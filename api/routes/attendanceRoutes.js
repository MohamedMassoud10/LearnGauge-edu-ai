const express = require("express");

const {
  createAttendanceValidator,
  updateAttendanceValidator,
  getAttendanceValidator,
  deleteAttendanceValidator,
} = require("../utils/validators/attendanceValidator");

const {
  getAttendanceRecords,
  getAttendanceRecord,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getAttendanceForCourse,
  getAttendanceForLecture,
  getAttendanceForStudent,
} = require("../services/attendanceService");

const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

router.use(authService.protect);

router
  .route("/")
  .get(authService.allowedTO("admin", "instructor"), getAttendanceRecords)
  .post(
    authService.allowedTO("admin", "instructor"),
    createAttendanceValidator,
    createAttendanceRecord
  );

router
  .route("/:id")
  .get(getAttendanceValidator, getAttendanceRecord)
  .put(
    authService.allowedTO("admin", "instructor"),
    updateAttendanceValidator,
    updateAttendanceRecord
  )
  .delete(
    authService.allowedTO("admin", "instructor"),
    deleteAttendanceValidator,
    deleteAttendanceRecord
  );

// Nested routes
// GET /api/courses/:courseId/attendance
router.get(
  "/courses/:courseId/attendance",
  authService.allowedTO("admin", "instructor"),
  getAttendanceForCourse
);

// GET /api/lectures/:lectureId/attendance
router.get(
  "/lectures/:lectureId/attendance",
  authService.allowedTO("admin", "instructor"),
  getAttendanceForLecture
);

// GET /api/students/:studentId/attendance
router.get(
  "/students/:studentId/attendance",
  authService.allowedTO("admin", "instructor", "student"),
  getAttendanceForStudent
);

module.exports = router;
