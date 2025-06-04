import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axiosConfig";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  status: "active" | "blocked";
  cameras_count: number;
  alerts_count: number;
  date_joined: string;
}

interface Camera {
  id: string;
  name: string;
  stream_url: string;
  status: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

interface Alert {
  id: string;
  type: string;
  timestamp: string;
  user: string;
  camera: string;
  status: string;
  videoUrl: string;
  thumbnail: string;
}

interface UserPermissions {
  can_add_roles: boolean;
  can_manage_users: boolean;
  role: string;
  is_admin: boolean;
  is_manager: boolean;
  is_reviewer: boolean;
}

interface AdminDataContextType {
  users: User[];
  cameras: Camera[];
  permissions: UserPermissions | null;
  isLoading: boolean;
  isPermissionsLoading: boolean;
  error: string | null;
  refetchAll: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
  undefined
);

// Query Keys
// eslint-disable-next-line react-refresh/only-export-components
export const QUERY_KEYS = {
  users: ["admin", "users"],
  cameras: ["admin", "cameras"],
  alerts: ["admin", "alerts"],
  permissions: ["admin", "permissions"],
} as const;

// API Functions
const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get("/admin/users/");
  return response.data?.data?.results || response.data?.data || [];
};

const fetchCameras = async (): Promise<Camera[]> => {
  const response = await apiClient.get("/admin/cameras/");
  return response.data?.data?.results || response.data?.data || [];
};

const fetchUserPermissions = async (): Promise<UserPermissions> => {
  const response = await apiClient.get("/admin/users/user_permissions/");
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error("Failed to fetch permissions");
};

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch user permissions once with long cache time
  const {
    data: permissions = null,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useQuery({
    queryKey: QUERY_KEYS.permissions,
    queryFn: fetchUserPermissions,
    staleTime: 30 * 60 * 1000, // 30 minutes - permissions rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!permissions, // Only fetch if permissions are loaded
  });

  const {
    data: cameras = [],
    isLoading: camerasLoading,
    error: camerasError,
  } = useQuery({
    queryKey: QUERY_KEYS.cameras,
    queryFn: fetchCameras,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!permissions, // Only fetch if permissions are loaded
  });

  const isLoading = usersLoading || camerasLoading;
  const error =
    usersError?.message ||
    camerasError?.message ||
    permissionsError?.message ||
    null;

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cameras });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
    // Don't refetch permissions unless explicitly needed
  };

  const value: AdminDataContextType = {
    users,
    cameras,
    permissions,
    isLoading,
    isPermissionsLoading,
    error,
    refetchAll,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return context;
};
