const factory = require("./handlerFactory");
const Attendance = require("../models/attendanceModel");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const Courses = require("../models/coursesModel");
const Lectures = require("../models/lecturesModel");

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin, Instructor)
exports.getAttendanceRecords = factory.getAll(Attendance, [
  { path: "student", select: "name email" },
  { path: "course", select: "name code" },
  { path: "lecture", select: "number" },
  { path: "instructor", select: "name" },
]);

// @desc    Get specific attendance record by ID
// @route   GET /api/attendance/:id
// @access  Private (Admin, Instructor, Student - only their own)
exports.getAttendanceRecord = factory.getOne(Attendance, [
  { path: "student", select: "name email" },
  { path: "course", select: "name code" },
  { path: "lecture", select: "number" },
  { path: "instructor", select: "name" },
]);

// @desc    Create an attendance record
// @route   POST /api/attendance
// @access  Private (Admin, Instructor)
exports.createAttendanceRecord = async (req, res, next) => {
  try {
    // Set instructor to current user if role is instructor
    if (req.user.role === "instructor") {
      req.body.instructor = req.user._id;

      // Verify instructor is assigned to the course
      const course = await Courses.findById(req.body.course);
      if (!course) {
        return next(new ApiError("Course not found", 404));
      }

      if (course.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError(
            "You are not authorized to mark attendance for this course",
            403
          )
        );
      }
    }

    // Verify lecture belongs to the course
    const lecture = await Lectures.findById(req.body.lecture);
    if (!lecture) {
      return next(new ApiError("Lecture not found", 404));
    }

    if (lecture.course.toString() !== req.body.course) {
      return next(
        new ApiError("Lecture does not belong to the specified course", 400)
      );
    }

    // Check if student exists
    const student = await User.findById(req.body.student);
    if (!student || student.role !== "student") {
      return next(
        new ApiError("Student not found or user is not a student", 404)
      );
    }

    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      status: "success",
      data: attendance,
    });
  } catch (err) {
    // Handle duplicate key error (student already has attendance for this lecture)
    if (err.code === 11000) {
      return next(
        new ApiError(
          "Student already has an attendance record for this lecture",
          400
        )
      );
    }
    next(err);
  }
};

// @desc    Update specific attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin, Instructor)
exports.updateAttendanceRecord = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return next(
        new ApiError(`No attendance record found for id ${req.params.id}`, 404)
      );
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      if (attendance.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError(
            "You are not authorized to update this attendance record",
            403
          )
        );
      }
    }

    // Update the attendance record
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: updatedAttendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete specific attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin, Instructor)
exports.deleteAttendanceRecord = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return next(
        new ApiError(`No attendance record found for id ${req.params.id}`, 404)
      );
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      if (attendance.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError(
            "You are not authorized to delete this attendance record",
            403
          )
        );
      }
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance records for a specific course
// @route   GET /api/courses/:courseId/attendance
// @access  Private (Admin, Instructor)
exports.getAttendanceForCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    // Verify course exists
    const course = await Courses.findById(courseId);
    if (!course) {
      return next(new ApiError("Course not found", 404));
    }

    // If instructor, verify they are assigned to the course
    if (
      req.user.role === "instructor" &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return next(
        new ApiError(
          "You are not authorized to view attendance for this course",
          403
        )
      );
    }

    const attendance = await Attendance.find({ course: courseId })
      .populate({ path: "student", select: "name email" })
      .populate({ path: "course", select: "name code" })
      .populate({ path: "lecture", select: "number" })
      .populate({ path: "instructor", select: "name" });

    res.status(200).json({
      status: "success",
      results: attendance.length,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance records for a specific lecture
// @route   GET /api/lectures/:lectureId/attendance
// @access  Private (Admin, Instructor)
exports.getAttendanceForLecture = async (req, res, next) => {
  try {
    const lectureId = req.params.lectureId;

    // Verify lecture exists
    const lecture = await Lectures.findById(lectureId);
    if (!lecture) {
      return next(new ApiError("Lecture not found", 404));
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      const course = await Courses.findById(lecture.course);
      if (!course || course.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError(
            "You are not authorized to view attendance for this lecture",
            403
          )
        );
      }
    }

    const attendance = await Attendance.find({ lecture: lectureId })
      .populate({ path: "student", select: "name email" })
      .populate({ path: "course", select: "name code" })
      .populate({ path: "lecture", select: "number" })
      .populate({ path: "instructor", select: "name" });

    res.status(200).json({
      status: "success",
      results: attendance.length,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance records for a specific student
// @route   GET /api/students/:studentId/attendance
// @access  Private (Admin, Instructor, Student - only their own)
exports.getAttendanceForStudent = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return next(
        new ApiError("Student not found or user is not a student", 404)
      );
    }

    // If student, verify they are requesting their own attendance
    if (req.user.role === "student" && req.user._id.toString() !== studentId) {
      return next(
        new ApiError(
          "You are not authorized to view attendance for this student",
          403
        )
      );
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate({ path: "student", select: "name email" })
      .populate({ path: "course", select: "name code" })
      .populate({ path: "lecture", select: "number" })
      .populate({ path: "instructor", select: "name" });

    res.status(200).json({
      status: "success",
      results: attendance.length,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};
