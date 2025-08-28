"use client";

import { Link } from "react-router-dom";
import MainTitle from "../../utils/MainTitle";
import MaxWidthWrapper from "../../utils/MaxWidthWrapper";
import {
  useStudentRegisteredCourses,
  useSuggestedCoursesForStudent,
  useRegisterCourse,
} from "../../hooks/useCourseRegistration";
import { useAuthContext } from "./../../hooks/useAuthContext";

// React Icons imports
import {
  FaGraduationCap,
  FaBookOpen,
  FaLightbulb,
  FaBook,
} from "react-icons/fa";
import { BiErrorCircle } from "react-icons/bi";
import { IoSchool, IoTimeOutline } from "react-icons/io5";
import { RiUserStarLine } from "react-icons/ri";
import { AiOutlineLoading3Quarters, AiOutlineMessage } from "react-icons/ai";
import { MdOutlineRecommend } from "react-icons/md";

import { useState } from "react";
import notify from "./../../hooks/useNotifaction";

const CoursesList = () => {
  const { user } = useAuthContext();

  // Pass the studentId to the hooks
  const {
    data: suggestedCoursesData,
    isLoading: isSuggestedCoursesLoading,
    isError: isSuggestedCoursesError,
  } = useSuggestedCoursesForStudent();
  console.log("suggestedCoursesData", suggestedCoursesData);
  const {
    data: registeredCoursesData,
    isLoading: isRegisteredCoursesLoading,
    isError: isRegisteredCoursesError,
  } = useStudentRegisteredCourses(user.data._id);

  // Use the register course mutation
  const registerCourseMutation = useRegisterCourse();

  // Extract the actual course data
  const suggestedCourses = suggestedCoursesData?.data.data;
  const registeredCourses = registeredCoursesData?.data.data;

  // Track locally registered courses to update UI immediately
  const [registeredCourseIds, setRegisteredCourseIds] = useState([]);

  const handleRegisterCourse = async (courseId) => {
    if (
      registerCourseMutation.isLoading ||
      registeredCourseIds.includes(courseId)
    )
      return;

    try {
      await registerCourseMutation.mutateAsync({
        studentId: user.data._id,
        courseId: courseId,
        semester: 1, // You might want to make this dynamic
        academicYear: "2024-2025", // You might want to make this dynamic
      });

      notify("Successfully registered for the course!", "success");
      setRegisteredCourseIds((prev) => [...prev, courseId]);
    } catch (error) {
      console.error("Error registering for course:", error);
      notify(
        error.response?.data?.message ||
          "Failed to register for the course. Please try again.",
        "error"
      );
    }
  };

  // Handle loading state
  if (isRegisteredCoursesLoading || isSuggestedCoursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AiOutlineLoading3Quarters className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Loading your courses...
        </p>
      </div>
    );
  }

  // Handle error state
  if (isRegisteredCoursesError || isSuggestedCoursesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BiErrorCircle className="w-12 h-12 text-red-600" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Error loading courses. Please try again.
        </p>
      </div>
    );
  }

  // Custom course card component
  const CourseCard = ({ course, type, status, onRegister }) => {
    // Determine card styles based on course type
    const getCardStyles = () => {
      switch (type) {
        case "registered":
          return {
            gradientClass: "from-emerald-400 to-teal-500",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            icon: <IoSchool className="w-5 h-5" />,
          };
        case "required":
          return {
            gradientClass: "from-red-400 to-rose-500",
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            icon: <FaBookOpen className="w-5 h-5" />,
          };
        case "optional":
          return {
            gradientClass: "from-violet-400 to-purple-500",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            icon: <MdOutlineRecommend className="w-5 h-5" />,
          };
        default:
          return {
            gradientClass: "from-blue-400 to-indigo-500",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            icon: <FaBook className="w-5 h-5" />,
          };
      }
    };

    const styles = getCardStyles();
    const isRegistering =
      registerCourseMutation.isLoading &&
      registerCourseMutation.variables?.courseId === course._id;
    const isAlreadyRegistered = registeredCourseIds?.includes(course?._id);

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div
          className={`h-24 bg-gradient-to-r ${styles.gradientClass} relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="font-bold text-lg">
              {course?.name || course?.title}
            </h3>
            {course?.code && (
              <p className="text-xs opacity-90">Code: {course?.code}</p>
            )}
          </div>
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2">
            {styles.icon}
          </div>
        </div>

        <div className="p-4">
          {course?.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {course?.description}
            </p>
          )}

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <IoTimeOutline className="w-4 h-4 mr-1" />
            <span>{course?.duration || 3} hours/week</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {course?.department && (
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                {course?.department}
              </span>
            )}

            {status && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {status}
              </span>
            )}

            {type && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  type === "required"
                    ? "bg-red-100 text-red-800"
                    : type === "optional"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {type === "required"
                  ? "Required"
                  : type === "optional"
                  ? "Optional"
                  : "Enrolled"}
              </span>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <RiUserStarLine className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-500">
                {course?.instructor ? "Has Instructor" : "Self-paced"}
              </span>
            </div>

            {type !== "registered" && onRegister ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRegister(course?._id);
                }}
                disabled={isRegistering || isAlreadyRegistered}
                className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                  isAlreadyRegistered
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isRegistering ? (
                  <span className="flex items-center">
                    <AiOutlineLoading3Quarters className="w-3 h-3 mr-1 animate-spin" />
                    Registering...
                  </span>
                ) : isAlreadyRegistered ? (
                  "Registered"
                ) : (
                  "Register"
                )}
              </button>
            ) : (
              <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                View Details →
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 py-10">
        <MaxWidthWrapper>
          <MainTitle
            titleColor="text-white"
            title="My Learning Dashboard"
            subtitle="Manage and explore your academic journey"
          />

          {/* Student info summary */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mt-6 flex items-center border border-white border-opacity-20">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaGraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-white">
                {user?.data?.name || "Student"}
              </h3>
              <p className="text-sm text-blue-100">
                Semester: {registeredCourses?.[0]?.semester || "Current"}
              </p>
            </div>
            <div className="ml-auto bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-xs font-medium text-white">
                {registeredCourses?.length || 0} Courses Enrolled
              </span>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaBookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Registered Courses</p>
              <h3 className="text-xl font-bold text-gray-800">
                {registeredCourses?.length || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-red-100 p-3 rounded-full"></div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Required Courses</p>
              <h3 className="text-xl font-bold text-gray-800">
                {suggestedCourses?.requiredCourses?.length || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaLightbulb className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Optional Courses</p>
              <h3 className="text-xl font-bold text-gray-800">
                {suggestedCourses?.optionalCourses?.length || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Registered Courses Section */}
        <div className="mt-10">
          <div className="flex items-center mb-6">
            <FaBookOpen className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              My Registered Courses
            </h2>
          </div>

          {registeredCourses && registeredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredCourses.map((registration, index) => (
                <Link key={index} to={`/courses/${registration?.course?._id}`}>
                  <CourseCard
                    course={registration?.course}
                    type="registered"
                    status={registration?.status}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <FaBookOpen className="w-10 h-10 text-blue-300 mx-auto mb-3" />
              <p className="text-gray-700">
                You haven't registered for any courses yet.
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Suggested Courses Section */}
        {suggestedCourses && (
          <div className="mt-16">
            <div className="flex items-center mb-6">
              <MdOutlineRecommend className="w-6 h-6 text-amber-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">
                Recommended Courses
              </h2>
            </div>

            {/* Core Courses */}
            {suggestedCourses && suggestedCourses.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <FaBookOpen className="w-4 h-4 text-red-600 mr-2" />
                  Core Courses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedCourses.map((course, index) => (
                    <Link key={index} to={`/courses/${course._id}`}>
                      <CourseCard
                        course={course}
                        type="required"
                        key={index}
                        onRegister={handleRegisterCourse}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Elective Courses */}
            {suggestedCourses.electiveCourses &&
              suggestedCourses.electiveCourses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <FaLightbulb className="w-4 h-4 text-purple-600 mr-2" />
                    Elective Courses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedCourses.electiveCourses.map((course, index) => (
                      <Link key={index} to={`/courses/${course._id}`}>
                        <CourseCard
                          course={course}
                          type="optional"
                          key={index}
                          onRegister={handleRegisterCourse}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </MaxWidthWrapper>

      {/* Support Button */}
    </div>
  );
};

export default CoursesList;
