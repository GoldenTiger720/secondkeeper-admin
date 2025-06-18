import apiClient from "./axiosConfig";
import { toast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  username: string;
  camera_name: string;
  camera_id?: string;
  alert_type:
    | "fall"
    | "violence"
    | "choking"
    | "fire_smoke"
    | "unauthorized_face"
    | "other";
  status: "pending_review" | "confirmed" | "dismissed" | "false_positive";
  video_file?: string;
  thumbnail?: string;
  created_at: string;
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
      const response = await apiClient.patch(`/alerts/${alertId}/`, { status });

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
};
