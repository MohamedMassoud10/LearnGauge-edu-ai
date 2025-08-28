// api/quizzesEndpoints.js
import apiClient from "./apiClient";

// Get all quizzes
export const getQuizzes = (token) =>
  apiClient.get("/quizzes", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get quizzes for a specific course
export const getQuizzesByCourse = (token, courseId) =>
  apiClient.get(`/quizzes/courses/${courseId}/quizzes`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Create a quiz
export const createQuiz = (token, quizData) => {
  return apiClient.post("/quizzes", quizData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Update a quiz
export const updateQuiz = ({ token, id, updatedData }) => {
  return apiClient.put(`/quizzes/${id}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Delete a quiz
export const deleteQuiz = ({ token, id }) =>
  apiClient.delete(`/quizzes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
// Quiz Submissions Endpoints

// Get all quiz submissions
export const getQuizSubmissions = (token) =>
  apiClient.get("/quiz-submissions", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get a specific quiz submission
export const getQuizSubmission = (token, submissionId) =>
  apiClient.get(`/quiz-submissions/${submissionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get submissions for a specific quiz
export const getSubmissionsByQuiz = (token, quizId) =>
  apiClient.get(`/quiz-submissions/quizzes/${quizId}/submissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Get submissions for a specific student
export const getSubmissionsByStudent = (token, studentId) =>
  apiClient.get(`/quiz-submissions/students/${studentId}/submissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Submit a quiz
export const submitQuiz = (token, submissionData) => {
  return apiClient.post("/quiz-submissions", submissionData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
