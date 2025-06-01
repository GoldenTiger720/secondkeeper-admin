
import apiClient from './axiosConfig';
import { toast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  camera_name: string;
  camera_location?: string;
  alert_type: "fall" | "violence" | "choking" | "fire";
  status: "new" | "confirmed" | "dismissed";
  video_path?: string;
  thumbnail_path?: string;
  created_at: string;
}

export const alertsService = {
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await apiClient.get('/alerts/');
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Could not load alerts",
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
      console.error('Error fetching recent alerts:', error);
      throw error;
    }
  },

  updateAlertStatus: async (alertId: string, status: "confirmed" | "dismissed"): Promise<Alert> => {
    try {
      const response = await apiClient.patch(`/alerts/${alertId}/`, { status });
      
      toast({
        title: "Alert Updated",
        description: `Alert has been marked as ${status}.`,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast({
        title: "Error",
        description: "Could not update alert status",
        variant: "destructive",
      });
      throw error;
    }
  },
};
