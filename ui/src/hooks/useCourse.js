import {
  getCourses,
  deleteCourse,
  updateCourse,
  createCourse,
} from "../api/coursesEndpoints";

import { useMutation, useQuery, useQueryClient } from "react-query";

const getToken = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  return parsedUser?.token;
};

// React Query Hooks
export const useCourses = () => {
  const token = getToken();
  return useQuery("courses", () => getCourses(token), {
    enabled: !!token,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((courseData) => createCourse(token, courseData), {
    onSuccess: (newCourse) => {
      queryClient.setQueryData("courses", (oldData) => {
        if (!oldData?.data?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: [newCourse.data, ...oldData.data.data],
          },
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries("courses");
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation(
    ({ id, updatedData }) => updateCourse({ id, updatedData, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("courses");
      },
    }
  );
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((id) => deleteCourse({ id, token }), {
    onSuccess: () => {
      queryClient.invalidateQueries("courses");
    },
  });
};
