"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFileAlt,
  FaDownload,
  FaPlus,
  FaCalendarAlt,
} from "react-icons/fa";

export default function LecturesTab({
  selectedCourse,
  filteredLectures,
  searchQuery,
  onSearchChange,
  onAddLecture,
  assignedCourseIds,
}) {
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

  const lectureCardVariants = {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lectures</h2>
          <p className="text-gray-500 text-sm mt-1">
            {selectedCourse} course • {filteredLectures.length} lectures
          </p>
        </div>

        {/* Search */}
        <motion.div
          className="flex gap-3 w-full sm:w-auto"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="relative flex-grow sm:flex-grow-0">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <motion.input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              whileFocus={{
                scale: 1.02,
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)",
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Lectures Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredLectures.map((lecture, index) => (
            <LectureCard
              key={lecture._id}
              lecture={lecture}
              index={index}
              variants={lectureCardVariants}
            />
          ))}

          {/* Add New Lecture */}
          <AddLectureCard
            onClick={onAddLecture}
            variants={lectureCardVariants}
          />
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      <AnimatePresence>
        {filteredLectures.length === 0 && (
          <EmptyLecturesState
            assignedCourseIds={assignedCourseIds}
            onAddLecture={onAddLecture}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Lecture Card Component
function LectureCard({ lecture, index, variants }) {
  return (
    <motion.div
      className="group flex flex-col items-center bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:border-indigo-200 cursor-pointer"
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <div className="relative mb-3">
        <motion.div
          className="w-20 h-20 bg-indigo-50 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: -5 }}
        >
          <FaFileAlt className="text-indigo-500 text-3xl" />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex gap-2">
            <motion.a
              href={lecture.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-50"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaFileAlt className="text-indigo-600" />
            </motion.a>
            <motion.a
              href={lecture.pdf}
              download
              className="p-2 bg-white rounded-full shadow-sm hover:bg-indigo-50"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaDownload className="text-indigo-600" />
            </motion.a>
          </div>
        </motion.div>
      </div>
      <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
        Lecture {lecture.number || "Unknown"}
      </h3>
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <FaCalendarAlt className="mr-1" />
        <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}

// Add Lecture Card Component
function AddLectureCard({ onClick, variants }) {
  return (
    <motion.div
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-4 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 cursor-pointer h-full min-h-[160px]"
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(238, 242, 255, 1)",
        borderColor: "rgba(165, 180, 252, 1)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2"
        whileHover={{ rotate: 90 }}
        transition={{ duration: 0.3 }}
      >
        <FaPlus className="text-indigo-600 text-xl" />
      </motion.div>
      <p className="font-medium text-gray-700 text-center">Add New Lecture</p>
      <p className="text-xs text-gray-500 mt-1 text-center">
        Upload PDF or document
      </p>
    </motion.div>
  );
}

// Empty Lectures State Component
function EmptyLecturesState({ assignedCourseIds, onAddLecture }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12"
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
        className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
      >
        <FaFileAlt className="text-indigo-400 text-2xl" />
      </motion.div>
      <motion.h3
        className="text-lg font-medium text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        No lectures found
      </motion.h3>
      <motion.p
        className="text-gray-500 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {assignedCourseIds.length === 0
          ? "No courses have been assigned to you yet"
          : "Try adjusting your search or filters"}
      </motion.p>
      <motion.button
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        onClick={onAddLecture}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <FaPlus />
        Add New Lecture
      </motion.button>
    </motion.div>
  );
}
