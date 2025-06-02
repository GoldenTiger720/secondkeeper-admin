import { dataSyncService } from "@/lib/dataSyncService";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { QUERY_KEYS } from "@/contexts/AdminDataContext";

// Enhanced hooks that automatically add operations to sync queue
export const useOptimizedUsers = () => {
  const updateUserStatus = useOptimisticMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string;
      action: string;
    }) => {
      // Add to sync queue instead of immediate API call
      dataSyncService.addToQueue({
        type: "users",
        action: "update",
        data: { userId, action },
      });

      // Return mock success for optimistic update
      return { success: true };
    },
    queryKey: QUERY_KEYS.users,
    onOptimisticUpdate: (oldData, { userId, action }) => {
      if (!oldData) return oldData;

      return oldData.map((user: any) => {
        if (user.id === userId) {
          if (action === "Block") {
            return { ...user, status: "blocked", is_active: false };
          } else if (action === "Unblock") {
            return { ...user, status: "active", is_active: true };
          }
        }
        return user;
      });
    },
    onSuccessMessage: "User status updated (syncing in background)",
  });

  const addUser = useOptimisticMutation({
    mutationFn: async (userData: any) => {
      dataSyncService.addToQueue({
        type: "users",
        action: "create",
        data: userData,
      });

      return { success: true, data: userData };
    },
    queryKey: QUERY_KEYS.users,
    onOptimisticUpdate: (oldData, newUser) => {
      if (!oldData) return [newUser];

      const optimisticUser = {
        id: `temp-${Date.now()}`,
        ...newUser,
        cameras_count: 0,
        alerts_count: 0,
        status: "active",
        is_active: true,
        date_joined: new Date().toISOString(),
      };

      return [optimisticUser, ...oldData];
    },
    onSuccessMessage: "User added (syncing in background)",
  });

  return { updateUserStatus, addUser };
};

export const useOptimizedCameras = () => {
  const updateCamera = useOptimisticMutation({
    mutationFn: async ({ cameraId, data }: { cameraId: string; data: any }) => {
      dataSyncService.addToQueue({
        type: "cameras",
        action: "update",
        data: { cameraId, data },
      });

      return { success: true };
    },
    queryKey: QUERY_KEYS.cameras,
    onOptimisticUpdate: (oldData, { cameraId, data }) => {
      if (!oldData) return oldData;

      return oldData.map((camera: any) =>
        camera.id === cameraId
          ? { ...camera, ...data, updated_at: new Date().toISOString() }
          : camera
      );
    },
    onSuccessMessage: "Camera updated (syncing in background)",
  });

  const addCamera = useOptimisticMutation({
    mutationFn: async (cameraData: any) => {
      dataSyncService.addToQueue({
        type: "cameras",
        action: "create",
        data: cameraData,
      });

      return { success: true, data: cameraData };
    },
    queryKey: QUERY_KEYS.cameras,
    onOptimisticUpdate: (oldData, newCamera) => {
      if (!oldData) return [newCamera];

      const optimisticCamera = {
        id: `temp-${Date.now()}`,
        ...newCamera,
        status: "connecting",
        user_id: "current-user",
        user_name: "Current User",
        user_email: "user@example.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return [optimisticCamera, ...oldData];
    },
    onSuccessMessage: "Camera added (syncing in background)",
  });

  const deleteCamera = useOptimisticMutation({
    mutationFn: async ({ cameraId }: { cameraId: string }) => {
      dataSyncService.addToQueue({
        type: "cameras",
        action: "delete",
        data: { cameraId },
      });

      return { success: true };
    },
    queryKey: QUERY_KEYS.cameras,
    onOptimisticUpdate: (oldData, { cameraId }) => {
      if (!oldData) return oldData;
      return oldData.filter((camera: any) => camera.id !== cameraId);
    },
    onSuccessMessage: "Camera deleted (syncing in background)",
  });

  return { updateCamera, addCamera, deleteCamera };
};

export const useOptimizedAlerts = () => {
  const updateAlertStatus = useOptimisticMutation({
    mutationFn: async ({
      alertId,
      status,
    }: {
      alertId: string;
      status: string;
    }) => {
      dataSyncService.addToQueue({
        type: "alerts",
        action: "update",
        data: { alertId, status },
      });

      return { success: true };
    },
    queryKey: QUERY_KEYS.alerts,
    onOptimisticUpdate: (oldData, { alertId, status }) => {
      if (!oldData) return oldData;

      return oldData.map((alert: any) =>
        alert.id === alertId ? { ...alert, status } : alert
      );
    },
    onSuccessMessage: "Alert status updated (syncing in background)",
  });

  return { updateAlertStatus };
};
