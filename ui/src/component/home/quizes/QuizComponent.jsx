"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiBook,
  FiClock,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiAward,
} from "react-icons/fi";
import MaxWidthWrapper from "../../../utils/MaxWidthWrapper";
import { useInstructorCourses } from "../../../hooks/useTeacherCourses";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useQuizzesByCourse } from "../../../hooks/useQuizes";
import CreateQuizModal from "./AddQuizModal";
import Loader from "../../../utils/Loader";

export default function QuizComponent() {
  const { user } = useAuthContext();
  const instructorId = user?.data?._id;

  const {
    data: AssignedCourses,
    isLoading: Loading,
    isError,
  } = useInstructorCourses(instructorId);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get assigned course IDs for filtering
  const assignedCourseIds =
    AssignedCourses?.data?.data?.map((course) => course._id) || [];

  // Find the currently selected course object
  const currentCourse = AssignedCourses?.data?.data?.find(
    (course) => course.name === selectedCourse
  );

  // Set initial selected course if there are assigned courses and none selected yet
  if (selectedCourse === "" && AssignedCourses?.data?.data?.length > 0) {
    setSelectedCourse(AssignedCourses.data.data[0].name);
  }

  // Fetch quizzes for the selected course
  const { data: quizzesData, isLoading: quizzesLoading } = useQuizzesByCourse(
    currentCourse?._id
  );

  // Get all quizzes for the selected course
  const quizzes = quizzesData?.data?.data || [];

  // Filter quizzes by search query
  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle opening the create quiz modal
  const handleCreateQuiz = () => {
    if (!currentCourse) {
      alert("Please select a course first");
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate status of quiz (upcoming, active, ended)
  const getQuizStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { status: "upcoming", color: "amber" };
    if (now > end) return { status: "ended", color: "gray" };
    return { status: "active", color: "green" };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const courseButtonVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    tap: { scale: 0.95 },
    hover: { y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
  };

  const quizCardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
      },
    },
    tap: { scale: 0.98 },
  };

  return (
    <MaxWidthWrapper>
      <motion.div
        className="py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <motion.div
          className="mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quiz Management
          </h1>
          <p className="text-gray-500">
            Create and manage quizzes for your courses
          </p>
        </motion.div>

        {/* Course Selection */}
        <motion.div
          className="mb-10"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Your Courses
          </h2>

          {/* Loading State */}
          {Loading ? (
            <Loader />
          ) : isError ? (
            <motion.p
              className="text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Failed to load courses. Try again later.
            </motion.p>
          ) : (
            <motion.div
              className="flex flex-wrap gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {AssignedCourses?.data?.data?.length > 0 ? (
                AssignedCourses.data.data.map((course, index) => (
                  <motion.button
                    key={course._id}
                    onClick={() => setSelectedCourse(course.name)}
                    className={`px-6 py-2 rounded-full transition-all duration-200 font-medium text-sm flex items-center gap-2 focus:ring-2 focus:ring-purple-500 ${
                      course.name === selectedCourse
                        ? "bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-sm"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-400"
                    }`}
                    variants={courseButtonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: index * 0.05 }}
                  >
                    <FiBook
                      className={`text-lg ${
                        course.name === selectedCourse
                          ? "text-purple-600"
                          : "text-gray-500"
                      }`}
                    />
                    {course.name}
                  </motion.button>
                ))
              ) : (
                <motion.p
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  No courses assigned yet.
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Quizzes Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.3,
          }}
        >
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
            variants={itemVariants}
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Quizzes</h2>
              <p className="text-gray-500 text-sm mt-1">
                {selectedCourse} course • {filteredQuizzes.length} quizzes
              </p>
            </div>

            {/* Search and Filter */}
            <motion.div
              className="flex gap-3 w-full sm:w-auto"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.4,
              }}
            >
              <div className="relative flex-grow sm:flex-grow-0">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <motion.input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.2)",
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <motion.button
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiFilter className="text-gray-500" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Quizzes Grid */}
          {quizzesLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredQuizzes.map((quiz, index) => {
                  const { status, color } = getQuizStatus(
                    quiz.startDate,
                    quiz.endDate
                  );

                  return (
                    <motion.div
                      key={quiz._id}
                      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-purple-200"
                      variants={quizCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileTap="tap"
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors line-clamp-1">
                              {quiz.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {quiz.description}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}
                          >
                            {status}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiClock className="mr-1 text-purple-500" />
                            {quiz.duration} min
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiAward className="mr-1 text-purple-500" />
                            {quiz.totalPoints} points
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="mr-1 text-purple-500" />
                            {formatDate(quiz.startDate)}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              {quiz.questions.length} questions
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                className="p-2 rounded-full hover:bg-purple-50 text-purple-600"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiEdit size={16} />
                              </motion.button>
                              <motion.button
                                className="p-2 rounded-full hover:bg-red-50 text-red-500"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FiTrash2 size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Add New Quiz */}
                <motion.div
                  onClick={handleCreateQuiz}
                  className="flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 cursor-pointer h-full min-h-[220px]"
                  variants={quizCardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(243, 232, 255, 1)",
                    borderColor: "rgba(192, 132, 252, 1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiPlus className="text-purple-600 text-2xl" />
                  </motion.div>
                  <p className="font-medium text-gray-700 text-center text-lg">
                    Create New Quiz
                  </p>
                  <p className="text-sm text-gray-500 mt-2 text-center max-w-[200px]">
                    Add questions, set time limits, and schedule your quiz
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          <AnimatePresence>
            {!quizzesLoading && filteredQuizzes.length === 0 && (
              <motion.div
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <motion.div
                  className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2,
                  }}
                >
                  <FiAward className="text-purple-500 text-3xl" />
                </motion.div>
                <motion.h3
                  className="text-xl font-medium text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  No quizzes found
                </motion.h3>
                <motion.p
                  className="text-gray-500 mt-2 text-center max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {assignedCourseIds.length === 0
                    ? "No courses have been assigned to you yet"
                    : "Create your first quiz to test your students' knowledge"}
                </motion.p>
                <motion.button
                  className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
                  onClick={handleCreateQuiz}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus />
                  Create New Quiz
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courseId={currentCourse?._id}
      />
    </MaxWidthWrapper>
  );
}
