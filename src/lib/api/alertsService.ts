import apiClient from "./axiosConfig";
import { toast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  user_email: string;
  camera_name: string;
  camera_id?: string;
  camera: {
    name: string;
  };
  alert_type:
    | "fall"
    | "violence"
    | "choking"
    | "fire_smoke"
    | "unauthorized_face"
    | "other";
  alert_status: "pending_review" | "confirmed" | "dismissed" | "false_positive";
  video_file?: string;
  thumbnail?: string;
  detection_time: string;
}

export const alertsService = {
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await apiClient.get("/alerts/");
      return response.data;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Could not load alerts",
        variant: "destructive",
      });
      throw error;
    }
  },

  getReviewerPendingAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await apiClient.get("/alerts/reviewer/pending/");
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Error fetching reviewer pending alerts:", error);
      toast({
        title: "Error",
        description: "Could not load pending alerts",
        variant: "destructive",
      });
      throw error;
    }
  },

  getReviewerAllAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await apiClient.get("/alerts/reviewer/all/");
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Error fetching reviewer all alerts:", error);
      toast({
        title: "Error",
        description: "Could not load all alerts",
        variant: "destructive",
      });
      throw error;
    }
  },

  getRecentAlerts: async (limit: number = 5): Promise<Alert[]> => {
    try {
      const response = await apiClient.get(`/alerts/recent/?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recent alerts:", error);
      throw error;
    }
  },

  updateAlertStatus: async (
    alertId: string,
    status: "confirmed" | "dismissed"
  ): Promise<Alert> => {
    try {
      const response = await apiClient.put(`/alerts/${alertId}/`, { status });

      toast({
        title: "Alert Updated",
        description: `Alert has been marked as ${status}.`,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating alert status:", error);
      toast({
        title: "Error",
        description: "Could not update alert status",
        variant: "destructive",
      });
      throw error;
    }
  },

  confirmAlert: async (alertId: string): Promise<Alert> => {
    try {
      const response = await apiClient.post(`/alerts/reviewer/pending/${alertId}/confirm/`);
      return response.data;
    } catch (error) {
      console.error("Error confirming alert:", error);
      throw error;
    }
  },

  markAsFalsePositive: async (alertId: string): Promise<Alert> => {
    try {
      const response = await apiClient.post(`/alerts/reviewer/pending/${alertId}/false-positive/`);
      return response.data;
    } catch (error) {
      console.error("Error marking alert as false positive:", error);
      throw error;
    }
  },

  deleteAlert: async (alertId: string): Promise<void> => {
    try {
      await apiClient.delete(`/alerts/${alertId}/`);
    } catch (error) {
      console.error("Error deleting alert:", error);
      throw error;
    }
  },

  deleteMultipleAlerts: async (alertIds: string[]): Promise<void> => {
    try {
      await apiClient.post("/alerts/delete-multiple/", { alert_ids: alertIds });
    } catch (error) {
      console.error("Error deleting multiple alerts:", error);
      throw error;
    }
  },
};
