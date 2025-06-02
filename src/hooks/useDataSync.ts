import { useEffect, useState } from "react";
import { dataSyncService } from "@/lib/dataSyncService";

export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = useState(
    dataSyncService.getQueueStatus()
  );

  useEffect(() => {
    // Update status periodically
    const statusInterval = setInterval(() => {
      setSyncStatus(dataSyncService.getQueueStatus());
    }, 1000);

    // Listen for online/offline events
    const handleOnline = () => {
      setSyncStatus(dataSyncService.getQueueStatus());
      dataSyncService.forcSync();
    };

    const handleOffline = () => {
      setSyncStatus(dataSyncService.getQueueStatus());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    ...syncStatus,
    forceSync: () => dataSyncService.forcSync(),
    clearQueue: () => dataSyncService.clearQueue(),
  };
};
