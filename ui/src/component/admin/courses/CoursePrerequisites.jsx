"use client";
import { useState } from "react";

import { Plus, X, AlertTriangle } from "react-feather";
import {
  useAssignCoursePrerequisites,
  useCoursePrerequisites,
} from "../../../hooks/useCourseRegistration";
import notify from "../../../hooks/useNotifaction";
import { useCourses } from "../../../hooks/useCourse";

const CoursePrerequisites = ({ courseId }) => {
  const {
    data: prerequisites,
    isLoading,
    isError,
  } = useCoursePrerequisites(courseId);
  console.log(prerequisites);
  const { data: coursesData } = useCourses();
  const { mutate: assignPrerequisite } = useAssignCoursePrerequisites();

  const [selectedPrerequisite, setSelectedPrerequisite] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [minimumGrade, setMinimumGrade] = useState("Pass");

  const allCourses = coursesData?.data?.data || [];
  const prerequisitesList = prerequisites?.data?.data || [];

  // Filter out the current course and already added prerequisites
  const availableCourses = allCourses.filter((course) => {
    const isCurrentCourse = course._id === courseId;
    const isAlreadyPrerequisite = prerequisitesList?.some(
      (prereq) => prereq.prerequisite._id === course._id
    );
    return !isCurrentCourse && !isAlreadyPrerequisite;
  });

  const handleAddPrerequisite = () => {
    if (!selectedPrerequisite) {
      notify("Please select a prerequisite course", "error");
      return;
    }

    const user = localStorage.getItem("user");
    const parsedUser = JSON.parse(user);

    assignPrerequisite(
      {
        course: courseId,
        prerequisite: selectedPrerequisite,
        isRequired,
        minimumGrade,
      },
      {
        onSuccess: () => {
          notify("Prerequisite added successfully", "success");
          setSelectedPrerequisite("");
          setIsRequired(true);
          setMinimumGrade("Pass");
        },
        onError: (error) => {
          notify(error.message || "Failed to add prerequisite", "error");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-600">Loading prerequisites...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2" size={18} />
        Error loading prerequisites
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Course Prerequisites
      </h3>

      {/* Add Prerequisite Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Add Prerequisite
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <select
              value={selectedPrerequisite}
              onChange={(e) => setSelectedPrerequisite(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Course</option>
              {availableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={isRequired ? "true" : "false"}
              onChange={(e) => setIsRequired(e.target.value === "true")}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="true">Required</option>
              <option value="false">Optional</option>
            </select>
          </div>

          <div>
            <select
              value={minimumGrade}
              onChange={(e) => setMinimumGrade(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Pass">Pass</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleAddPrerequisite}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
            >
              <Plus size={16} className="mr-1" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Prerequisites List */}
      {prerequisitesList.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minimum Grade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prerequisitesList.map((prereq) => (
                <tr key={prereq._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {prereq.prerequisite.code} - {prereq.prerequisite.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        prereq.isRequired
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {prereq.isRequired ? "Required" : "Optional"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prereq.minimumGrade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        // Handle remove prerequisite
                        notify(
                          "Remove prerequisite functionality not implemented",
                          "info"
                        );
                      }}
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No prerequisites added yet</p>
        </div>
      )}
    </div>
  );
};

export default CoursePrerequisites;
