import apiClient from "./apiClient";

// Notifications
export const getAllNotifications = (token) =>
  apiClient.get("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const getAllMyNotifications = (token) =>
  apiClient.get("/notifications/my-notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const createNotification = ({ notificationData, token }) => {
  // Ensure title and message are present
  if (!notificationData.title || !notificationData.message) {
    return Promise.reject(new Error("Title and message are required"));
  }

  return apiClient.post("/notifications", notificationData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const updateNotification = ({ updatedData, token, id }) => {
  const url =
    id === "all" ? "/notifications/mark-all-as-read" : `/notifications/${id}`;
  return apiClient.put(url, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const deleteNotification = ({ token, id }) =>
  apiClient.delete(`/notifications/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
