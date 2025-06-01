
import apiClient from './axiosConfig';
import { toast } from "@/hooks/use-toast";

export interface AuthorizedFace {
  id: string;
  name: string;
  role: "primary" | "caregiver" | "family" | "other";
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AddFaceData {
  name: string;
  role: "primary" | "caregiver" | "family" | "other";
  face_image?: File;
}

export const facesService = {
  getAllFaces: async (): Promise<AuthorizedFace[]> => {
    try {
      const response = await apiClient.get('/faces/');
      return response.data;
    } catch (error) {
      console.error('Error fetching faces:', error);
      toast({
        title: "Error",
        description: "Could not load authorized faces",
        variant: "destructive",
      });
      throw error;
    }
  },

  getFacesByRole: async (): Promise<Record<string, AuthorizedFace[]>> => {
    try {
      const response = await apiClient.get('/faces/by_role/');
      return response.data;
    } catch (error) {
      console.error('Error fetching faces by role:', error);
      toast({
        title: "Error",
        description: "Could not load authorized faces",
        variant: "destructive",
      });
      throw error;
    }
  },

  addFace: async (faceData: AddFaceData): Promise<AuthorizedFace> => {
    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', faceData.name);
      formData.append('role', faceData.role);
      
      if (faceData.face_image) {
        formData.append('face_image', faceData.face_image);
      }

      const response = await apiClient.post('/faces/upload_face_image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: "Success",
        description: `${faceData.name} has been added to authorized faces.`,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error adding face:', error);
      toast({
        title: "Error",
        description: "Could not add new face",
        variant: "destructive",
      });
      throw error;
    }
  },

  removeFace: async (faceId: string): Promise<void> => {
    try {
      await apiClient.delete(`/faces/${faceId}/remove_face/`);
      
      toast({
        title: "Success",
        description: "Face has been removed from authorized faces.",
      });
    } catch (error) {
      console.error('Error removing face:', error);
      toast({
        title: "Error",
        description: "Could not remove face",
        variant: "destructive",
      });
      throw error;
    }
  },
};
