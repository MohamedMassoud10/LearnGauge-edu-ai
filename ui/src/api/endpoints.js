import apiClient from "./apiClient";

export const getLoggedUser = async (token) => {
  try {
    const response = await apiClient.get("/users/logged-user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error fetching logged user:", error);
    throw error;
  }
};

