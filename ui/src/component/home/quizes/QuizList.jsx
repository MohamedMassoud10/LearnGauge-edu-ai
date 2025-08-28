"use client";

import { useState } from "react";

import AddQuizModal from "./AddQuizModal";
import QuizCard from "./QuizCard";
import { useQuizzesByCourse } from "../../../hooks/useQuizzes";
import Loader from "../../../utils/Loader";

const QuizList = ({ courseId, courseName }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    data: quizzesData,
    isLoading,
    isError,
  } = useQuizzesByCourse(courseId);

  const quizzes = quizzesData?.data?.data || [];

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quizzes</h2>
          <p className="text-gray-500 text-sm mt-1">
            {courseName} course • {filteredQuizzes.length} quizzes
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-red-500">
            Failed to load quizzes. Please try again later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}

          {/* Add New Quiz */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-6 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 cursor-pointer h-full min-h-[220px]"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <span className="text-blue-600 text-2xl">+</span>
            </div>
            <p className="font-medium text-gray-700 text-center text-lg">
              Create New Quiz
            </p>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Add questions, set duration and schedule
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredQuizzes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-gray-400 text-2xl">⏱️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-700">
            No quizzes found
          </h3>
          <p className="text-gray-500 mt-1 text-center">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Create your first quiz for this course"}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span>+</span>
            Create New Quiz
          </button>
        </div>
      )}

      {/* Add Quiz Modal */}
      {isAddModalOpen && (
        <AddQuizModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          courseId={courseId}
        />
      )}
    </div>
  );
};

export default QuizList;
