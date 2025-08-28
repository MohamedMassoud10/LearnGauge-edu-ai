import apiClient from "./apiClient";
//Users

export const getAllUsers = (token) =>
  apiClient.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const createUser = ({ adminData, token }) =>
  apiClient.post("/users", adminData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
export const updateUser = ({ updatedData, token, id }) =>
  apiClient.put(`/users/${id}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
export const deleteUser = ({ token, id }) =>
  apiClient.delete(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
