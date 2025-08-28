"use client";
import { useState } from "react";
import {
  Edit,
  Trash2,
  Book,
  BookOpen,
  DollarSign,
  Clock,
  User,
} from "react-feather";
import { useDeleteCourse } from "../../../hooks/useCourse";
import notify from "../../../hooks/useNotifaction";
import DeleteConfirmDialog from "./../../DeleteConfirmDialog";
import { Link } from "react-router";

const CoursesList = ({ courses, onEdit }) => {
  const { mutate: deleteCourse } = useDeleteCourse();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const openDeleteDialog = (course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!courseToDelete) return;

    deleteCourse(courseToDelete._id, {
      onSuccess: () => {
        notify("Successfully removed the course", "success");
      },
    });
  };

  // Get unique departments for filter
  const departments = [...new Set(courses.map((course) => course.department))];

  const filteredCourses = courses?.filter(
    (course) =>
      (course?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        course?.code?.toLowerCase()?.includes(searchQuery?.toLowerCase())) &&
      (departmentFilter ? course?.department === departmentFilter : true)
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-64"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Link to={`/admin/courses/${course._id}`}>
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                      </Link>
                      <div className="ml-4">
                        <Link to={`/admin/courses/${course._id}`}>
                          <div className="text-sm font-medium text-gray-900">
                            {course.name}
                          </div>
                        </Link>

                        <div className="text-sm text-gray-500 line-clamp-1">
                          {course.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Book size={16} className="mr-2 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {course.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-1 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {course.price}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {course.duration} hrs
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={16} className="mr-1 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {typeof course?.instructor === "object"
                          ? course?.instructor?.name
                          : "Assigned"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(course)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(course)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Course"
        message={`Are you sure you want to delete ${
          courseToDelete?.name || "this course"
        }?`}
        icon={<Trash2 size={20} />}
      />
    </>
  );
};

export default CoursesList;
