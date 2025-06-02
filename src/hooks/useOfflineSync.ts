import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/contexts/AdminDataContext";

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync pending changes when coming back online
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addPendingChange = (change: any) => {
    if (!isOnline) {
      setPendingChanges((prev) => [...prev, change]);
      // Store in localStorage for persistence
      localStorage.setItem(
        "pendingChanges",
        JSON.stringify([...pendingChanges, change])
      );
    }
  };

  const syncPendingChanges = async () => {
    if (pendingChanges.length === 0) return;

    try {
      // Process pending changes
      for (const change of pendingChanges) {
        // Execute the change
        // This would depend on your specific API structure
      }

      // Clear pending changes
      setPendingChanges([]);
      localStorage.removeItem("pendingChanges");

      // Invalidate queries to get fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cameras });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
    } catch (error) {
      console.error("Failed to sync pending changes:", error);
    }
  };

  // Load pending changes from localStorage on initialization
  useEffect(() => {
    const stored = localStorage.getItem("pendingChanges");
    if (stored) {
      try {
        setPendingChanges(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse pending changes:", error);
        localStorage.removeItem("pendingChanges");
      }
    }
  }, []);

  return {
    isOnline,
    pendingChanges: pendingChanges.length,
    addPendingChange,
    syncPendingChanges,
  };
};
