import apiClient from "./apiClient";

// Get courses assigned to an instructor
export const getInstructorCourses = (token, instructorId) =>
  apiClient.get(`/instructors/${instructorId}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Assign an instructor to a course
export const assignInstructorToCourse = (token, courseId, instructorId) =>
  apiClient.post(
    `/courses/${courseId}/assign-instructor`,
    { instructorId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

// Get all instructors with their assigned courses
export const getInstructorsWithCourses = (token) =>
  apiClient.get("/instructors-with-courses", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
