const factory = require("./handlerFactory");
const Quiz = require("../models/quizModel");
const ApiError = require("../utils/apiError");
const Courses = require("../models/coursesModel");

// @desc    Get all quizzes
// @route   GET /api/v1/quizzes
// @access  Public
exports.getQuizzes = factory.getAll(Quiz, [
  { path: "course", select: "name code" },
  { path: "instructor", select: "name" },
]);

// @desc    Get specific quiz by ID
// @route   GET /api/v1/quizzes/:id
// @access  Public
exports.getQuiz = factory.getOne(Quiz, [
  { path: "course", select: "name code" },
  { path: "instructor", select: "name" },
]);

// @desc    Create a quiz
// @route   POST /api/v1/quizzes
// @access  Private (Admin, Instructor)
exports.createQuiz = async (req, res, next) => {
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
            "You are not authorized to create quizzes for this course",
            403
          )
        );
      }
    }

    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      status: "success",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update specific quiz
// @route   PUT /api/v1/quizzes/:id
// @access  Private (Admin, Instructor)
exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return next(new ApiError(`No quiz found for id ${req.params.id}`, 404));
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      if (quiz.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError("You are not authorized to update this quiz", 403)
        );
      }
    }

    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: updatedQuiz,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete specific quiz
// @route   DELETE /api/v1/quizzes/:id
// @access  Private (Admin, Instructor)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return next(new ApiError(`No quiz found for id ${req.params.id}`, 404));
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      if (quiz.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError("You are not authorized to delete this quiz", 403)
        );
      }
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// @desc    Get quizzes for a specific course
// @route   GET /api/v1/courses/:courseId/quizzes
// @access  Public
exports.getQuizzesForCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    // Verify course exists
    const course = await Courses.findById(courseId);
    if (!course) {
      return next(new ApiError("Course not found", 404));
    }

    const quizzes = await Quiz.find({ course: courseId })
      .populate({ path: "course", select: "name code" })
      .populate({ path: "instructor", select: "name" });

    res.status(200).json({
      status: "success",
      results: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate a quiz using AI
// @route   POST /api/v1/courses/:courseId/generate-quiz
// @access  Private (Admin, Instructor)
exports.generateQuizWithAI = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    // Verify course exists
    const course = await Courses.findById(courseId);
    if (!course) {
      return next(new ApiError("Course not found", 404));
    }

    // If instructor, verify they are assigned to the course
    if (req.user.role === "instructor") {
      if (course.instructor.toString() !== req.user._id.toString()) {
        return next(
          new ApiError(
            "You are not authorized to generate quizzes for this course",
            403
          )
        );
      }
    }

    const { title, description, numberOfQuestions, difficulty, topics } =
      req.body;

    if (!title || !numberOfQuestions || !difficulty) {
      return next(
        new ApiError(
          "Title, number of questions, and difficulty are required",
          400
        )
      );
    }

    // This would be replaced with an actual AI API call
    // For now, we'll generate a mock quiz
    const questions = [];

    for (let i = 0; i < numberOfQuestions; i++) {
      questions.push({
        text: `Sample question ${i + 1} for ${course.name}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: Math.floor(Math.random() * 4),
        points: 1,
      });
    }

    const quizData = {
      title,
      description: description || `AI-generated quiz for ${course.name}`,
      course: courseId,
      instructor: req.user._id,
      questions,
      duration: 30, // Default 30 minutes
      isAIGenerated: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week from now
    };

    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      status: "success",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};
