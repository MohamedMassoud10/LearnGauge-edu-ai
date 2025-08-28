"use client";

import { useState } from "react";
import QuizDetailsModal from "./QuizDetailsModal";

const QuizCard = ({ quiz }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition-all duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              {/* Status Badge */}
              {isActive && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 mb-2">
                  Active
                </span>
              )}
              {isPast && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 mb-2">
                  Completed
                </span>
              )}
              {isFuture && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-2">
                  Upcoming
                </span>
              )}

              <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                {quiz.title}
              </h3>
            </div>

            <div className="relative">
              <button
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  const menu = document.getElementById(`menu-${quiz._id}`);
                  menu.classList.toggle("hidden");
                }}
              >
                ⋮
              </button>
              <div
                id={`menu-${quiz._id}`}
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden"
              >
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setShowDetails(true)}
                  >
                    <span>👁️</span>
                    <span>View Details</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <span>✏️</span>
                    <span>Edit Quiz</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2">
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
            {quiz.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className="text-blue-500">⏱️</span>
              <span>{quiz.duration} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className="text-purple-500">👥</span>
              <span>{totalQuestions} questions</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
            <span className="text-green-500">📅</span>
            <span>Starts: {formatDate(startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="text-red-500">📅</span>
            <span>Ends: {formatDate(endDate)}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Total Points:
            </span>
            <span className="ml-2 text-blue-600 font-semibold">
              {totalPoints}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
              onClick={() => setShowDetails(true)}
            >
              👁️
            </button>
            <button className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
              ✏️
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Details Modal */}
      {showDetails && (
        <QuizDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          quiz={quiz}
        />
      )}
    </>
  );
};

export default QuizCard;
