import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/tanstackConfig";
import api from "@/lib/axios";
import { User } from "@prisma/client";

// Query hook for fetching all users
export const useUsers = () => {
  return useQuery({
    queryKey: [queryKeys.users],
    queryFn: () => api.get<User[]>("/admin/users"),
  });
};

// Query hook for fetching a single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: [queryKeys.users, id],
    queryFn: () => api.get<User>(`/admin/users/${id}`),
    enabled: !!id,
  });
};

// Mutation hook for creating a user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<User>) => api.post<User>("/admin/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
    },
  });
};

// Mutation hook for updating a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => {
      return api.patch<User>(`/admin/users/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.users, id] });
    },
  });
};

// Mutation hook for deleting a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<User>(`/admin/users/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
      queryClient.removeQueries({ queryKey: [queryKeys.users, id] });
    },
  });
};
