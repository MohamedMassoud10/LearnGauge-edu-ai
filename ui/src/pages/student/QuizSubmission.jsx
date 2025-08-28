"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaRegClock,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHistory,
  FaTrophy,
  FaUserGraduate,
} from "react-icons/fa";
import {
  useQuizzes,
  useSubmissionsByQuiz,
  useSubmitQuiz,
} from "../../hooks/useQuizzes";
import { useAuthContext } from "../../hooks/useAuthContext";

const QuizSubmission = () => {
  const { user } = useAuthContext();
  const userId = user?.data?._id;
  console.log(userId);
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Using useQuizzes instead of useQuiz and filtering the data
  const { data: quizzesData, isLoading: quizLoading } = useQuizzes();
  console.log(quizzesData?.data?.data);
  const { data: submissionsData, isLoading: submissionsLoading } =
    useSubmissionsByQuiz(quizId);
  console.log(submissionsData?.data?.data);

  // Use the submit quiz mutation
  const { mutate: submitQuizMutation, isLoading: isSubmitting } =
    useSubmitQuiz();

  // Memoize the quiz data to prevent unnecessary re-renders
  const quiz = useMemo(
    () => quizzesData?.data?.data?.find((q) => q._id === quizId),
    [quizzesData, quizId]
  );

  // Memoize previous submissions data and check if current user has submitted
  const previousSubmissions = useMemo(
    () => submissionsData?.data?.data || [],
    [submissionsData]
  );

  // Check if the current user has already submitted this quiz
  const userPreviousSubmission = useMemo(() => {
    return previousSubmissions.find(
      (submission) => submission.student._id === userId
    );
  }, [previousSubmissions, userId]);

  const hasUserSubmitted = !!userPreviousSubmission;

  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const cancelSubmit = () => {
    setShowConfirmSubmit(false);
  };

  const handleSubmit = async () => {
    if (showConfirmSubmit) {
      setSubmitError(null);

      try {
        // Format submission data
        const formattedAnswers = Object.entries(answers).map(
          ([questionIndex, selectedOption]) => ({
            questionIndex: Number.parseInt(questionIndex),
            selectedOption,
          })
        );

        const submission = {
          quiz: quizId,
          student: userId, // Add the student field using userId
          answers: formattedAnswers,
          timeSpent: timeSpent,
        };

        // Submit quiz using the useSubmitQuiz hook
        submitQuizMutation(submission, {
          onSuccess: () => {
            setSubmitSuccess(true);

            // Navigate to results page after short delay
            setTimeout(() => {
              navigate(`/quiz-submission/${quizId}`);
            }, 2000);
          },
          onError: (error) => {
            console.error("Error submitting quiz:", error);
            setSubmitError("Failed to submit quiz. Please try again.");
          },
        });
      } catch (error) {
        console.error("Error submitting quiz:", error);
        setSubmitError("Failed to submit quiz. Please try again.");
      }
    } else {
      setShowConfirmSubmit(true);
    }
  };

  // Initialize quiz data and timer
  useEffect(() => {
    if (quiz) {
      // Initialize timer
      setTimeLeft(quiz.duration * 60);

      // Initialize answers object
      const initialAnswers = {};
      quiz.questions.forEach((_, index) => {
        initialAnswers[index] = null;
      });
      setAnswers(initialAnswers);

      // Start tracking time spent
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz]);

  // Timer effect for countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time function - memoized to prevent unnecessary recalculations
  const formatTime = useMemo(() => {
    return (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${
        remainingSeconds < 10 ? "0" : ""
      }${remainingSeconds}`;
    };
  }, []);

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  // Navigate to next/previous question
  const navigateQuestion = (direction) => {
    if (
      direction === "next" &&
      currentQuestionIndex < quiz.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (direction === "prev" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Go to specific question
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Check if all questions are answered - memoized to prevent recalculation on every render
  const allQuestionsAnswered = useMemo(() => {
    return Object.values(answers).every((answer) => answer !== null);
  }, [answers]);

  // Memoize the question navigation buttons to prevent unnecessary re-renders
  const questionNavigationButtons = useMemo(() => {
    if (!quiz) return null;

    return quiz.questions.map((_, index) => (
      <button
        key={index}
        onClick={() => goToQuestion(index)}
        className={`w-full h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
          currentQuestionIndex === index
            ? "bg-[#014D89] text-white"
            : answers[index] !== null
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {index + 1}
      </button>
    ));
  }, [quiz, currentQuestionIndex, answers]);

  const loadingState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-[#014D89] border-r-[#014D89] border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Quiz
          </h3>
          <p className="text-gray-500">
            Please wait while we prepare your quiz...
          </p>
        </div>
      </div>
    ),
    []
  );

  const quizNotFound = useMemo(
    () => (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl shadow-lg p-8 text-center">
        <FaExclamationTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          Quiz Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The quiz you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    ),
    [navigate]
  );

  const quizNotStartedYet = useMemo(() => {
    if (!quiz) return null;

    const startDate = new Date(quiz.startDate);
    const currentDate = new Date();

    if (currentDate < startDate) {
      return (
        <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <FaExclamationTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            Quiz Not Available Yet
          </h3>
          <p className="text-gray-600 mb-6">
            This quiz will be available starting on{" "}
            {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}
            .
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      );
    }

    return null;
  }, [quiz, navigate]);

  const alreadySubmitted = useMemo(() => {
    if (!hasUserSubmitted) return null;

    const lastSubmission = userPreviousSubmission;

    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <FaHistory className="w-16 h-16 text-[#014D89] mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            You've Already Attempted This Quiz
          </h3>
          <p className="text-gray-600">
            You submitted this quiz on{" "}
            {new Date(lastSubmission.submittedAt).toLocaleDateString()} at{" "}
            {new Date(lastSubmission.submittedAt).toLocaleTimeString()}.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <FaTrophy className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {lastSubmission.score}/{quiz.totalPoints}
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <FaUserGraduate className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-2xl font-bold text-gray-800">
                {lastSubmission.percentage}%
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <FaRegClock className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Time Spent</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatTime(lastSubmission.timeSpent)}
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <FaCheckCircle
                className={`w-8 h-8 ${
                  lastSubmission.completed ? "text-green-500" : "text-red-500"
                } mb-2`}
              />
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-2xl font-bold text-gray-800">
                {lastSubmission.completed ? "Completed" : "Incomplete"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FaArrowLeft className="inline mr-2" /> Back to Quizzes
          </button>
          <button
            onClick={() => navigate(`/quiz-results/${quizId}`)}
            className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            View Detailed Results
          </button>
        </div>
      </div>
    );
  }, [
    hasUserSubmitted,
    userPreviousSubmission,
    quiz,
    navigate,
    quizId,
    formatTime,
  ]);

  const submissionSuccessMessage = useMemo(
    () => (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl shadow-lg p-8 text-center">
        <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">
          Quiz Submitted Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          Your answers have been recorded. Redirecting to results...
        </p>
        <div className="w-12 h-12 border-4 border-t-[#014D89] border-r-[#014D89] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    ),
    []
  );

  const confirmSubmissionDialog = useMemo(() => {
    if (!showConfirmSubmit) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Confirm Submission
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to submit your quiz? You won't be able to
            change your answers after submission.
          </p>

          {!allQuestionsAnswered && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-amber-700 text-sm">
                  You haven't answered all questions. Unanswered questions will
                  be marked as incorrect.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={cancelSubmit}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-2 px-6 rounded-lg transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Confirm Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }, [showConfirmSubmit, allQuestionsAnswered, isSubmitting]);

  // Memoize the current question options to prevent unnecessary re-renders
  const currentQuestionOptions = useMemo(() => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return null;

    return quiz.questions[currentQuestionIndex].options.map(
      (option, oIndex) => (
        <div
          key={oIndex}
          onClick={() => handleAnswerSelect(currentQuestionIndex, oIndex)}
          className={`p-5 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-[1.01] ${
            answers[currentQuestionIndex] === oIndex
              ? "border-[#014D89] bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                answers[currentQuestionIndex] === oIndex
                  ? "border-[#014D89] bg-[#014D89]"
                  : "border-gray-400"
              }`}
            >
              {answers[currentQuestionIndex] === oIndex && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
            <span
              className={`text-lg ${
                answers[currentQuestionIndex] === oIndex
                  ? "text-[#014D89] font-medium"
                  : "text-gray-700"
              }`}
            >
              {option}
            </span>
          </div>
        </div>
      )
    );
  }, [quiz, currentQuestionIndex, answers]);

  if (quizLoading || submissionsLoading) {
    return loadingState;
  }

  if (!quiz) {
    return quizNotFound;
  }

  // Add this new check
  const startDateCheck = quizNotStartedYet;
  if (startDateCheck) {
    return startDateCheck;
  }

  if (hasUserSubmitted) {
    return alreadySubmitted;
  }

  if (submitSuccess) {
    return submissionSuccessMessage;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pb-16">
      {confirmSubmissionDialog}
      {/* Quiz Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-[#014D89] hover:text-[#01396a] transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#014D89]">
                {quiz.title}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Course ID: {quiz.course}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
              <FaRegClock className="w-5 h-5 text-[#014D89] mr-2" />
              <span className="font-medium text-[#014D89]">
                Time Left: {formatTime(timeLeft)}
              </span>
            </div>
            <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-gray-700">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">{quiz.description}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span className="mr-4">Total Points: {quiz.totalPoints}</span>
              <span>Time Spent: {formatTime(timeSpent)}</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {quiz.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question Navigation Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
              Questions
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {questionNavigationButtons}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center mb-3">
                <div className="w-4 h-4 bg-[#014D89] rounded-sm mr-2"></div>
                <span className="text-sm text-gray-600">Current Question</span>
              </div>
              <div className="flex items-center mb-3">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded-sm mr-2"></div>
                <span className="text-sm text-gray-600">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-100 rounded-sm mr-2"></div>
                <span className="text-sm text-gray-600">Unanswered</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSubmit}
                className="w-full bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-3 rounded-lg transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              </div>
            )}

            <div className="flex items-start mb-6">
              <span className="bg-[#014D89] text-white font-medium rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                {currentQuestionIndex + 1}
              </span>
              <div>
                <h3 className="text-xl font-medium text-gray-800">
                  {quiz.questions[currentQuestionIndex].text}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Points: {quiz.questions[currentQuestionIndex].points}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">{currentQuestionOptions}</div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => navigateQuestion("prev")}
                disabled={currentQuestionIndex === 0}
                className={`bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors flex items-center ${
                  currentQuestionIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <FaArrowLeft className="mr-2" /> Previous
              </button>

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={() => navigateQuestion("next")}
                  className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
                >
                  Next <FaArrowLeft className="ml-2 transform rotate-180" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
                >
                  <FaCheckCircle className="mr-2" /> Finish Quiz
                </button>
              )}
            </div>
          </div>

          {/* Quiz Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <div className="flex items-start">
              <FaInfoCircle className="text-[#014D89] mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Quiz Instructions
                </h4>
                <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4">
                  <li>Answer all questions to maximize your score.</li>
                  <li>
                    You can navigate between questions using the buttons or
                    question numbers.
                  </li>
                  <li>
                    The quiz will automatically submit when the time runs out.
                  </li>
                  <li>
                    Your progress is saved as you go, but only submitted when
                    you click "Submit Quiz".
                  </li>
                  <li>You can only attempt this quiz once.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSubmission;
