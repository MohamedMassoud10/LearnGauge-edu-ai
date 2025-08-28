"use client";

import { useState } from "react";
import { useCreateUser } from "../../../hooks/useUsers";
import { useUpdateUser } from "../../../hooks/useUsers";
import {
  User,
  Mail,
  Lock,
  Phone,
  BookOpen,
  Award,
  Hash,
  UserCheck,
} from "react-feather";
import notify from "../../../hooks/useNotifaction";

const CreateUserForm = ({ onClose, editingUser = null }) => {
  // Initialize form data with editingUser if available, mapping to correct database fields
  const [formData, setFormData] = useState({
    name: editingUser?.name || "",
    email: editingUser?.email || "",
    password: "",
    passwordConfirm: "",
    mobile: editingUser?.phone || "",
    role: editingUser?.role || "student",
    studentId: editingUser?.studentId || "",
    academicLevel: editingUser?.academicLevel || 1,
    gpa: editingUser?.gpa || 0,
    major: editingUser?.major || "",
    active: editingUser?.active !== undefined ? editingUser.active : true,
  });

  const [errors, setErrors] = useState({});
  const { mutate: createUser, isLoading: isCreating } = useCreateUser();
  const { mutate: updateUserMutation, isLoading: isUpdating } = useUpdateUser();
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!editingUser;

  // Add logging for initial state
  console.log("🔍 Form initialized:", {
    isEditMode,
    editingUser,
    formData,
  });

  const roles = ["manager", "student", "instructor", "admin"];

  const majors = [
    "Computer Science",
    "Artificial Intelligence",
    "Software Engineering",
    "Information Technology",
    "Data Science",
    "Cybersecurity",
    "Computer Engineering",
    "Information Systems",
    "Digital Media",
    "Game Development",
  ];

  const academicLevels = [1, 2, 3, 4, 5];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    console.log("📝 Field changed:", {
      name,
      oldValue: formData[name],
      newValue,
    });

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    console.log("✅ Validating form:", { isEditMode, formData });

    // Skip validation entirely when in edit mode
    if (isEditMode) {
      console.log("⏭️ Skipping validation for edit mode");
      setErrors(newErrors);
      return true;
    }

    // Only validate for new users
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";

    if (formData.role === "student") {
      if (!formData.studentId) newErrors.studentId = "Student ID is required";
      if (!formData.academicLevel)
        newErrors.academicLevel = "Academic level is required";
      if (!formData.major) newErrors.major = "Major is required";

      // Validate numeric fields
      if (formData.gpa < 0 || formData.gpa > 4) {
        newErrors.gpa = "GPA must be between 0 and 4";
      }
    }

    console.log("❌ Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("🚀 Form submitted:", { formData, isEditMode });

    if (validateForm()) {
      const user = localStorage.getItem("user");
      const parsedUser = JSON.parse(user);

      console.log("👤 User from localStorage:", parsedUser);

      // Prepare data for submission with proper field mapping
      const userData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        active: formData.active,
      };

      // Add student-specific fields only if role is student
      if (formData.role === "student") {
        userData.studentId = formData.studentId;
        userData.academicLevel = Number.parseInt(formData.academicLevel);
        userData.gpa = Number.parseFloat(formData.gpa);
        userData.major = formData.major;
      }

      // Add password fields only if provided
      if (formData.password && formData.password.trim()) {
        userData.password = formData.password;
        userData.passwordConfirm = formData.passwordConfirm;
      }

      // Generate slug from name for new users only
      if (!isEditMode) {
        userData.slug = formData.name.toLowerCase().replace(/\s+/g, "-");
      }

      console.log("📦 Prepared userData:", userData);

      if (isEditMode) {
        console.log("🔄 Updating user with ID:", editingUser._id);

        const updatePayload = {
          updatedData: userData,
          token: parsedUser?.token,
          id: editingUser._id,
        };

        console.log("📤 Update payload:", updatePayload);

        // Update existing user
        updateUserMutation(updatePayload, {
          onSuccess: (response) => {
            console.log("✅ Update successful:", response);
            notify("User updated successfully!", "success");
            onClose && onClose();
          },
          onError: (error) => {
            console.error("❌ Update error:", error);
            console.error("❌ Error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
              statusText: error.response?.statusText,
            });
            setErrors({ submit: error.message || "Failed to update user" });
          },
        });
      } else {
        console.log("➕ Creating new user");

        const createPayload = {
          adminData: userData,
          token: parsedUser?.token,
        };

        console.log("📤 Create payload:", createPayload);

        // Create new user
        createUser(createPayload, {
          onSuccess: (response) => {
            console.log("✅ Create successful:", response);
            notify("New user created successfully!", "success");
            onClose && onClose();
          },
          onError: (error) => {
            console.error("❌ Create error:", error);
            console.error("❌ Error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
              statusText: error.response?.statusText,
            });
            setErrors({ submit: error.message || "Failed to create user" });
          },
        });
      }
    } else {
      console.log("❌ Form validation failed");
    }
  };

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
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <UserCheck size={18} />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Student Name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="xxxxx@eru.edu.eg"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.mobile ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="01234567890"
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active User
              </label>
            </div>
          </div>

          {/* Password and Role-specific fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditMode
                  ? "New Password (leave blank to keep current)"
                  : "Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.passwordConfirm
                      ? "border-red-300"
                      : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="••••••"
                />
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>

            {/* Student-specific fields */}
            {formData.role === "student" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-md border ${
                        errors.studentId ? "border-red-300" : "border-gray-300"
                      } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="student id eg.215024"
                    />
                  </div>
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.studentId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <BookOpen size={18} />
                    </div>
                    <select
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-md border ${
                        errors.major ? "border-red-300" : "border-gray-300"
                      } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select a major</option>
                      {majors.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.major && (
                    <p className="mt-1 text-sm text-red-600">{errors.major}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Student-specific fields (second row) */}
        {formData.role === "student" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Level
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Award size={18} />
                </div>
                <select
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.academicLevel ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  {academicLevels.map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </div>
              {errors.academicLevel && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.academicLevel}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Award size={18} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.gpa ? "border-red-300" : "border-gray-300"
                  } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00"
                />
              </div>
              {errors.gpa && (
                <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update User"
              : "Create User"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateUserForm;
