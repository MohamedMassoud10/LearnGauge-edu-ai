"use client";

import { motion } from "framer-motion";
import { FaBook } from "react-icons/fa";

export default function CourseSelection({
  courses,
  selectedCourse,
  onCourseSelect,
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

  const courseButtonVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    tap: { scale: 0.95 },
    hover: { y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
  };

  return (
    <motion.div
      className="mt-10 mb-6"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
    >
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <FaBook className="mr-2 text-indigo-600" />
        Your Courses
      </h2>

      <motion.div
        className="flex flex-wrap gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <motion.button
              key={course._id}
              onClick={() => onCourseSelect(course.name)}
              className={`px-6 py-2 rounded-full transition-all duration-200 font-medium text-sm flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 ${
                course.name === selectedCourse
                  ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-sm"
                  : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-400"
              }`}
              variants={courseButtonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: index * 0.05 }}
            >
              <FaBook
                className={`text-lg ${
                  course.name === selectedCourse
                    ? "text-indigo-600"
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
    </motion.div>
  );
}
