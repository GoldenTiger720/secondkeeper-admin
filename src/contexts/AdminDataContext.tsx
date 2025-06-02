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

interface AdminDataContextType {
  users: User[];
  cameras: Camera[];
  //   alerts: Alert[];
  isLoading: boolean;
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

// const fetchAlerts = async (): Promise<Alert[]> => {
//   const response = await apiClient.get("/admin/alerts/");
//   return response.data?.data?.results || response.data?.data || [];
// };

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
  });

  //   const {
  //     data: alerts = [],
  //     isLoading: alertsLoading,
  //     error: alertsError,
  //   } = useQuery({
  //     queryKey: QUERY_KEYS.alerts,
  //     queryFn: fetchAlerts,
  //     staleTime: 1 * 60 * 1000, // 1 minute for alerts (more frequent updates)
  //     gcTime: 5 * 60 * 1000,
  //   });

  // const isLoading = usersLoading || camerasLoading || alertsLoading;
  const isLoading = usersLoading || camerasLoading;
  const error =
    usersError?.message ||
    camerasError?.message ||
    // alertsError?.message ||
    null;

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cameras });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
  };

  const value: AdminDataContextType = {
    users,
    cameras,
    // alerts,
    isLoading,
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
