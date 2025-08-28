"use client";

import { motion } from "framer-motion";
import { FaChalkboardTeacher } from "react-icons/fa";
import MaxWidthWrapper from "../../utils/MaxWidthWrapper";
import MainTitle from "../../utils/MainTitle";

export default function DashboardHeader({ user, coursesCount, lecturesCount }) {
  return (
    <div className="bg-gradient-to-br from-indigo-700 to-purple-900 py-10">
      <MaxWidthWrapper>
        <MainTitle
          titleColor="text-white"
          title="Teacher Dashboard"
          subtitle="Manage your courses, lectures, and quizzes"
        />

        {/* Teacher info summary */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mt-6 flex items-center border border-white border-opacity-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        >
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <FaChalkboardTeacher className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="font-medium text-white">
              {user?.data?.name || "Instructor"}
            </h3>
            <p className="text-sm text-indigo-100">
              {coursesCount} Courses Assigned
            </p>
          </div>
          <div className="ml-auto bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <span className="text-xs font-medium text-white">
              {lecturesCount} Total Lectures
            </span>
          </div>
        </motion.div>
      </MaxWidthWrapper>
    </div>
  );
}
