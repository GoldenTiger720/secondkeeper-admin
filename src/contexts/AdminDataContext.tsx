import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axiosConfig";
import { toast } from "@/hooks/use-toast";

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

// Utility function to clear all storage and logout
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAuthenticationError = (error: any) => {
  console.error("Authentication error in AdminDataContext:", error);

  // Clear all localStorage items
  localStorage.clear();

  // Also specifically remove our app's tokens if localStorage.clear() doesn't work
  localStorage.removeItem("secondkeeper_token");
  localStorage.removeItem("secondkeeper_access_token");
  localStorage.removeItem("safeguard_user");

  // Clear sessionStorage as well
  sessionStorage.clear();

  // Show appropriate error message
  const isNetworkError = !error.response;
  const isUnauthorized = error.response?.status === 401;
  const isForbidden = error.response?.status === 403;

  if (isNetworkError) {
    toast({
      title: "Connection Error",
      description:
        "Unable to connect to server. Please check your connection and try again.",
      variant: "destructive",
    });
  } else if (isUnauthorized) {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive",
    });
  } else if (isForbidden) {
    toast({
      title: "Access Denied",
      description:
        "You don't have permission to access this area. Please contact your administrator.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Authentication Error",
      description: "Unable to verify your permissions. Please log in again.",
      variant: "destructive",
    });
  }

  // Force redirect to login page after a short delay to allow toast to show
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
};

// API Functions
const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get("/admin/users/");
    return response.data?.data?.results || response.data?.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching users:", error);

    // If it's an auth error, handle logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleAuthenticationError(error);
    }

    throw error;
  }
};

const fetchCameras = async (): Promise<Camera[]> => {
  try {
    const response = await apiClient.get("/admin/cameras/");
    return response.data?.data?.results || response.data?.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching cameras:", error);

    // If it's an auth error, handle logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleAuthenticationError(error);
    }

    throw error;
  }
};

const fetchUserPermissions = async (): Promise<UserPermissions> => {
  try {
    const response = await apiClient.get("/admin/users/user_permissions/");
    console.log("Fetched user permissions:", response.data);

    if (response.data && response.data.success) {
      return response.data.data;
    }

    throw new Error("Failed to fetch permissions - Invalid response format");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching user permissions:", error);

    // For permissions endpoint, any error should trigger logout
    // This is critical for security as permissions determine access levels
    if (error.response) {
      // Server responded with error status
      console.log(
        `Permissions fetch failed with status: ${error.response.status}`
      );
      handleAuthenticationError(error);
    } else if (error.request) {
      // Network error or no response
      console.log("Network error while fetching permissions");
      handleAuthenticationError(error);
    } else {
      // Other error (parsing, etc.)
      console.log("Unexpected error while fetching permissions");
      handleAuthenticationError(error);
    }

    throw error;
  }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      // Don't retry auth errors - logout immediately
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // For other errors, retry max 1 time
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    // Don't show error notifications here - they're handled in fetchUserPermissions
    meta: {
      errorMessage: false,
    },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      // Don't retry auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      // Don't retry auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const isLoading = usersLoading || camerasLoading;

  // Only show non-auth errors in the UI
  const error = (() => {
    const errors = [usersError, camerasError, permissionsError].filter(Boolean);

    for (const err of errors) {
      // Skip auth errors since they're handled with logout
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        continue;
      }
      return err?.message || "An unexpected error occurred";
    }

    return null;
  })();

  const refetchAll = () => {
    // Only refetch if we still have valid permissions
    if (permissions) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cameras });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
    }

    // Always try to refetch permissions to check if user is still authenticated
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions });
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
