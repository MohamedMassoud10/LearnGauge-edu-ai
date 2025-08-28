import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getAllMyNotifications,
} from "../api/notificationsEndpoints";

export const useNotifications = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);

  return useQuery(
    "notifications",
    () => getAllNotifications(parsedUser?.token),
    {
      enabled: !!parsedUser?.token,
    }
  );
};

export const useMyNotifications = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);

  return useQuery(
    "notifications",
    () => getAllMyNotifications(parsedUser?.token),
    {
      enabled: !!parsedUser?.token,
    }
  );
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;
  const token = parsedUser?.token || localStorage.getItem("token");

  return useMutation(
    (notificationData) => createNotification({ notificationData, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
      },
    }
  );
};
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, updatedData, token }) =>
      updateNotification({ id, updatedData, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
      },
    }
  );
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ updatedData, token }) =>
      updateNotification({ id: "all", updatedData, token }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
      },
    }
  );
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteNotification, {
    onSuccess: () => {
      queryClient.invalidateQueries("notifications");
    },
  });
};
