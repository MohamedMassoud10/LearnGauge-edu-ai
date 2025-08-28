import { useQuery, useMutation, useQueryClient } from "react-query";
import { getLoggedUser } from "../api/endpoints";

import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/usersEndpoints";
export const useLoggedUser = () => {
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;
  const token = parsedUser?.token;

  return useQuery({
    queryKey: ["loggedUser", token],
    queryFn: () => getLoggedUser(token),
    enabled: Boolean(token),
  });
};

export const useUsers = () => {
  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);

  return useQuery("users", () => getAllUsers(parsedUser?.token), {
    enabled: !!parsedUser?.token,
  });
};
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
    },
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
    },
  });
};
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
    },
  });
};
