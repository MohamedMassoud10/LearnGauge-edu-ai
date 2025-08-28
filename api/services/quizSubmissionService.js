const factory = require("./handlerFactory");
const QuizSubmission = require("../models/quizSubmissionModel");
const Quiz = require("../models/quizModel");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const Grades = require("../models/gradesModel");
const Courses = require("../models/coursesModel"); // Added missing import

// @desc    Get all quiz submissions
// @route   GET /api/v1/quiz-submissions
// @access  Private (Admin, Instructor)
exports.getQuizSubmissions = factory.getAll(QuizSubmission, [
  { path: "quiz", select: "title course" },
  { path: "student", select: "name email" },
]);

// @desc    Get specific quiz submission by ID
// @route   GET /api/v1/quiz-submissions/:id
// @access  Private (Admin, Instructor, Student - only their own)
exports.getQuizSubmission = factory.getOne(QuizSubmission, [
  { path: "quiz", select: "title course questions" },
  { path: "student", select: "name email" },
]);

// @desc    Create a quiz submission
// @route   POST /api/v1/quiz-submissions
// @access  Private (Student)
exports.createQuizSubmission = async (req, res, next) => {
  try {
    // Set student to current user if role is student
    if (req.user.role === "student") {
      req.body.student = req.user._id;
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(req.body.quiz);
    if (!quiz) {
      return next(new ApiError("Quiz not found", 404));
    }

    // Check if student has already submitted this quiz
    const existingSubmission = await QuizSubmission.findOne({
      quiz: req.body.quiz,
      student: req.body.student,
    });

    if (existingSubmission) {
      return next(new ApiError("You have already submitted this quiz", 400));
    }

    // Calculate score
    let score = 0;
    const answers = req.body.answers || [];

    answers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question && answer.selectedOption === question.correctAnswer) {
        score += question.points;
      }
    });

    // Calculate percentage
    const totalPoints = quiz.totalPoints;
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    // Create submission
    const submission = await QuizSubmission.create({
      quiz: req.body.quiz,
      student: req.body.student,
      answers,
      score,
      percentage,
      completed: true,
      timeSpent: req.body.timeSpent || 0,
    });

    // Update student's quiz grade if it exists
    await Grades.findOneAndUpdate(
      {
        student: req.body.student,
        course: quiz.course,
      },
      {
        $inc: { quizzes: percentage / 100 }, // Increment by the percentage (normalized to 0-1)
      },
      { new: true }
    );

    res.status(201).json({
      status: "success",
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update specific quiz submission
// @route   PUT /api/v1/quiz-submissions/:id
// @access  Private (Admin, Instructor)
exports.updateQuizSubmission = async (req, res, next) => {
  try {
    const submission = await QuizSubmission.findById(req.params.id);
    if (!submission) {
      return next(
        new ApiError(`No submission found for id ${req.params.id}`, 404)
      );
    }

    // Only allow updating certain fields
    const allowedFields = ["score", "percentage", "completed"];
    Object.keys(req.body).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete req.body[key];
      }
    });

    // Update the submission
    const updatedSubmission = await QuizSubmission.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: updatedSubmission,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete specific quiz submission
// @route   DELETE /api/v1/quiz-submissions/:id
// @access  Private (Admin)
exports.deleteQuizSubmission = factory.deleteOne(QuizSubmission);

// @desc    Get submissions for a specific quiz
// @route   GET /api/v1/quizzes/:quizId/submissions
// @access  Private (Admin, Instructor)
exports.getSubmissionsForQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(new ApiError("Quiz not found", 404));
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      const course = await Courses.findById(quiz.course);
      if (!course || course.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError(
            "You are not authorized to view submissions for this quiz",
            403
          )
        );
      }
    }

    const submissions = await QuizSubmission.find({ quiz: quizId }).populate({
      path: "student",
      select: "name email",
    });

    res.status(200).json({
      status: "success",
      results: submissions.length,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get submissions for a specific student
// @route   GET /api/v1/students/:studentId/submissions
// @access  Private (Admin, Instructor, Student - only their own)
exports.getSubmissionsForStudent = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return next(
        new ApiError("Student not found or user is not a student", 404)
      );
    }

    // If student, verify they are requesting their own submissions
    if (req.user.role === "student" && req.user._id.toString() !== studentId) {
      return next(
        new ApiError(
          "You are not authorized to view submissions for this student",
          403
        )
      );
    }

    const submissions = await QuizSubmission.find({
      student: studentId,
    }).populate({
      path: "quiz",
      select: "title course",
    });

    res.status(200).json({
      status: "success",
      results: submissions.length,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};
