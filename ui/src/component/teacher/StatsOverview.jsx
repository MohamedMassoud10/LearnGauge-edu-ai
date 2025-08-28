"use client";

import { motion } from "framer-motion";
import { FaBook, FaFileAlt } from "react-icons/fa";

export default function StatsOverview({ coursesCount, lecturesCount }) {
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

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-white rounded-lg shadow-md p-4 flex items-center"
        variants={itemVariants}
      >
        <div className="bg-indigo-100 p-3 rounded-full">
          <FaBook className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">Assigned Courses</p>
          <h3 className="text-xl font-bold text-gray-800">{coursesCount}</h3>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-lg shadow-md p-4 flex items-center"
        variants={itemVariants}
      >
        <div className="bg-purple-100 p-3 rounded-full">
          <FaFileAlt className="w-5 h-5 text-purple-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">Total Lectures</p>
          <h3 className="text-xl font-bold text-gray-800">{lecturesCount}</h3>
        </div>
      </motion.div>
    </motion.div>
  );
}
