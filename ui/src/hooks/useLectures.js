import {
  getLectures,
  deleteLecture,
  updateLecture,
  createLecture,
} from "../api/lecturesEndpoints";

import { useMutation, useQuery, useQueryClient } from "react-query";

const getToken = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  return parsedUser?.token;
};

// React Query Hooks
export const useLectures = () => {
  const token = getToken();
  return useQuery("lectures", () => getLectures(token), {
    enabled: !!token,
  });
};

export const useCreateLecture = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((lectureData) => createLecture(token, lectureData), {
    onSuccess: (newLecture) => {
      queryClient.setQueryData("lectures", (oldData) => {
        if (!oldData?.data?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: [newLecture.data, ...oldData.data.data],
          },
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries("lectures");
    },
  });
};

export const useUpdateLecture = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation(
    ({ id, updatedData }) => updateLecture({ id, updatedData, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("lectures");
      },
    }
  );
};

export const useDeleteLecture = () => {
  const queryClient = useQueryClient();
  const token = getToken();

  return useMutation((id) => deleteLecture({ id, token }), {
    onSuccess: () => {
      queryClient.invalidateQueries("lectures");
    },
  });
};
