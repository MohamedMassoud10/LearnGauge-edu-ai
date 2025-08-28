import apiClient from "./apiClient";

// Get semester courses
export const getSemesterCourses = (token, semesterId) =>
  apiClient.get(`/course-registration/semester-courses/${semesterId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get course prerequisites
export const getCoursePrerequisites = (token, courseId) =>
  apiClient.get(`/course-registration/courses/${courseId}/prerequisites`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get student's registered courses
export const getStudentRegisteredCourses = (token, studentId) =>
  apiClient.get(`/course-registration/students/${studentId}/registrations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
export const getAllStudentsRegisteredACourse = (token, courseId) =>
  apiClient.get(`/course-registration/courses/${courseId}/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get suggested courses for student
export const getSuggestedCourses = (token, studentId) =>
  apiClient.get(
    `/course-registration/students/${studentId}/suggested-courses`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
export const getSuggestedCoursesForStudent = (token) =>
  apiClient.get(`/recommend/suggested-courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
// Assign course to semester
export const assignCourseToSemester = (token, data) =>
  apiClient.post(`/course-registration/semester-courses`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Assign course prerequisites
export const assignCoursePrerequisites = (token, data) =>
  apiClient.post(`/course-registration/course-prerequisites`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Register student for a course
export const registerStudentForCourse = (token, studentId, courseId) =>
  apiClient.post(
    `/course-registration/students/${studentId}/registrations`,
    { courseId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

// Auto-register first semester courses for student
export const autoRegisterFirstSemesterCourses = (token, studentId) =>
  apiClient.post(
    `/course-registration/students/${studentId}/auto-register`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
export const registerCourse = (token, data) =>
  apiClient.post(`/course-registration/course-registrations`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
