import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/contexts/AdminDataContext";
import apiClient from "@/lib/api/axiosConfig";

interface PendingChange {
  type: "users" | "cameras" | "alerts";
  action: "create" | "update" | "delete";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp: number;
}

export const usePersistChanges = () => {
  const queryClient = useQueryClient();
  const pendingChanges = useRef<PendingChange[]>([]);
  const syncTimeout = useRef<NodeJS.Timeout>();

  const addPendingChange = (change: Omit<PendingChange, "timestamp">) => {
    pendingChanges.current.push({
      ...change,
      timestamp: Date.now(),
    });

    // Debounce sync to backend
    if (syncTimeout.current) {
      clearTimeout(syncTimeout.current);
    }

    syncTimeout.current = setTimeout(syncToBackend, 2000); // Sync after 2 seconds of inactivity
  };

  const syncToBackend = async () => {
    if (pendingChanges.current.length === 0) return;

    try {
      // Group changes by type and send batch updates
      const changes = [...pendingChanges.current];
      pendingChanges.current = [];

      for (const change of changes) {
        switch (change.type) {
          case "users":
            await syncUserChanges(change);
            break;
          case "cameras":
            await syncCameraChanges(change);
            break;
          case "alerts":
            await syncAlertChanges(change);
            break;
        }
      }

      console.log("Successfully synced changes to backend");
    } catch (error) {
      console.error("Failed to sync changes:", error);
      // In case of error, we might want to retry or show a notification
    }
  };

  const syncUserChanges = async (change: PendingChange) => {
    // Implementation for syncing user changes
    switch (change.action) {
      case "update":
        await apiClient.post(
          `/admin/users/${change.data.userId}/update_status/`,
          {
            action: change.data.action,
          }
        );
        break;
      case "create":
        await apiClient.post("/admin/users/add_role/", change.data);
        break;
      // Add other cases as needed
    }
  };

  const syncCameraChanges = async (change: PendingChange) => {
    // Implementation for syncing camera changes
    switch (change.action) {
      case "update":
        await apiClient.put(
          `/cameras/${change.data.cameraId}/`,
          change.data.data
        );
        break;
      case "create":
        await apiClient.post("/cameras/", change.data);
        break;
      case "delete":
        await apiClient.delete(`/cameras/${change.data.cameraId}/`);
        break;
    }
  };

  const syncAlertChanges = async (change: PendingChange) => {
    // Implementation for syncing alert changes
    switch (change.action) {
      case "update":
        await apiClient.patch(`/alerts/${change.data.alertId}/`, {
          status: change.data.status,
        });
        break;
    }
  };

  // Sync when component unmounts or page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingChanges.current.length > 0) {
        // Use sendBeacon for reliable delivery during page unload
        navigator.sendBeacon(
          "/api/sync-changes",
          JSON.stringify({
            changes: pendingChanges.current,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
        syncToBackend(); // Final sync on cleanup
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { addPendingChange, syncToBackend };
};
