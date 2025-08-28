import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import notify from "./useNotifaction";
import apiClient from "../api/apiClient";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/auth/login`, { email, password });
      const json = response.data;

      console.log("User data retrieved:", json);

      // save the user to local storage
      localStorage.setItem("user", JSON.stringify(json));

      if (json.data.active === false) {
        notify("Your session expired", "error");
        localStorage.removeItem("user");
        navigate("login");
        return null;
      }

      if (
        json.data &&
        (json.data.role === "admin" ||
          json.data.role === "manager" ||
          json.data.role === "instructor" ||
          json.data.role === "student")
      ) {
        console.log("User has valid role:", json.data.role);

        // update the auth context
        dispatch({ type: "LOGIN", payload: json });

        // update loading state
        setIsLoading(false);
        notify("Logged in successfully", "success");

        // Redirect based on role
        if (json.data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        // remove the user from local storage
        localStorage.removeItem("user");
        notify("You do not have permission to access", "error");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("while login", error);
      setError(
        error.response ? error.response.data.errors[0].msg : "Network error"
      );
    }
  };

  return { login, isLoading, error };
};
