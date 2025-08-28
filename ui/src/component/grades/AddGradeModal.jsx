"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGraduationCap, FaSpinner } from "react-icons/fa";
import {
  useCreateGrade,
  useUpdateGrade,
  useStudentCourseGrade,
} from "../../hooks/useGrades";

export default function AddGradeModal({
  isOpen,
  onClose,
  student,
  courseId,
  courseName,
}) {
  const [formData, setFormData] = useState({
    midterm: "",
    final: "",
    assignments: "",
    quizzes: "",
  });

  const createGradeMutation = useCreateGrade();
  const updateGradeMutation = useUpdateGrade();

  // Check if grade already exists for this student and course
  const { data: existingGradeData, isLoading: loadingExistingGrade } =
    useStudentCourseGrade(student?._id, courseId);

  const existingGrade = existingGradeData?.data?.data;
  console.log(existingGrade);
  const isEditing = !!existingGrade;

  // Set form data when existing grade is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingGrade) {
        setFormData({
          midterm: existingGrade.midterm?.toString() || "",
          final: existingGrade.final?.toString() || "",
          assignments: existingGrade.assignments?.toString() || "",
          quizzes: existingGrade.quizzes?.toString() || "",
        });
      } else {
        // Reset form for new grade
        setFormData({
          midterm: "",
          final: "",
          assignments: "",
          quizzes: "",
        });
      }
    }
  }, [isOpen, existingGrade]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gradeData = {
      student: student._id,
      course: courseId,
      midterm: Number(formData.midterm) || 0,
      final: Number(formData.final) || 0,
      assignments: Number(formData.assignments) || 0,
      quizzes: Number(formData.quizzes) || 0,
    };

    try {
      if (isEditing) {
        await updateGradeMutation.mutateAsync({
          id: existingGrade._id,
          updatedData: gradeData,
        });
        alert("Grade updated successfully!");
      } else {
        await createGradeMutation.mutateAsync(gradeData);
        alert("Grade added successfully!");
      }

      onClose();
    } catch (error) {
      console.error("Error saving grade:", error);
      alert(
        `Error ${isEditing ? "updating" : "adding"} grade. Please try again.`
      );
    }
  };

  const isLoading =
    createGradeMutation.isLoading || updateGradeMutation.isLoading;

  // Calculate total grade preview - sum the actual points
  const calculateTotal = () => {
    const { midterm, final, assignments, quizzes } = formData;
    const total =
      (Number(midterm) || 0) +
      (Number(final) || 0) +
      (Number(assignments) || 0) +
      (Number(quizzes) || 0);
    return total.toFixed(1);
  };

  const getLetterGrade = (score) => {
    if (score >= 97) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "A-";
    if (score >= 87) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B-";
    if (score >= 77) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C-";
    if (score >= 67) return "D+";
    if (score >= 63) return "D";
    if (score >= 60) return "D-";
    return "F";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <FaGraduationCap className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? "Update Grade" : "Add Grade"}
                </h2>
                <p className="text-sm text-gray-500">
                  {student?.name} - {courseName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          {loadingExistingGrade ? (
            <div className="p-6 flex items-center justify-center">
              <FaSpinner className="animate-spin text-indigo-600 mr-2" />
              <span>Loading existing grade...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              {/* Show existing grade info if editing */}
              {isEditing && existingGrade && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">
                      Current Grade:
                    </span>
                    <div className="flex items-center">
                      <span className="font-bold text-blue-800 mr-2">
                        {existingGrade.totalGrade}%
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {existingGrade.letterGrade}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grade Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Midterm Exam (20 points)
                  </label>
                  <input
                    type="number"
                    name="midterm"
                    value={formData.midterm}
                    onChange={handleInputChange}
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter midterm grade (0-20)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Final Exam (40 points)
                  </label>
                  <input
                    type="number"
                    name="final"
                    value={formData.final}
                    onChange={handleInputChange}
                    min="0"
                    max="40"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter final grade (0-40)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignments (20 points)
                  </label>
                  <input
                    type="number"
                    name="assignments"
                    value={formData.assignments}
                    onChange={handleInputChange}
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter assignments grade (0-20)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quizzes (20 points)
                  </label>
                  <input
                    type="number"
                    name="quizzes"
                    value={formData.quizzes}
                    onChange={handleInputChange}
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter quizzes grade (0-20)"
                  />
                </div>
              </div>

              {/* Grade Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  Grade Preview
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Calculated Total:
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-indigo-600 mr-2">
                      {calculateTotal()}/100
                    </span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-medium">
                      {getLetterGrade(Number(calculateTotal()))}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Midterm: 20 pts | Final: 40 pts | Assignments: 20 pts |
                  Quizzes: 20 pts
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{isEditing ? "Update Grade" : "Add Grade"}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
