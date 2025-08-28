const mongoose = require("mongoose");
const factory = require("./handlerFactory");
const Grades = require("../models/gradesModel");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const Courses = require("../models/coursesModel");
const StudentCourseRegistration = require("../models/studentCourseRegistrationModel");
// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private (Admin, Instructor)
exports.getGrades = factory.getAll(Grades, [
  { path: "student", select: "name email" },
  { path: "course", select: "name code" },
  { path: "instructor", select: "name" },
]);

// @desc    Get specific grade by ID
// @route   GET /api/v1/grades/:id
// @access  Private (Admin, Instructor, Student - only their own)
exports.getGrade = factory.getOne(Grades, [
  { path: "student", select: "name email" },
  { path: "course", select: "name code" },
  { path: "instructor", select: "name" },
]);

// @desc    Create a grade
// @route   POST /api/v1/grades
// @access  Private (Admin, Instructor)
exports.createGrade = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { student, course, midterm, final, assignments, quizzes } = req.body;

    // Instructor authorization
    if (req.user.role === "instructor") {
      const courseDoc = await Courses.findById(course).session(session);
      if (!courseDoc) throw new ApiError("Course not found", 404);
      if (courseDoc.instructor.toString() !== req.user._id.toString()) {
        throw new ApiError("You are not authorized to grade this course", 403);
      }
    }

    const studentDoc = await User.findById(student).session(session);
    if (!studentDoc || studentDoc.role !== "student") {
      throw new ApiError("Invalid student", 404);
    }

    // Validate grade inputs (ensure they don't exceed maximum points)
    const midtermScore = Math.min(Math.max(midterm || 0, 0), 20);
    const finalScore = Math.min(Math.max(final || 0, 0), 40);
    const assignmentsScore = Math.min(Math.max(assignments || 0, 0), 20);
    const quizzesScore = Math.min(Math.max(quizzes || 0, 0), 20);

    // Calculate total grade and letter grade
    const totalGrade =
      midtermScore + finalScore + assignmentsScore + quizzesScore;
    const letterGrade = calculateLetterGrade(totalGrade);

    // 1. Create a new grade record
    const grade = await Grades.create(
      [
        {
          student,
          course,
          instructor: req.user._id,
          midterm: midtermScore,
          final: finalScore,
          assignments: assignmentsScore,
          quizzes: quizzesScore,
          totalGrade,
          letterGrade,
        },
      ],
      { session }
    );

    // 2. Update the student registration with the letter grade

    // 3. Check if all courses are graded
    const allCourses = await StudentCourseRegistration.find({ student })
      .populate("course")
      .session(session);
    const allGraded = allCourses.every((c) => !!c.grade);

    if (!allGraded) {
      await session.commitTransaction();
      session.endSession();
      return res.status(201).json({
        status: "success",
        data: {
          grade: grade[0],
        },
      });
    }

    // 4. Calculate GPA
    let totalPoints = 0;
    let totalCredits = 0;

    const gradeToPoint = (g) => {
      const map = {
        "A+": 4.0,
        A: 4.0,
        "A-": 3.7,
        "B+": 3.3,
        B: 3.0,
        "B-": 2.7,
        "C+": 2.3,
        C: 2.0,
        "C-": 1.7,
        "D+": 1.3,
        D: 1.0,
        "D-": 0.7,
        F: 0.0,
      };
      return map[g] ?? 0;
    };

    allCourses.forEach((courseReg) => {
      const points = gradeToPoint(courseReg.grade);
      const credit = courseReg.course.creditHours || 3;
      totalPoints += points * credit;
      totalCredits += credit;
    });

    const gpa = +(totalPoints / totalCredits).toFixed(2);

    // 5. Update student record
    studentDoc.gpa = gpa;

    studentDoc.passedCourses.push(...allCourses.map((reg) => reg.course._id));
    await studentDoc.save({ session });

    // 6. Clear course registrations
    await StudentCourseRegistration.deleteMany({ student }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Grade saved, GPA calculated, academic level updated.",
      data: {
        grade: grade[0],
        gpa,
        academicLevel: studentDoc.academicLevel,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

exports.updateGrade = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const grade = await Grades.findById(req.params.id).session(session);
    if (!grade) {
      return next(new ApiError(`No grade found for id ${req.params.id}`, 404));
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      if (grade.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError("You are not authorized to update this grade", 403)
        );
      }
    }

    const { midterm, final, assignments, quizzes } = req.body;

    // Validate grade inputs (ensure they don't exceed maximum points)
    const midtermScore = Math.min(
      Math.max(midterm !== undefined ? midterm : grade.midterm, 0),
      20
    );
    const finalScore = Math.min(
      Math.max(final !== undefined ? final : grade.final, 0),
      40
    );
    const assignmentsScore = Math.min(
      Math.max(assignments !== undefined ? assignments : grade.assignments, 0),
      20
    );
    const quizzesScore = Math.min(
      Math.max(quizzes !== undefined ? quizzes : grade.quizzes, 0),
      20
    );

    // Calculate total grade and letter grade
    const totalGrade =
      midtermScore + finalScore + assignmentsScore + quizzesScore;
    const letterGrade = calculateLetterGrade(totalGrade);

    // Update the grade
    const updatedGrade = await Grades.findByIdAndUpdate(
      req.params.id,
      {
        midterm: midtermScore,
        final: finalScore,
        assignments: assignmentsScore,
        quizzes: quizzesScore,
        totalGrade,
        letterGrade,
      },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      data: updatedGrade,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// Helper function to calculate letter grade based on total points
function calculateLetterGrade(totalPoints) {
  if (totalPoints >= 97) return "A+";
  if (totalPoints >= 93) return "A";
  if (totalPoints >= 90) return "A-";
  if (totalPoints >= 87) return "B+";
  if (totalPoints >= 83) return "B";
  if (totalPoints >= 80) return "B-";
  if (totalPoints >= 77) return "C+";
  if (totalPoints >= 73) return "C";
  if (totalPoints >= 70) return "C-";
  if (totalPoints >= 67) return "D+";
  if (totalPoints >= 63) return "D";
  if (totalPoints >= 60) return "D-";
  return "F";
}

// @desc    Delete specific grade
// @route   DELETE /api/v1/grades/:id
// @access  Private (Admin, Instructor)
exports.deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grades.findById(req.params.id);
    if (!grade) {
      return next(new ApiError(`No grade found for id ${req.params.id}`, 404));
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      if (grade.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError("You are not authorized to delete this grade", 403)
        );
      }
    }

    await Grades.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// @desc    Get grades for a specific course
// @route   GET /api/v1/courses/:courseId/grades
// @access  Private (Admin, Instructor)
exports.getGradesForCourse = async (req, res, next) => {
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
          "You are not authorized to view grades for this course",
          403
        )
      );
    }

    const grades = await Grades.find({ course: courseId })
      .populate({ path: "student", select: "name email" })
      .populate({ path: "course", select: "name code" })
      .populate({ path: "instructor", select: "name" });

    res.status(200).json({
      status: "success",
      results: grades.length,
      data: grades,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get grades for a specific student
// @route   GET /api/v1/students/:studentId/grades
// @access  Private (Admin, Instructor, Student - only their own)
exports.getGradesForStudent = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return next(
        new ApiError("Student not found or user is not a student", 404)
      );
    }

    // If student, verify they are requesting their own grades
    if (req.user.role === "student" && req.user._id.toString() !== studentId) {
      return next(
        new ApiError(
          "You are not authorized to view grades for this student",
          403
        )
      );
    }

    const grades = await Grades.find({ student: studentId })
      .populate({ path: "student", select: "name email" })
      .populate({ path: "course", select: "name code" })
      .populate({ path: "instructor", select: "name" });

    res.status(200).json({
      status: "success",
      results: grades.length,
      data: grades,
    });
  } catch (err) {
    next(err);
  }
};
