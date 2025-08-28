import apiClient from "./apiClient";

// Get all courses
export const getCourses = (token) =>
  apiClient.get("/courses", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Create a course
export const createCourse = (token, courseData) => {
  // Check if courseData is FormData (for file uploads)
  const isFormData = courseData instanceof FormData;

  return apiClient.post("/courses", courseData, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
};

// Update a course
export const updateCourse = ({ token, id, updatedData }) => {
  // Check if updatedData is FormData (for file uploads)
  const isFormData = updatedData instanceof FormData;

  return apiClient.put(`/courses/${id}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
};

// Delete a course
export const deleteCourse = ({ token, id }) =>
  apiClient.delete(`/courses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
