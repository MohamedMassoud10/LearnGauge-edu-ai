import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getSemesterCourses,
  getCoursePrerequisites,
  getStudentRegisteredCourses,
  getSuggestedCourses,
  assignCourseToSemester,
  assignCoursePrerequisites,
  registerStudentForCourse,
  autoRegisterFirstSemesterCourses,
  getAllStudentsRegisteredACourse,
  getSuggestedCoursesForStudent,
  registerCourse,
} from "../api/courseRegistrationEndpoints";

const getToken = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  return parsedUser?.token;
};

// Get courses assigned to a semester
export const useSemesterCourses = (semesterId) => {
  const token = getToken();
  return useQuery(
    ["semesterCourses", semesterId],
    () => getSemesterCourses(token, semesterId),
    { enabled: !!token && !!semesterId }
  );
};

// Get prerequisites for a specific course
export const useCoursePrerequisites = (courseId) => {
  const token = getToken();
  return useQuery(
    ["coursePrerequisites", courseId],
    () => getCoursePrerequisites(token, courseId),
    { enabled: !!token && !!courseId }
  );
};

// Get courses registered by a student
export const useStudentRegisteredCourses = (studentId) => {
  const token = getToken();
  return useQuery(
    ["studentRegisteredCourses", studentId],
    () => getStudentRegisteredCourses(token, studentId),
    { enabled: !!token && !!studentId }
  );
};
export const useAllStudentsRegisteredACourse = (courseId) => {
  const token = getToken();
  return useQuery(
    ["studentRegisteredCourses", courseId],
    () => getAllStudentsRegisteredACourse(token, courseId),
    { enabled: !!token && !!courseId }
  );
};

// Get suggested courses for a student
export const useSuggestedCourses = (studentId) => {
  const token = getToken();
  return useQuery(
    ["suggestedCourses", studentId],
    () => getSuggestedCourses(token, studentId),
    { enabled: !!token && !!studentId }
  );
};
export const useSuggestedCoursesForStudent = () => {
  const token = getToken();
  return useQuery(
    ["suggestedCourses"],
    () => getSuggestedCoursesForStudent(token),
    {
      enabled: !!token,
    }
  );
};

// Assign a course to a semester
export const useAssignCourseToSemester = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((data) => assignCourseToSemester(token, data), {
    onSuccess: () => {
      queryClient.invalidateQueries("semesterCourses");
    },
  });
};

// Assign course prerequisites
export const useAssignCoursePrerequisites = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((data) => assignCoursePrerequisites(token, data), {
    onSuccess: () => {
      queryClient.invalidateQueries("coursePrerequisites");
    },
  });
};

// Register a student for a course
export const useRegisterStudentForCourse = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation(
    ({ studentId, courseId }) =>
      registerStudentForCourse(token, studentId, courseId),
    {
      onSuccess: (_, { studentId }) => {
        queryClient.invalidateQueries(["studentRegisteredCourses", studentId]);
      },
    }
  );
};

// Auto-register first semester courses for a student
export const useAutoRegisterFirstSemesterCourses = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation(
    (studentId) => autoRegisterFirstSemesterCourses(token, studentId),
    {
      onSuccess: (_, studentId) => {
        queryClient.invalidateQueries(["studentRegisteredCourses", studentId]);
      },
    }
  );
};
export const useRegisterCourse = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((data) => registerCourse(token, data), {
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries(["studentRegisteredCourses", studentId]);
      queryClient.invalidateQueries(["suggestedCourses"]);
    },
  });
};
