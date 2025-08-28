"use client";

import { motion } from "framer-motion";
import RegisteredStudentsList from "./RegisteredStudentsList";

export default function StudentsTab({ selectedCourse, currentCourse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <motion.div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Registered Students
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {selectedCourse} course students
        </p>
      </motion.div>

      {/* Students List */}
      {currentCourse && <RegisteredStudentsList courseId={currentCourse._id} />}
    </motion.div>
  );
}
