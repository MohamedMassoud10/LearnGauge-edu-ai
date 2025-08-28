"use client";

import { useState } from "react";
import MaxWidthWrapper from "../../utils/MaxWidthWrapper";
import { useInstructorCourses } from "../../hooks/useTeacherCourses";
import { useAuthContext } from "../../hooks/useAuthContext";
import QuizList from "../../component/home/quizes/QuizList";

export default function TeacherQuizzesPage() {
  const { user } = useAuthContext();
  const instructorId = user?.data?._id;

  const {
    data: AssignedCourses,
    isLoading: Loading,
    isError,
  } = useInstructorCourses(instructorId);

  const [selectedCourse, setSelectedCourse] = useState("");

  // Set initial selected course if there are assigned courses and none selected yet
  if (selectedCourse === "" && AssignedCourses?.data?.data?.length > 0) {
    setSelectedCourse(AssignedCourses.data.data[0].name);
  }

  // Find the currently selected course object
  const currentCourse = AssignedCourses?.data?.data?.find(
    (course) => course.name === selectedCourse
  );

  return (
    <MaxWidthWrapper>
      <div className="py-8 px-4">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quiz Management
          </h1>
          <p className="text-gray-500">
            Create and manage quizzes for your courses
          </p>
        </div>

        {/* Course Selection */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Your Courses
          </h2>

          {/* Loading State */}
          {Loading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p className="text-red-500">
              Failed to load courses. Try again later.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {AssignedCourses?.data?.data?.length > 0 ? (
                AssignedCourses.data.data.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => setSelectedCourse(course.name)}
                    className={`px-6 py-2 rounded-full transition-all duration-200 font-medium text-sm flex items-center gap-2 focus:ring-2 focus:ring-blue-500 ${
                      course.name === selectedCourse
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-lg">📚</span>
                    {course.name}
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No courses assigned yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Quiz List Section */}
        {currentCourse && (
          <QuizList
            courseId={currentCourse._id}
            courseName={currentCourse.name}
          />
        )}
      </div>
    </MaxWidthWrapper>
  );
}
