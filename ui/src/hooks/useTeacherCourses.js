import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getInstructorCourses,
  assignInstructorToCourse,
  getInstructorsWithCourses,
} from "../api/teacherCoursesEndpoints";

const getToken = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  return parsedUser?.token;
};

// Get courses assigned to a specific instructor
export const useInstructorCourses = (instructorId) => {
  const token = getToken();
  return useQuery(
    ["instructorCourses", instructorId],
    () => getInstructorCourses(token, instructorId),
    { enabled: !!token && !!instructorId }
  );
};

// Get all instructors with their assigned courses
export const useInstructorsWithCourses = () => {
  const token = getToken();
  return useQuery(
    "instructorsWithCourses",
    () => getInstructorsWithCourses(token),
    {
      enabled: !!token,
    }
  );
};

// Assign an instructor to a course
export const useAssignInstructorToCourse = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation(
    ({ courseId, instructorId }) =>
      assignInstructorToCourse(token, courseId, instructorId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("instructorsWithCourses");
        queryClient.invalidateQueries(["instructorCourses", instructorId]);
      },
    }
  );
};
