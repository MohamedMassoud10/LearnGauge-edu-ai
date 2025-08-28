import apiClient from "./apiClient";

// Get all lectures
export const getLectures = (token) =>
  apiClient.get("/lectures", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Create a lecture
export const createLecture = (token, lectureData) => {
  // Check if lectureData is FormData (for file uploads)
  const isFormData = lectureData instanceof FormData;

  return apiClient.post("/lectures", lectureData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData, browser will set it with boundary
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
};

// Update a lecture
export const updateLecture = ({ token, id, updatedData }) => {
  // Check if updatedData is FormData (for file uploads)
  const isFormData = updatedData instanceof FormData;

  return apiClient.put(`/lectures/${id}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData, browser will set it with boundary
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });
};

// Delete a lecture
export const deleteLecture = ({ token, id }) =>
  apiClient.delete(`/lectures/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
