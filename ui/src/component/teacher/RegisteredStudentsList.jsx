"use client";

import { motion } from "framer-motion";
import { FaUserGraduate } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiErrorCircle } from "react-icons/bi";
import { useAllStudentsRegisteredACourse } from "../../hooks/useCourseRegistration";

export default function RegisteredStudentsList({ courseId }) {
  const {
    data: studentsData,
    isLoading,
    isError,
  } = useAllStudentsRegisteredACourse(courseId);

  // Animation variants
  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }),
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <AiOutlineLoading3Quarters className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading students...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-12 text-red-500">
        <BiErrorCircle className="w-8 h-8 mr-2" />
        <span>Error loading student data. Please try again.</span>
      </div>
    );
  }

  const students = studentsData?.data?.data || [];

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <FaUserGraduate className="text-indigo-400 text-2xl" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-700">
          No students registered
        </h3>
        <p className="text-gray-500 mt-1">
          No students have registered for this course yet
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Student
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Major
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Academic Level
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              GPA
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Semester
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Grade
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((registration, index) => (
            <motion.tr
              key={registration._id}
              custom={index}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FaUserGraduate className="text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {registration?.student?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration?.student?.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {registration?.student?.studentId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {registration?.student?.major}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {registration?.student?.academicLevel}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {registration?.student?.gpa}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {registration?.semester} ({registration?.academicYear})
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {registration?.grade || "Not graded"}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
