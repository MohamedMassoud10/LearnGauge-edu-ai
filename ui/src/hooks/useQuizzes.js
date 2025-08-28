import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getQuizzes,
  getQuizzesByCourse,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
  getQuizSubmission,
  getSubmissionsByQuiz,
  getSubmissionsByStudent,
  submitQuiz,
} from "../api/quizzesEndpoints";

const getToken = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  return parsedUser?.token;
};

export const useQuizzes = () => {
  const token = getToken();
  return useQuery("quizzes", () => getQuizzes(token), {
    enabled: !!token,
  });
};

export const useQuizzesByCourse = (courseId) => {
  const token = getToken();
  return useQuery(
    ["quizzes", courseId],
    () => getQuizzesByCourse(token, courseId),
    {
      enabled: !!token && !!courseId,
    }
  );
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((quizData) => createQuiz(token, quizData), {
    onSuccess: () => {
      queryClient.invalidateQueries("quizzes");
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation(
    ({ id, updatedData }) => updateQuiz({ id, updatedData, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("quizzes");
      },
    }
  );
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((id) => deleteQuiz({ id, token }), {
    onSuccess: () => {
      queryClient.invalidateQueries("quizzes");
    },
  });
};

export const useQuizSubmissions = () => {
  const token = getToken();
  return useQuery("quiz-submissions", () => getQuizSubmissions(token), {
    enabled: !!token,
  });
};

export const useQuizSubmission = (submissionId) => {
  const token = getToken();
  return useQuery(
    ["quiz-submission", submissionId],
    () => getQuizSubmission(token, submissionId),
    {
      enabled: !!token && !!submissionId,
    }
  );
};

export const useSubmissionsByQuiz = (quizId) => {
  const token = getToken();
  return useQuery(
    ["submissions", quizId],
    () => getSubmissionsByQuiz(token, quizId),
    {
      enabled: !!token && !!quizId,
    }
  );
};

export const useSubmissionsByStudent = (studentId) => {
  const token = getToken();
  return useQuery(
    ["submissions", studentId],
    () => getSubmissionsByStudent(token, studentId),
    {
      enabled: !!token && !!studentId,
    }
  );
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((submissionData) => submitQuiz(token, submissionData), {
    onSuccess: () => {
      queryClient.invalidateQueries("quiz-submissions");
    },
  });
};
