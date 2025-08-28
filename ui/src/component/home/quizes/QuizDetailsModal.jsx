"use client";

import { useState } from "react";
import { useSubmissionsByQuiz } from "../../../hooks/useQuizzes.js";
const QuizDetailsModal = ({ isOpen, onClose, quiz }) => {
  const [expandedSubmissions, setExpandedSubmissions] = useState(new Set());

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useSubmissionsByQuiz(quiz?._id);

  console.log(quiz);
  if (!isOpen || !quiz) return null;

  // Format dates
  const startDate = new Date(quiz.startDate);
  const endDate = new Date(quiz.endDate);
  const isActive = new Date() >= startDate && new Date() <= endDate;
  const isPast = new Date() > endDate;
  const isFuture = new Date() < startDate;

  // Calculate total questions and points
  const totalQuestions = quiz.questions.length;
  const totalPoints =
    quiz.totalPoints || quiz.questions.reduce((sum, q) => sum + q.points, 0);

  // Format date to readable string
  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle submission expansion
  const toggleSubmission = (submissionId) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  // Get submissions data
  const submissions = submissionsData?.data?.data || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-[900px] max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          <button
            onClick={onClose}
            className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Quiz Status */}
            <div className="flex items-center gap-2">
              {isActive && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              )}
              {isPast && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  Completed
                </span>
              )}
              {isFuture && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Upcoming
                </span>
              )}
            </div>

            {/* Quiz Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Description
              </h3>
              <p className="text-gray-700">{quiz.description}</p>
            </div>

            {/* Quiz Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Duration
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">⏱️</span>
                  <span className="text-gray-700">{quiz.duration} minutes</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Total Points
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{totalPoints} points</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Start Date
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">📅</span>
                  <span className="text-gray-700">{formatDate(startDate)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  End Date
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">📅</span>
                  <span className="text-gray-700">{formatDate(endDate)}</span>
                </div>
              </div>
            </div>

            {/* Submissions Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                Submissions ({submissions.length})
              </h3>

              {submissionsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">
                    Loading submissions...
                  </span>
                </div>
              )}

              {submissionsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Failed to load submissions</p>
                </div>
              )}

              {!submissionsLoading &&
                !submissionsError &&
                submissions.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                )}

              {!submissionsLoading &&
                !submissionsError &&
                submissions.length > 0 && (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="border rounded-lg overflow-hidden"
                      >
                        {/* Submission Header */}
                        <div
                          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleSubmission(submission._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {submission.student.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {submission.student.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                      submission.percentage >= 80
                                        ? "bg-green-100 text-green-800"
                                        : submission.percentage >= 60
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {submission.percentage}%
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {submission.score}/{totalPoints}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(new Date(submission.submittedAt))}
                                </p>
                              </div>

                              <div className="text-gray-400">
                                {expandedSubmissions.has(submission._id)
                                  ? "▼"
                                  : "▶"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submission Details */}
                        {expandedSubmissions.has(submission._id) && (
                          <div className="p-4 border-t bg-white">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <span className="text-sm font-medium text-gray-500">
                                  Time Spent:
                                </span>
                                <p className="text-gray-700">
                                  {submission.timeSpent} minutes
                                </p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500">
                                  Status:
                                </span>
                                <p className="text-gray-700">
                                  {submission.completed
                                    ? "Completed"
                                    : "Incomplete"}
                                </p>
                              </div>
                            </div>

                            {/* Answers Details */}
                            <div>
                              <h5 className="font-medium mb-3">Answers:</h5>
                              <div className="space-y-3">
                                {submission.answers.map((answer, index) => {
                                  const question =
                                    quiz.questions[answer.questionIndex];
                                  const isCorrect =
                                    answer.selectedOption ===
                                    question.correctAnswer;

                                  return (
                                    <div
                                      key={index}
                                      className="border rounded-lg p-3"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <h6 className="font-medium text-sm">
                                          Question {answer.questionIndex + 1}
                                        </h6>
                                        <span
                                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                            isCorrect
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {isCorrect ? "Correct" : "Incorrect"}
                                        </span>
                                      </div>

                                      <p className="text-sm text-gray-700 mb-2">
                                        {question.text}
                                      </p>

                                      <div className="space-y-1">
                                        <div
                                          className={`text-sm p-2 rounded ${
                                            isCorrect
                                              ? "bg-green-50 text-green-700"
                                              : "bg-red-50 text-red-700"
                                          }`}
                                        >
                                          <span className="font-medium">
                                            Selected:{" "}
                                          </span>
                                          {
                                            question.options[
                                              answer.selectedOption
                                            ]
                                          }
                                        </div>

                                        {!isCorrect && (
                                          <div className="text-sm p-2 rounded bg-green-50 text-green-700">
                                            <span className="font-medium">
                                              Correct:{" "}
                                            </span>
                                            {
                                              question.options[
                                                question.correctAnswer
                                              ]
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Questions */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                Questions ({totalQuestions})
              </h3>

              <div className="space-y-6">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full border">
                        {question.points} points
                      </span>
                    </div>

                    <p className="mb-4 text-gray-800">{question.text}</p>

                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border ${
                            question.correctAnswer === optIndex
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {question.correctAnswer === optIndex && (
                              <span className="text-green-500">✓</span>
                            )}
                            <span
                              className={
                                question.correctAnswer === optIndex
                                  ? "font-medium"
                                  : ""
                              }
                            >
                              {option}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsModal;
