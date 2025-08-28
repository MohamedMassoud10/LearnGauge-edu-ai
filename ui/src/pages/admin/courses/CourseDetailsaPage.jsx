"use client";

import { useState } from "react";

import {
  BookOpen,
  DollarSign,
  Clock,
  User,
  ArrowLeft,
  List,
  Users,
} from "react-feather";
import { Link, useParams } from "react-router";
import { useCourses } from "../../../hooks/useCourse";
import CoursePrerequisites from "../../../component/admin/courses/CoursePrerequisites";
import CourseRegistrations from "../../../component/admin/courses/CourseRegistrations";
import CoursePassedByStudents from "../../../component/admin/courses/CoursePassedByStudents";

export default function CourseDetails() {
  const params = useParams();
  const courseId = params.id;
  const { data: coursesResponse, isLoading, isError } = useCourses();
  const [activeTab, setActiveTab] = useState("details");

  const courses = coursesResponse?.data?.data || [];
  const course = courses.find((c) => c._id === courseId);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading course details...</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        Error loading course details. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <Link
          to="/admin/courses"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Courses
        </Link>
      </div>

      {/* Course Header */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-900 rounded-xl p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="flex items-center mb-2">
              <BookOpen size={24} className="mr-2" />
              <h1 className="text-2xl font-bold">{course.name}</h1>
            </div>
            <p className="text-green-100 mb-4">{course.code}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <DollarSign size={16} className="mr-1" />
                <span>${course.price}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{course.duration} hours</span>
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-1" />
                <span>
                  {typeof course?.instructor === "object"
                    ? course?.instructor?.name
                    : "Assigned Instructor"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <BookOpen size={16} className="mr-2" />
              Course Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab("prerequisites")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "prerequisites"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <List size={16} className="mr-2" />
              Prerequisites
            </div>
          </button>
          <button
            onClick={() => setActiveTab("registrations")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "registrations"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              Registrations
            </div>
          </button>{" "}
          <button
            onClick={() => setActiveTab("student-grades")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "student-grades"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              Student Grades
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {activeTab === "details" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700">{course.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Course Information
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Department
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {course.department}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Course Code
                    </dt>
                    <dd className="text-sm text-gray-900">{course.code}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Duration
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {course.duration} hours
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="text-sm text-gray-900">${course.price}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Instructor Information
                </h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {typeof course?.instructor === "object"
                        ? course?.instructor?.name
                        : "Assigned Instructor"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeof course.instructor === "object"
                        ? course.instructor?.email
                        : "Contact administration for details"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "prerequisites" && (
          <CoursePrerequisites courseId={courseId} />
        )}
        {activeTab === "registrations" && (
          <CourseRegistrations courseId={courseId} />
        )}{" "}
        {activeTab === "student-grades" && (
          <CoursePassedByStudents courseId={courseId} />
        )}
      </div>
    </div>
  );
}
