import { useState } from "react";
import { useAuthContext } from "./useAuthContext"; // Adjust the path to where your useAuthContext hook is located
import { useNavigate } from "react-router-dom";
import notify from "./useNotifaction";

export const useLogout = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const { user } = useAuthContext();

  const navigate = useNavigate();

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      navigate("/login");
      // remove the user from local storage
      localStorage.removeItem("user");

      // update the auth context
      dispatch({ type: "LOGOUT" });

      // update loading state
      setIsLoading(false);

      notify("Logged out successfully", "success");
    } catch (error) {
      setIsLoading(false);
      console.log("while logout", error);
      setError(
        error.response ? error.response.data.errors[0].msg : "Network error"
      );
    }
  };

  return { logout, isLoading, error };
};
