"use client";

import { useState, useEffect } from "react";

import {
  BookOpen,
  DollarSign,
  Clock,
  User,
  FileText,
  Hash,
  Briefcase,
} from "react-feather";
import { useCreateCourse, useUpdateCourse } from "../../../hooks/useCourse";
import notify from "../../../hooks/useNotifaction";
import { useUsers } from "../../../hooks/useUsers";

const CreateCourseForm = ({ onClose, editingCourse = null }) => {
  // Initialize form data with editingCourse if available
  const [formData, setFormData] = useState({
    name: editingCourse?.name || "",
    code: editingCourse?.code || "",
    description: editingCourse?.description || "",
    price: editingCourse?.price || "",
    duration: editingCourse?.duration || "",
    department: editingCourse?.department || "",
    instructor:
      editingCourse?.instructor?._id || editingCourse?.instructor || "",
    majors: editingCourse?.majors || [],
    academicLevel: editingCourse?.academicLevel || "",
  });

  const [errors, setErrors] = useState({});
  const [instructors, setInstructors] = useState([]);
  const { mutate: createCourse, isLoading: isCreating } = useCreateCourse();
  const { data: usersResponse } = useUsers();
  const { mutate: updateCourse, isLoading: isUpdating } = useUpdateCourse();
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!editingCourse;

  useEffect(() => {
    if (usersResponse?.data) {
      const filteredInstructors = usersResponse?.data?.data.filter(
        (user) => user.role === "instructor"
      );
      setInstructors(filteredInstructors);
    }
  }, [usersResponse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMajorChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      majors: checked
        ? [...prev.majors, value]
        : prev.majors.filter((major) => major !== value),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Course name is required";
    if (!formData.code.trim()) newErrors.code = "Course code is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    else if (isNaN(formData.price) || Number(formData.price) < 0)
      newErrors.price = "Price must be a positive number";

    if (!formData.duration) newErrors.duration = "Duration is required";
    else if (isNaN(formData.duration) || Number(formData.duration) <= 0)
      newErrors.duration = "Duration must be a positive number";

    if (!formData.department.trim())
      newErrors.department = "Department is required";

    // Removed instructor validation - now optional

    if (!formData.majors || formData.majors.length === 0)
      newErrors.majors = "At least one major is required";

    if (!formData.academicLevel)
      newErrors.academicLevel = "Academic level is required";
    else if (
      isNaN(formData.academicLevel) ||
      Number(formData.academicLevel) < 1 ||
      Number(formData.academicLevel) > 10
    )
      newErrors.academicLevel =
        "Academic level must be a number between 1 and 10";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const user = localStorage.getItem("user");
      const parsedUser = JSON.parse(user);

      // Prepare data for submission
      const courseData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        department: formData.department,
        majors: formData.majors,
        academicLevel: Number(formData.academicLevel),
      };

      // Only include instructor if one is selected
      if (formData.instructor && formData.instructor.trim() !== "") {
        courseData.instructor = formData.instructor;
      }

      if (isEditMode) {
        // Update existing course
        updateCourse(
          {
            id: editingCourse._id,
            updatedData: courseData,
          },
          {
            onSuccess: () => {
              notify("Course updated successfully!", "success");
              onClose && onClose();
            },
            onError: (error) => {
              console.error("Error updating course:", error);
              setErrors({ submit: error.message || "Failed to update course" });
            },
          }
        );
      } else {
        // Create new course
        createCourse(courseData, {
          onSuccess: () => {
            notify("New course created successfully!", "success");
            onClose && onClose();
          },
          onError: (error) => {
            console.error("Error creating course:", error);
            setErrors({ submit: error.message || "Failed to create course" });
          },
        });
      }
    }
  };

  // Sample departments for dropdown
  const departments = [
    "Computer Science",
    "Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Business",
    "Economics",
    "Arts",
    "Humanities",
  ];

  const majors = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Data Science",
    "Cybersecurity",
    "Artificial Intelligence",
    "Web Development",
    "Mobile Development",
    "Game Development",
    "Network Administration",
    "Database Management",
    "UI/UX Design",
  ];

  return (
    <>
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <BookOpen size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="Introduction to Programming"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Hash size={18} />
                </div>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.code ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="CS101"
                />
              </div>
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Briefcase size={18} />
                </div>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.department ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <select
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Instructor (Optional)</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Level
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <BookOpen size={18} />
                </div>
                <input
                  type="number"
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className={`pl-10 block w-full rounded-md border ${
                    errors.academicLevel ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="Enter level (1-10)"
                />
              </div>
              {errors.academicLevel && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.academicLevel}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Majors
              </label>
              <div
                className={`border ${
                  errors.majors ? "border-red-300" : "border-gray-300"
                } rounded-md p-3 max-h-40 overflow-y-auto`}
              >
                <div className="grid grid-cols-1 gap-2">
                  {majors.map((major) => (
                    <label
                      key={major}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={major}
                        checked={formData.majors.includes(major)}
                        onChange={handleMajorChange}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{major}</span>
                    </label>
                  ))}
                </div>
              </div>
              {errors.majors && (
                <p className="mt-1 text-sm text-red-600">{errors.majors}</p>
              )}
              {formData.majors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Selected: {formData.majors.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <DollarSign size={18} />
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`pl-10 block w-full rounded-md border ${
                    errors.price ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="299.99"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Clock size={18} />
                </div>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  className={`pl-10 block w-full rounded-md border ${
                    errors.duration ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="48"
                />
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 text-gray-500">
                  <FileText size={18} />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`pl-10 block w-full rounded-md border ${
                    errors.description ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="Detailed course description..."
                ></textarea>
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Course"
              : "Create Course"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateCourseForm;
