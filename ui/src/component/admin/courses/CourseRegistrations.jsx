"use client";
import { useState } from "react";

import { Check, X, AlertTriangle, Search, Filter } from "react-feather";
import { useAllStudentsRegisteredACourse } from "../../../hooks/useCourseRegistration";
import notify from "../../../hooks/useNotifaction";

const CourseRegistrations = ({ courseId }) => {
  const {
    data: registrationsData,
    isLoading,
    isError,
  } = useAllStudentsRegisteredACourse(courseId);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const registrations = registrationsData?.data?.data || [];

  // Get unique semesters for filter
  const semesters = [...new Set(registrations.map((reg) => reg.semester))].sort(
    (a, b) => a - b
  );

  const filteredRegistrations = registrations.filter(
    (reg) =>
      (reg.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.student.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter ? reg.status === statusFilter : true) &&
      (semesterFilter ? reg.semester.toString() === semesterFilter : true)
  );
  console.log(filteredRegistrations);
  const handleUpdateStatus = (registrationId, newStatus) => {
    // This would be implemented with a mutation hook
    notify(`Status updated to ${newStatus}`, "success");
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-600">Loading registrations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertTriangle className="mr-2" size={18} />
        Error loading course registrations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Student Registrations
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search students"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 p-2 border border-gray-300 rounded-md w-64"
          />
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {registration.student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Semester {registration.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registration.academicYear}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No student registrations found</p>
        </div>
      )}
    </div>
  );
};

export default CourseRegistrations;
