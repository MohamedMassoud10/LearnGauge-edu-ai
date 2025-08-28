import React from "react";
import LectureList from "../../component/course/LectureList";
import SectionList from "../../component/course/SectionList";
import QuizList from "../../component/course/QuizList";
import MainTitle from "../../utils/MainTitle";
import MaxWidthWrapper from "../../utils/MaxWidthWrapper";
import { useParams, Link } from "react-router-dom";
import { useCourses } from "../../hooks/useCourse";
import { useAuthContext } from "../../hooks/useAuthContext";

// React Icons imports
import {
  FaBookOpen,
  FaBook,
  FaClipboardList,
  FaVideo,
  FaQuestionCircle,
} from "react-icons/fa";
import { IoTimeOutline, IoArrowBack } from "react-icons/io5";
import { RiUserStarLine } from "react-icons/ri";
import { AiOutlineMessage } from "react-icons/ai";
import Loader from "../../utils/Loader";
import { useLectures } from "../../hooks/useLectures";
import { useQuizzesByCourse } from "../../hooks/useQuizzes";

const CourseSinglePage = () => {
  const { id } = useParams();
  const { data: CoursesData, isLoading, isError } = useCourses();
  const { data: QuizzesData, isLoadingQuizes } = useQuizzesByCourse(id);
  const quizzes = QuizzesData?.data?.data || [];
  const { user } = useAuthContext();
  const { data: lectures } = useLectures();

  // Filter lectures by course ID
  const filteredLectures =
    lectures?.data?.data?.filter((lecture) => lecture.course === id) || [];

  // Handle error state
  if (isError && isLoading) {
    return <Loader />;
  }

  // Find the course that matches the ID from params
  const course = CoursesData?.data?.data?.find((course) => course._id === id);

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 py-10">
        <MaxWidthWrapper>
          <Link
            to="/"
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <IoArrowBack className="mr-1" /> Back to Courses
          </Link>

          <MainTitle
            titleColor="text-white"
            title={course.name}
            subtitle="Explore your course content and learning materials"
          />

          {/* Course info summary */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mt-6 flex items-center border border-white border-opacity-20">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FaBook className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-white">
                {course.code || "No Course Code"}
              </h3>
              <p className="text-sm text-blue-100">
                {course.department || "Department: N/A"}
              </p>
            </div>
            <div className="ml-auto flex space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 flex items-center">
                <IoTimeOutline className="w-4 h-4 text-blue-100 mr-1" />
                <span className="text-xs font-medium text-white">
                  {course.duration || 3} hours/week
                </span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 flex items-center">
                <RiUserStarLine className="w-4 h-4 text-blue-100 mr-1" />
                <span className="text-xs font-medium text-white">
                  {course.instructor ? course.instructor.name : "Self-paced"}
                </span>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper>
        {/* Course Content Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaVideo className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Lectures</p>
              <h3 className="text-xl font-bold text-gray-800">
                {filteredLectures.length || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaQuestionCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Quizzes</p>
              <h3 className="text-xl font-bold text-gray-800">
                {quizzes.length || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Course Description */}
        {course.description && (
          <div className="mt-10 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaClipboardList className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">
                About This Course
              </h2>
            </div>
            <p className="text-gray-700">{course.description}</p>
          </div>
        )}

        {/* Course Content Sections */}
        <div className="mt-10">
          <div className="flex items-center mb-6">
            <FaBookOpen className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Course Content</h2>
          </div>

          {/* Lectures Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-6">
              <h3 className="text-lg font-medium text-white flex items-center">
                <FaVideo className="mr-2" /> Lectures
              </h3>
            </div>
            <div className="p-4">
              <LectureList id={id} />
            </div>
          </div>

          {/* Quizzes Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 py-3 px-6">
              <h3 className="text-lg font-medium text-white flex items-center">
                <FaQuestionCircle className="mr-2" /> Quizzes & Assessments
              </h3>
            </div>
            <div className="p-4">
              <QuizList id={id} />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default CourseSinglePage;
