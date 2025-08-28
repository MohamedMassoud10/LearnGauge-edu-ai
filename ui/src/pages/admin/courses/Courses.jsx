"use client";

import { useState } from "react";
import { BookOpen, Plus } from "react-feather";
import { useCourses } from "./../../../hooks/useCourse";
import CoursesList from "../../../component/admin/courses/CoursesList";
import CourseModal from "../../../component/admin/courses/CourseModal";
import CreateCourseForm from "../../../component/admin/courses/CreateCourseForm";

export default function Courses() {
  const { data: coursesResponse, isLoading, isError } = useCourses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const coursesArray = coursesResponse?.data?.data || [];

  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset editingCourse when modal is closed
    setEditingCourse(null);
  };

  // Calculate department stats
  const departmentStats = coursesArray.reduce((acc, course) => {
    const dept = course.department;
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-900 rounded-xl p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Course Management</h1>
            <p className="opacity-90">Manage all courses in the system</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <BookOpen size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm">Total Courses</h3>
          <p className="text-2xl font-bold text-gray-800">
            {coursesArray.length}
          </p>
        </div>

        {Object.entries(departmentStats)
          .slice(0, 3)
          .map(([dept, count]) => (
            <div key={dept} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center mb-2">
                <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                  <BookOpen size={20} />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm capitalize">{dept}</h3>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          ))}
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          Error loading courses. Please try again.
        </div>
      ) : (
        <CoursesList courses={coursesArray} onEdit={handleEdit} />
      )}

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCourse ? "Edit Course" : "Create New Course"}
      >
        <CreateCourseForm
          onClose={handleCloseModal}
          editingCourse={editingCourse}
        />
      </CourseModal>
    </div>
  );
}
