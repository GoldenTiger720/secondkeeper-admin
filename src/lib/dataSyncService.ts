import apiClient from "@/lib/api/axiosConfig";
import { toast } from "@/hooks/use-toast";

interface SyncOperation {
  id: string;
  type: "users" | "cameras" | "alerts";
  action: "create" | "update" | "update_status" | "delete";
  data: any;
  timestamp: number;
  retryCount: number;
}

class DataSyncService {
  private syncQueue: SyncOperation[] = [];
  private isProcessing = false;
  private readonly maxRetries = 3;
  private readonly syncInterval = 30000; // 30 seconds
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueueFromStorage();
    this.startPeriodicSync();
    this.setupVisibilityChangeListener();
    this.setupBeforeUnloadListener();
  }

  // Add operation to sync queue
  addToQueue(
    operation: Omit<SyncOperation, "id" | "timestamp" | "retryCount">
  ) {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `${operation.type}_${
        operation.action
      }_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncOperation);
    this.saveQueueToStorage();

    // Try to sync immediately if online
    if (navigator.onLine && !this.isProcessing) {
      this.processQueue();
    }
  }

  // Process the sync queue
  private async processQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) return;

    this.isProcessing = true;

    const operationsToProcess = [...this.syncQueue];
    const failedOperations: SyncOperation[] = [];

    for (const operation of operationsToProcess) {
      try {
        await this.executeOperation(operation);
        // Remove successful operation from queue
        this.syncQueue = this.syncQueue.filter((op) => op.id !== operation.id);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);

        // Increment retry count
        operation.retryCount++;

        if (operation.retryCount < this.maxRetries) {
          failedOperations.push(operation);
        } else {
          // Remove operation after max retries
          this.syncQueue = this.syncQueue.filter(
            (op) => op.id !== operation.id
          );
          toast({
            title: "Sync Failed",
            description: `Failed to sync ${operation.type} ${operation.action} after ${this.maxRetries} attempts.`,
            variant: "destructive",
          });
        }
      }
    }

    // Update queue with failed operations (for retry)
    if (failedOperations.length > 0) {
      this.syncQueue = this.syncQueue.map((op) => {
        const failedOp = failedOperations.find((fop) => fop.id === op.id);
        return failedOp || op;
      });
    }

    this.saveQueueToStorage();
    this.isProcessing = false;

    // Show success message if we processed some operations
    if (operationsToProcess.length > 0 && failedOperations.length === 0) {
      console.log(
        `Successfully synced ${operationsToProcess.length} operations`
      );
    }
  }

  // Execute individual sync operation
  private async executeOperation(operation: SyncOperation): Promise<void> {
    const { type, action, data } = operation;

    switch (type) {
      case "users":
        await this.syncUserOperation(action, data);
        break;
      case "cameras":
        await this.syncCameraOperation(action, data);
        break;
      case "alerts":
        await this.syncAlertOperation(action, data);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Sync user operations
  private async syncUserOperation(action: string, data: any): Promise<void> {
    switch (action) {
      case "create":
        await apiClient.post("/admin/users/add_role/", data);
        break;
      case "update_status":
        if (data.userId && data.action) {
          await apiClient.post(`/admin/users/${data.userId}/update_status/`, {
            action: data.action,
          });
        }
        break;
      case "update":
        if (data.userId && data.userData) {
          await apiClient.put(`/admin/users/${data.userId}/`, data.userData);
        }
        break;
      case "delete":
        if (data.userId) {
          await apiClient.delete(`/admin/users/${data.userId}/`);
        }
        break;
      default:
        throw new Error(`Unknown user action: ${action}`);
    }
  }

  // Sync camera operations
  private async syncCameraOperation(action: string, data: any): Promise<void> {
    switch (action) {
      case "create":
        await apiClient.post("/cameras/", data);
        break;
      case "update":
        await apiClient.put(`/cameras/${data.cameraId}/`, data.data);
        break;
      case "delete":
        await apiClient.delete(`/cameras/${data.cameraId}/`);
        break;
      default:
        throw new Error(`Unknown camera action: ${action}`);
    }
  }

  // Sync alert operations
  private async syncAlertOperation(action: string, data: any): Promise<void> {
    switch (action) {
      case "update":
        await apiClient.patch(`/alerts/${data.alertId}/`, {
          status: data.status,
        });
        break;
      default:
        throw new Error(`Unknown alert action: ${action}`);
    }
  }

  // Persistence methods
  private saveQueueToStorage() {
    try {
      localStorage.setItem("dataSyncQueue", JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error("Failed to save sync queue to storage:", error);
    }
  }

  private loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem("dataSyncQueue");
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load sync queue from storage:", error);
      localStorage.removeItem("dataSyncQueue");
    }
  }

  // Periodic sync
  private startPeriodicSync() {
    this.intervalId = setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, this.syncInterval);
  }

  // Setup event listeners
  private setupVisibilityChangeListener() {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && navigator.onLine) {
        this.processQueue();
      }
    });
  }

  private setupBeforeUnloadListener() {
    window.addEventListener("beforeunload", () => {
      // Try to sync immediately before page unload
      if (this.syncQueue.length > 0 && navigator.onLine) {
        // Use sendBeacon for reliable delivery
        const operations = this.syncQueue.map((op) => ({
          type: op.type,
          action: op.action,
          data: op.data,
        }));

        navigator.sendBeacon("/api/batch-sync", JSON.stringify({ operations }));
      }
    });
  }

  // Public methods
  public forcSync() {
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  public clearQueue() {
    this.syncQueue = [];
    this.saveQueueToStorage();
  }

  public getQueueStatus() {
    return {
      pendingOperations: this.syncQueue.length,
      isProcessing: this.isProcessing,
      isOnline: navigator.onLine,
    };
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Create singleton instance
export const dataSyncService = new DataSyncService();
