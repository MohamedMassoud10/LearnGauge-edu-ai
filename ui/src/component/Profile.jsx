"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaEnvelope,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaIdCard,
  FaUniversity,
  FaChartLine,
  FaBuilding,
  FaBookOpen,
} from "react-icons/fa";
import { useLoggedUser } from "../hooks/useUsers";

const Profile = () => {
  const { data, isLoading, isError } = useLoggedUser();
  const [activeTab, setActiveTab] = useState("overview");
  const userData = localStorage.getItem("user");
  const parsedUser = userData ? JSON.parse(userData) : null;
  const user = parsedUser?.data;

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen"
      >
        <div className="bg-red-50 text-red-500 p-6 rounded-lg shadow-md">
          <p className="text-xl font-medium">No user data available.</p>
        </div>
      </motion.div>
    );
  }

  const isStudent = user?.role === "student";
  const isInstructor = user?.role === "instructor";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const cardVariants = {
    initial: { scale: 0.96, y: 30, opacity: 0 },
    animate: {
      scale: 1,
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    hover: {
      y: -5,
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 500, damping: 25 },
    },
  };

  const tabVariants = {
    inactive: { color: "#94a3b8", borderColor: "transparent" },
    active: {
      color: "#3b82f6",
      borderColor: "#3b82f6",
      transition: { duration: 0.3 },
    },
  };

  const InfoItem = ({ label, value }) => (
    <motion.div variants={itemVariants} className="mb-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-medium">{value || "N/A"}</p>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br p-4 md:p-8"
    >
      <motion.div
        className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        {/* Header Section */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="flex flex-col md:flex-row items-center md:items-start gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full bg-white p-1 shadow-lg flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                <FaUserCircle className="text-blue-500 w-24 h-24" />
              </div>
            </motion.div>

            <div className="text-center md:text-left">
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {user?.name}
              </motion.h1>

              <motion.div
                className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                {isStudent ? (
                  <>
                    <FaGraduationCap className="mr-2" />
                    <span>Student</span>
                  </>
                ) : isInstructor ? (
                  <>
                    <FaChalkboardTeacher className="mr-2" />
                    <span>Instructor</span>
                  </>
                ) : (
                  <span>{user?.role}</span>
                )}
              </motion.div>

              {isStudent && (
                <motion.div
                  className="text-blue-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center">
                    <FaIdCard className="mr-2" />
                    <span>Student ID: {user?.studentId}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="border-b border-gray-200 px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex overflow-x-auto space-x-8">
            <motion.button
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "overview" ? "active" : "inactive"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("overview")}
              className="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none"
            >
              Overview
            </motion.button>

            {isStudent && (
              <motion.button
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === "academic" ? "active" : "inactive"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("academic")}
                className="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none"
              >
                Academic Information
              </motion.button>
            )}

            {isInstructor && (
              <motion.button
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === "teaching" ? "active" : "inactive"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("teaching")}
                className="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none"
              >
                Teaching Information
              </motion.button>
            )}

            <motion.button
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "contact" ? "active" : "inactive"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("contact")}
              className="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none"
            >
              Contact Information
            </motion.button>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaUserCircle className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Profile Summary
                  </h2>
                </div>

                <motion.div variants={containerVariants}>
                  <InfoItem label="Name" value={user?.name} />
                  <InfoItem label="Role" value={user?.role} />
                  {isStudent && (
                    <InfoItem label="Student ID" value={user?.studentId} />
                  )}
                  {isInstructor && (
                    <InfoItem label="Department" value={user?.department} />
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaEnvelope className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Contact Details
                  </h2>
                </div>

                <motion.div variants={containerVariants}>
                  <InfoItem label="Email" value={user?.email} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Academic Information Tab */}
          {activeTab === "academic" && isStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-6"
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaUniversity className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Program Information
                  </h2>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={containerVariants}
                >
                  <InfoItem label="Program" value={user?.program} />
                  <InfoItem
                    label="Academic Level"
                    value={user?.academicLevel}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaChartLine className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Academic Performance
                  </h2>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={containerVariants}
                >
                  <InfoItem label="CGPA" value={user?.cgpa} />
                  <InfoItem label="Credit Hours" value={user?.creditHours} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Teaching Information Tab */}
          {activeTab === "teaching" && isInstructor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaBuilding className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Department Information
                  </h2>
                </div>

                <motion.div variants={containerVariants}>
                  <InfoItem label="Department" value={user?.department} />
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mt-6"
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaBookOpen className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Courses
                  </h2>
                </div>

                <motion.div variants={containerVariants}>
                  {user?.courses && user.courses.length > 0 ? (
                    <div className="space-y-3">
                      {user.courses.map((course, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="bg-white p-4 rounded-lg shadow-sm border border-blue-100"
                        >
                          <p className="font-medium">{course}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No courses assigned</p>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaEnvelope className="text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Contact Information
                  </h2>
                </div>

                <motion.div variants={containerVariants}>
                  <InfoItem label="Email" value={user?.email} />
                  {/* Add more contact information here if available */}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
