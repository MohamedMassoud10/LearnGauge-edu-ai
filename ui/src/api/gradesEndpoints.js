import apiClient from "./apiClient";

// Get all grades
export const getGrades = (token) =>
  apiClient.get("/grades", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Create a grade
export const createGrade = (token, gradeData) => {
  return apiClient.post("/grades", gradeData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Update a grade
export const updateGrade = ({ token, id, updatedData }) => {
  return apiClient.put(`/grades/${id}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Delete a grade
export const deleteGrade = ({ token, id }) =>
  apiClient.delete(`/grades/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get grades for a specific student - Updated to use correct endpoint
export const getStudentGrades = (token, studentId) =>
  apiClient.get(`/grades/students/${studentId}/grades`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get grades for a specific student and course
export const getStudentCourseGrade = (token, studentId, courseId) => {
  return getStudentGrades(token, studentId).then((response) => {
    // Filter the grades to find the one for the specific course
    const grades = response.data.data || [];
    const courseGrade = grades.find((grade) => grade.course._id === courseId);

    return {
      ...response,
      data: {
        ...response.data,
        data: courseGrade || null,
      },
    };
  });
};
