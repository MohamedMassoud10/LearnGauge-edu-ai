"use client";

import { motion } from "framer-motion";
import { FaGraduationCap, FaBook } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";

export default function CourseDetails({ course }) {
  return (
    <motion.div
      className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.6,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100"
          whileHover={{
            y: -5,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">
            {course.name}
          </h3>

          <div className="space-y-2">
            {course.department && (
              <div className="flex items-center text-gray-600">
                <FaGraduationCap className="mr-2 text-indigo-500" />
                <span>Department: {course.department}</span>
              </div>
            )}

            {course.duration && (
              <div className="flex items-center text-gray-600">
                <IoTimeOutline className="mr-2 text-indigo-500" />
                <span>Duration: {course.duration} hours/week</span>
              </div>
            )}

            {course.code && (
              <div className="flex items-center text-gray-600">
                <FaBook className="mr-2 text-indigo-500" />
                <span>Course Code: {course.code}</span>
              </div>
            )}
          </div>

          {course.description && (
            <div className="mt-4 pt-4 border-t border-indigo-100">
              <p className="text-gray-700">{course.description}</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
