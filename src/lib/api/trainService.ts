import apiClient from "./axiosConfig";
import { toast } from "@/hooks/use-toast";

export interface TrainingData {
  image_type: string;
  image_url: string;
}


export const trainService = {
  getTrainingData: async (alertType?: string): Promise<TrainingData[]> => {
    try {
      const url = alertType ? `/alerts/training/?alert_type=${alertType}` : "/alerts/training/";
      const response = await apiClient.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching training data:", error);
      toast({
        title: "Error",
        description: "Could not load training data",
        variant: "destructive",
      });
      throw error;
    }
  },

  deleteTrainingData: async (alertIds: string[], alertType: string): Promise<void> => {
    try {
      await apiClient.post("/alerts/training/delete/", { 
        alert_ids: alertIds,
        alert_type: alertType
      });
      
      toast({
        title: "Success",
        description: `${alertIds.length} training data items deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting training data:", error);
      toast({
        title: "Error",
        description: "Could not delete training data",
        variant: "destructive",
      });
      throw error;
    }
  },

  extractFrames: async (alertIds: string[], alertType: string): Promise<void> => {
    try {
      await apiClient.post("/alerts/training/extract-frames/", { 
        alert_ids: alertIds,
        alert_type: alertType
      });
      
      toast({
        title: "Success",
        description: "Frames extracted successfully.",
      });
    } catch (error) {
      console.error("Error extracting frames:", error);
      toast({
        title: "Error",
        description: "Could not extract frames",
        variant: "destructive",
      });
      throw error;
    }
  },

  saveTrainingData: async (alertIds: string[], alertType: string): Promise<void> => {
    try {
      await apiClient.post("/alerts/training/save/", { 
        alert_ids: alertIds,
        alert_type: alertType
      });
      
      toast({
        title: "Success",
        description: "Training data saved successfully.",
      });
    } catch (error) {
      console.error("Error saving training data:", error);
      toast({
        title: "Error",
        description: "Could not save training data",
        variant: "destructive",
      });
      throw error;
    }
  },

  trainModel: async (alertType: string): Promise<void> => {
    try {
      await apiClient.post("/alerts/training/train/", { 
        alert_type: alertType
      });
      
      toast({
        title: "Training Started",
        description: `${alertType} model training has been initiated.`,
      });
    } catch (error) {
      console.error("Error starting model training:", error);
      toast({
        title: "Error",
        description: "Could not start model training",
        variant: "destructive",
      });
      throw error;
    }
  },

  getTrainingResults: async (alertType?: string): Promise<any> => {
    try {
      const url = alertType ? `/alerts/training/results/?alert_type=${alertType}` : "/alerts/training/results/";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching training results:", error);
      throw error;
    }
  },
};