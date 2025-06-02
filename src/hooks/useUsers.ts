// src/hooks/useUsers.ts - Updated version with Edit and Delete functionality
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axiosConfig";
import { QUERY_KEYS } from "@/contexts/AdminDataContext";
import { toast } from "@/hooks/use-toast";

interface UpdateUserStatusVariables {
  userId: string;
  action: "Block" | "Unblock" | "Delete";
}

interface AddUserVariables {
  full_name: string;
  email: string;
  role: string;
  password: string;
  phone_number?: string;
}

interface EditUserVariables {
  userId: string;
  userData: {
    full_name: string;
    email: string;
    role: string;
    phone_number: string;
  };
}

interface DeleteUserVariables {
  userId: string;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, action }: UpdateUserStatusVariables) => {
      const response = await apiClient.post(
        `/admin/users/${userId}/update_status/`,
        {
          action,
        }
      );
      return response.data;
    },
    onMutate: async ({ userId, action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(QUERY_KEYS.users);

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.users, (old: any) => {
        if (!old) return old;

        return old.map((user: any) => {
          if (user.id === userId) {
            if (action === "Block") {
              return { ...user, status: "blocked", is_active: false };
            } else if (action === "Unblock") {
              return { ...user, status: "active", is_active: true };
            }
          }
          return user;
        });
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(QUERY_KEYS.users, context.previousUsers);
      }

      toast({
        title: "Error",
        description: `Failed to ${variables.action.toLowerCase()} user`,
        variant: "destructive",
      });
    },
    onSuccess: (data, { action }) => {
      toast({
        title: "Success",
        description: `User ${action.toLowerCase()}ed successfully`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });

  const addUser = useMutation({
    mutationFn: async (userData: AddUserVariables) => {
      const response = await apiClient.post("/admin/users/add_role/", userData);
      return response.data;
    },
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(QUERY_KEYS.users);

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.users, (old: any) => {
        if (!old) return [newUser];

        const optimisticUser = {
          id: `temp-${Date.now()}`,
          ...newUser,
          cameras_count: 0,
          alerts_count: 0,
          status: "active",
          is_active: true,
          date_joined: new Date().toISOString(),
        };

        return [optimisticUser, ...old];
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(QUERY_KEYS.users, context.previousUsers);
      }

      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "User added successfully",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });

  // Edit User Mutation
  const editUser = useMutation({
    mutationFn: async ({ userId, userData }: EditUserVariables) => {
      const response = await apiClient.put(`/admin/users/${userId}/`, userData);
      return response.data;
    },
    onMutate: async ({ userId, userData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(QUERY_KEYS.users);

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.users, (old: any) => {
        if (!old) return old;

        return old.map((user: any) => {
          if (user.id === userId) {
            return {
              ...user,
              ...userData,
              updated_at: new Date().toISOString(),
            };
          }
          return user;
        });
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(QUERY_KEYS.users, context.previousUsers);
      }

      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });

  // Delete User Mutation
  const deleteUser = useMutation({
    mutationFn: async ({ userId }: DeleteUserVariables) => {
      const response = await apiClient.delete(`/admin/users/${userId}/`);
      return response.data;
    },
    onMutate: async ({ userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(QUERY_KEYS.users);

      // Optimistically update (remove user from list)
      queryClient.setQueryData(QUERY_KEYS.users, (old: any) => {
        if (!old) return old;
        return old.filter((user: any) => user.id !== userId);
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(QUERY_KEYS.users, context.previousUsers);
      }

      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });

  return {
    updateUserStatus,
    addUser,
    editUser,
    deleteUser,
  };
};
