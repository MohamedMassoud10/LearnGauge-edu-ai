import {
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  getStudentGrades,
  getStudentCourseGrade,
} from "../api/gradesEndpoints";
import { useMutation, useQuery, useQueryClient } from "react-query";

const getToken = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  return parsedUser?.token;
};

// React Query Hooks
export const useGrades = () => {
  const token = getToken();
  return useQuery("grades", () => getGrades(token), {
    enabled: !!token,
  });
};

// Get all grades for a specific student
export const useStudentGrades = (studentId) => {
  const token = getToken();
  return useQuery(
    ["studentGrades", studentId],
    () => getStudentGrades(token, studentId),
    {
      enabled: !!token && !!studentId,
    }
  );
};

// Get grade for a specific student and course
export const useStudentCourseGrade = (studentId, courseId) => {
  const token = getToken();
  return useQuery(
    ["grade", studentId, courseId],
    () => getStudentCourseGrade(token, studentId, courseId),
    {
      enabled: !!token && !!studentId && !!courseId,
    }
  );
};

export const useCreateGrade = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((gradeData) => createGrade(token, gradeData), {
    onSuccess: (newGrade, variables) => {
      // Invalidate student grades cache
      queryClient.invalidateQueries(["studentGrades", variables.student]);
      queryClient.invalidateQueries([
        "grade",
        variables.student,
        variables.course,
      ]);
      queryClient.invalidateQueries("grades");
    },
  });
};

export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation(
    ({ id, updatedData }) => updateGrade({ id, updatedData, token }),
    {
      onSuccess: (updatedGrade, variables) => {
        // Invalidate relevant caches
        queryClient.invalidateQueries("grades");
        queryClient.invalidateQueries("studentGrades");
        queryClient.invalidateQueries("grade");
      },
    }
  );
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((id) => deleteGrade({ id, token }), {
    onSuccess: () => {
      queryClient.invalidateQueries("grades");
      queryClient.invalidateQueries("studentGrades");
      queryClient.invalidateQueries("grade");
    },
  });
};
