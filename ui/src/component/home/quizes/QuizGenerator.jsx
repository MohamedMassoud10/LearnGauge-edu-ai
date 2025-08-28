"use client";

import { useState, useEffect } from "react";
import {
  FaSpinner,
  FaCheck,
  FaTimes,
  FaSave,
  FaRedo,
  FaEdit,
  FaFilePdf,
  FaBookOpen,
  FaQuestionCircle,
  FaRobot,
  FaComments,
} from "react-icons/fa";
import { useAuthContext } from "../../../hooks/useAuthContext";
import ChatBot from "./ChatBot";

const QuizGenerator = ({ lectures, courseId, onClose }) => {
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);
  const [showLectureSelection, setShowLectureSelection] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showChatBot, setShowChatBot] = useState(false);
  const { user } = useAuthContext();
  const token = user?.token;

  // Question count options
  const questionCountOptions = [
    { value: 5, label: "5 Questions", description: "Quick review" },
    { value: 10, label: "10 Questions", description: "Standard quiz" },
    { value: 15, label: "15 Questions", description: "Comprehensive" },
    { value: 20, label: "20 Questions", description: "Detailed assessment" },
  ];

  // Set default quiz title when lectures change
  useEffect(() => {
    if (selectedLectures.length > 0) {
      if (selectedLectures.length === 1) {
        setQuizTitle(
          `Quiz for Lecture ${selectedLectures[0].number} (${selectedQuestionCount} Questions)`
        );
      } else {
        const lectureNumbers = selectedLectures
          .map((l) => l.number)
          .sort((a, b) => a - b);
        setQuizTitle(
          `Quiz for Lectures ${lectureNumbers.join(
            ", "
          )} (${selectedQuestionCount} Questions)`
        );
      }
    }
  }, [selectedLectures, selectedQuestionCount]);

  // Simulate progress during generation
  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationProgress((prev) => {
          const newProgress = prev + (90 - prev) * 0.1;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 1000);
    } else {
      setGenerationProgress(0);
    }

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleLectureToggle = (lecture) => {
    setSelectedLectures((prev) => {
      const isSelected = prev.some((l) => l._id === lecture._id);
      if (isSelected) {
        return prev.filter((l) => l._id !== lecture._id);
      } else {
        return [...prev, lecture];
      }
    });
  };

  const selectAllLectures = () => {
    setSelectedLectures(lectures);
  };

  const clearAllLectures = () => {
    setSelectedLectures([]);
  };

  const proceedToGeneration = () => {
    if (selectedLectures.length === 0) {
      alert("Please select at least one lecture");
      return;
    }
    setShowLectureSelection(false);
  };

  const backToSelection = () => {
    setShowLectureSelection(true);
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  const generateQuiz = async () => {
    setError(null);
    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      // Calculate questions per lecture
      const questionsPerLecture = Math.max(
        1,
        Math.floor(selectedQuestionCount / selectedLectures.length)
      );
      const remainingQuestions =
        selectedQuestionCount % selectedLectures.length;

      // Prepare lecture data for API
      const lectureData = selectedLectures.map((lecture, index) => ({
        pdfUrl: lecture.pdf,
        lectureId: lecture._id,
        lectureNumber: lecture.number,
        questionsCount:
          questionsPerLecture + (index < remainingQuestions ? 1 : 0), // Distribute remaining questions
      }));

      const response = await fetch(
        "http://127.0.0.1:8000/api/quiz-generator/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lectures: lectureData,
            courseId: courseId,
            totalQuestions: selectedQuestionCount,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const questionsWithIds = data.data.questions.map((q, idx) => ({
          ...q,
          id: `q-${Date.now()}-${idx}`,
        }));

        setQuestions(questionsWithIds);
        setGenerationProgress(100);
      } else {
        setError(data.message || "Error generating quiz");
        console.log("Error generating quiz: " + data.message);
      }
    } catch (error) {
      setError("Network error or server unavailable");
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const restartQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: (correct / questions.length) * 100,
    };
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/quiz-generator/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            questions,
            courseId,
            lectureIds: selectedLectures.map((l) => l._id),
            title: quizTitle,
            questionCount: selectedQuestionCount,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Quiz saved successfully!");
        onClose();
      } else {
        alert("Error saving quiz: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving quiz");
    } finally {
      setSaving(false);
    }
  };

  // Lecture Selection Screen
  if (showLectureSelection) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FaBookOpen className="w-6 h-6 text-[#014D89] mr-3" />
                <h3 className="text-2xl font-bold text-[#014D89]">
                  Create Custom Quiz
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {/* Chat with AI Instructor Button */}
                <button
                  onClick={() => setShowChatBot(true)}
                  disabled={selectedLectures.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaRobot className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Chat with AI Instructor
                  </span>
                  <span className="sm:hidden">AI Chat</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              Customize your quiz by selecting lectures and choosing the number
              of questions you want to generate.
            </p>

            {/* Question Count Selection */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-4">
                <FaQuestionCircle className="w-5 h-5 text-[#014D89] mr-2" />
                <h4 className="text-lg font-semibold text-[#014D89]">
                  Number of Questions
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {questionCountOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedQuestionCount === option.value
                        ? "border-[#014D89] bg-[#014D89] text-white shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <input
                      type="radio"
                      name="questionCount"
                      value={option.value}
                      checked={selectedQuestionCount === option.value}
                      onChange={(e) =>
                        setSelectedQuestionCount(
                          Number.parseInt(e.target.value)
                        )
                      }
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">
                        {option.value}
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {option.label.split(" ")[1]}
                      </div>
                      <div className="text-xs opacity-75">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Questions will be distributed evenly across your selected
                lectures
              </p>
            </div>

            {/* Lecture Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#014D89]">
                  Select Lectures
                </h4>
                <div className="flex gap-4">
                  <button
                    onClick={selectAllLectures}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Select All ({lectures?.length})
                  </button>
                  <button
                    onClick={clearAllLectures}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Selected:{" "}
                    <span className="font-medium">
                      {selectedLectures?.length}
                    </span>{" "}
                    of <span className="font-medium">{lectures?.length}</span>{" "}
                    lectures
                  </span>
                  {selectedLectures.length > 0 && (
                    <span className="text-[#014D89] font-medium">
                      ~
                      {Math.floor(
                        selectedQuestionCount / selectedLectures.length
                      )}{" "}
                      questions per lecture
                    </span>
                  )}
                </div>
              </div>

              {/* Lectures Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lectures?.map((lecture) => {
                  const isSelected = selectedLectures.some(
                    (l) => l._id === lecture._id
                  );
                  return (
                    <div
                      key={lecture._id}
                      onClick={() => handleLectureToggle(lecture)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-[#014D89] bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-full ${
                              isSelected ? "bg-[#014D89]" : "bg-gray-100"
                            }`}
                          >
                            <FaFilePdf
                              className={`w-4 h-4 ${
                                isSelected ? "text-white" : "text-red-500"
                              }`}
                            />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-800">
                              Lecture {lecture.number}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {new Date(lecture.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <FaCheck className="text-[#014D89] w-5 h-5" />
                        )}
                      </div>

                      {lecture.title && (
                        <p className="text-sm text-gray-600 mb-2">
                          {lecture.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>PDF Available</span>
                        {isSelected && selectedLectures.length > 0 && (
                          <span className="bg-[#014D89] text-white px-2 py-1 rounded">
                            ~
                            {Math.ceil(
                              selectedQuestionCount / selectedLectures.length
                            )}{" "}
                            questions
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary and Action Buttons */}
            <div className="border-t pt-6">
              {selectedLectures.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">
                    Quiz Summary
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-600">Lectures:</span>
                      <span className="font-medium ml-1">
                        {selectedLectures.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-600">Questions:</span>
                      <span className="font-medium ml-1">
                        {selectedQuestionCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-600">Estimated time:</span>
                      <span className="font-medium ml-1">
                        {Math.ceil(selectedQuestionCount * 1.5)} minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={proceedToGeneration}
                  disabled={selectedLectures.length === 0}
                  className="bg-[#014D89] hover:bg-[#01396a] disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex-1 flex items-center justify-center"
                >
                  <FaBookOpen className="mr-2" />
                  Generate {selectedQuestionCount} Questions from{" "}
                  {selectedLectures.length} Lecture
                  {selectedLectures.length !== 1 ? "s" : ""}
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ChatBot Component */}
        <ChatBot
          lectures={selectedLectures}
          isOpen={showChatBot}
          onClose={() => setShowChatBot(false)}
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FaTimes className="text-4xl text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#014D89] mb-2">
              Error Generating Quiz
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setError(null)}
                className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-2 px-6 rounded-lg transition-colors flex-1"
              >
                Try Again
              </button>
              <button
                onClick={backToSelection}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex-1"
              >
                Back to Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-[#014D89] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#014D89] mb-2">
              Generating Quiz
            </h3>
            <p className="text-gray-600 mb-4">
              AI is analyzing {selectedLectures.length} lecture
              {selectedLectures.length !== 1 ? "s" : ""} and creating{" "}
              {selectedQuestionCount} questions...
            </p>

            {/* Selected lectures and question count preview */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Generating {selectedQuestionCount} questions from:
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {selectedLectures.map((lecture) => (
                  <span
                    key={lecture._id}
                    className="bg-[#014D89] text-white text-xs px-2 py-1 rounded"
                  >
                    Lecture {lecture.number}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-[#014D89] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              This may take up to {Math.ceil(selectedLectures.length * 30)}{" "}
              seconds
            </p>

            <button
              onClick={backToSelection}
              className="mt-6 text-gray-500 hover:text-gray-700 font-medium"
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#014D89] mb-4">
              Generate Quiz
            </h3>
            <p className="text-gray-600 mb-6">
              Generate {selectedQuestionCount} quiz questions from{" "}
              {selectedLectures.length} selected lecture
              {selectedLectures.length !== 1 ? "s" : ""} using AI
            </p>
            <div className="flex gap-4">
              <button
                onClick={generateQuiz}
                className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-2 px-6 rounded-lg transition-colors flex-1 flex items-center justify-center"
              >
                <span>Generate {selectedQuestionCount} Questions</span>
              </button>
              <button
                onClick={backToSelection}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex-1"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passThreshold = 70;
    const passed = score.percentage >= passThreshold;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#014D89] mb-2">
              Quiz Results
            </h3>

            {/* Score display */}
            <div className="mb-4">
              <div className="inline-block rounded-full p-1 bg-gray-100">
                <div
                  className={`text-3xl font-bold rounded-full w-24 h-24 flex items-center justify-center ${
                    passed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {score.percentage.toFixed(0)}%
                </div>
              </div>
              <p className="text-lg mt-2">
                <span className={passed ? "text-green-600" : "text-red-600"}>
                  {score.correct}
                </span>
                <span className="text-gray-400">/{score.total} correct</span>
              </p>
              <p
                className={`text-sm font-medium mt-1 ${
                  passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {passed ? "Passed!" : "Try again to improve your score"}
              </p>
            </div>

            {/* Quiz info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="border-b border-gray-300 focus:border-[#014D89] bg-transparent py-1 px-2 text-center text-lg font-medium outline-none"
                  placeholder="Enter quiz title"
                />
                <FaEdit className="text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {selectedLectures.map((lecture) => (
                  <span
                    key={lecture._id}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    Lecture {lecture.number}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedQuestionCount} questions generated
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div
                  key={question.id || index}
                  className={`border rounded-lg p-4 ${
                    isCorrect ? "border-green-200" : "border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    {isCorrect ? (
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <FaTimes className="text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <h4 className="font-medium text-gray-800">
                      {index + 1}. {question.question}
                    </h4>
                    {question.lectureNumber && (
                      <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        Lecture {question.lectureNumber}
                      </span>
                    )}
                  </div>

                  <div className="ml-6 space-y-2">
                    {Object.entries(question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-2 rounded ${
                          key === question.correctAnswer
                            ? "bg-green-100 border border-green-300"
                            : key === userAnswer && !isCorrect
                            ? "bg-red-100 border border-red-300"
                            : "bg-gray-50"
                        }`}
                      >
                        <span className="font-medium">{key}.</span> {value}
                        {key === question.correctAnswer && (
                          <span className="text-green-600 font-medium ml-2">
                            ✓ Correct
                          </span>
                        )}
                        {key === userAnswer && !isCorrect && (
                          <span className="text-red-600 font-medium ml-2">
                            ✗ Your answer
                          </span>
                        )}
                      </div>
                    ))}

                    <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t">
            <button
              onClick={saveQuiz}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              Close Quiz
            </button>
            <button
              onClick={restartQuiz}
              className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaRedo className="mr-2" />
              Try Again
            </button>
            <button
              onClick={backToSelection}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  // Add floating chat button to other screens
  const FloatingChatButton = () => {
    if (selectedLectures.length === 0) return null;

    return (
      <button
        onClick={() => setShowChatBot(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center group transition-all duration-300 hover:scale-110"
        title="Chat with AI Instructor"
      >
        <FaComments className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap">
          Ask AI Instructor
        </span>
      </button>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#014D89]">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h3>
            <div className="text-sm text-gray-500">
              Progress:{" "}
              {Math.round(
                ((currentQuestionIndex + 1) / questions.length) * 100
              )}
              %
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-[#014D89] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-800 flex-1">
                {currentQuestion.question}
              </h4>
              {currentQuestion.lectureNumber && (
                <span className="ml-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex-shrink-0">
                  Lecture {currentQuestion.lectureNumber}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <label
                  key={key}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    userAnswers[currentQuestionIndex] === key
                      ? "bg-[#014D89] text-white border-[#014D89]"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={key}
                    checked={userAnswers[currentQuestionIndex] === key}
                    onChange={() =>
                      handleAnswerSelect(currentQuestionIndex, key)
                    }
                    className="sr-only"
                  />
                  <span className="font-medium">{key}.</span> {value}
                </label>
              ))}
            </div>
          </div>

          {/* Question Navigation */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${
                  currentQuestionIndex === index
                    ? "bg-[#014D89] text-white"
                    : userAnswers[index] !== undefined
                    ? "bg-green-100 text-green-800 border border-green-400"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Fixed: Navigation buttons now inside the container */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Previous
            </button>

            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-medium">{answeredCount}</span> /{" "}
              {questions.length} answered
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={answeredCount !== questions.length}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                className="bg-[#014D89] hover:bg-[#01396a] text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Next
              </button>
            )}
          </div>

          {answeredCount !== questions.length &&
            currentQuestionIndex === questions.length - 1 && (
              <p className="text-center text-orange-600 text-sm mt-4">
                Please answer all questions before submitting
              </p>
            )}
        </div>
      </div>
      <FloatingChatButton />
      <ChatBot
        lectures={selectedLectures}
        isOpen={showChatBot}
        onClose={() => setShowChatBot(false)}
      />
    </>
  );
};

export default QuizGenerator;
