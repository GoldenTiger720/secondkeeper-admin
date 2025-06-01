import apiClient from "./axiosConfig";
import { toast } from "@/hooks/use-toast";

export interface Camera {
  id: string;
  name: string;
  status: string;
  stream_url: string;
  username?: string;
  password?: string;
}

export interface AddCameraData {
  name: string;
  stream_url: string;
  username?: string;
  password?: string;
}

export interface StreamResponse {
  success: boolean;
  data: {
    camera_id: string;
    session_id: string;
    websocket_url: string;
    quality: string;
    status: string;
  };
  message: string;
  errors: string[];
}

export interface StreamStats {
  camera_id: string;
  active_sessions: number;
  sessions: string[];
  metadata: {
    width: number;
    height: number;
    fps: number;
    codec: string;
    bitrate: number;
    total_frames: number;
    dropped_frames: number;
  } | null;
}

export const camerasService = {
  getAllCameras: async () => {
    try {
      const response = await apiClient.get("/cameras/");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching cameras:", error);
      toast({
        title: "Error",
        description: "Could not load cameras",
        variant: "destructive",
      });
      throw error;
    }
  },

  getCamera: async (
    cameraId: string
  ): Promise<{ success: boolean; data: Camera; message: string }> => {
    try {
      const response = await apiClient.get(`/cameras/${cameraId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching camera:", error);
      toast({
        title: "Error",
        description: "Could not load camera details",
        variant: "destructive",
      });
      throw error;
    }
  },

  addCamera: async (cameraData: AddCameraData): Promise<Camera> => {
    try {
      const response = await apiClient.post("/cameras/", cameraData);
      return response.data.data;
    } catch (error) {
      console.log("Error adding camera:", error);
      throw error;
    }
  },

  updateCamera: async (
    cameraId: string,
    cameraData: Partial<Camera>
  ): Promise<{ success: boolean; data: Camera; message: string }> => {
    try {
      const response = await apiClient.put(`/cameras/${cameraId}/`, cameraData);

      return response.data;
    } catch (error) {
      console.error("Error updating camera:", error);
      throw error;
    }
  },

  deleteCamera: async (
    cameraId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/cameras/${cameraId}/`);
      return response.data;
    } catch (error) {
      console.error("Error deleting camera:", error);
      throw error;
    }
  },

  // Streaming related methods
  startStream: async (
    cameraId: string,
    quality: string = "medium"
  ): Promise<StreamResponse> => {
    try {
      const response = await apiClient.get(`/cameras/${cameraId}/stream/`, {
        params: { quality },
      });
      return response.data;
    } catch (error) {
      console.error("Error starting stream:", error);
      throw error;
    }
  },

  stopStream: async (
    cameraId: string,
    sessionId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(
        `/cameras/${cameraId}/stop_stream/`,
        {
          session_id: sessionId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error stopping stream:", error);
      throw error;
    }
  },

  getStreamStats: async (
    cameraId: string
  ): Promise<{ success: boolean; data: StreamStats; message: string }> => {
    try {
      const response = await apiClient.get(
        `/cameras/${cameraId}/stream_stats/`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting stream stats:", error);
      throw error;
    }
  },

  getStreamFrame: async (
    cameraId: string,
    sessionId: string
  ): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/cameras/${cameraId}/frame/`, {
        params: { session_id: sessionId },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error getting stream frame:", error);
      throw error;
    }
  },

  // Camera settings
  getCameraSettings: async (
    cameraId: string
  ): Promise<{
    success: boolean;
    data: Record<string, unknown>;
    message: string;
  }> => {
    try {
      const response = await apiClient.get(`/cameras/${cameraId}/settings/`);
      return response.data;
    } catch (error) {
      console.error("Error getting camera settings:", error);
      throw error;
    }
  },

  // updateCameraSettings: async (
  //   cameraId: string,
  //   settings: Partial<UpdateCameraData>
  // ): Promise<{ success: boolean; data: any; message: string }> => {
  //   try {
  //     const response = await apiClient.patch(
  //       `/cameras/${cameraId}/settings/`,
  //       settings
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error updating camera settings:", error);
  //     throw error;
  //   }
  // },

  // Status related methods
  getCameraStatuses: async (): Promise<{
    success: boolean;
    data: Camera[];
    message: string;
  }> => {
    try {
      const response = await apiClient.get("/cameras/status/");
      return response.data;
    } catch (error) {
      console.error("Error getting camera statuses:", error);
      throw error;
    }
  },

  // Utility methods
  testCameraConnection: async (
    streamUrl: string,
    username?: string,
    password?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post("/cameras/test_connection/", {
        stream_url: streamUrl,
        username: username || "",
        password: password || "",
      });
      return response.data;
    } catch (error) {
      console.error("Error testing camera connection:", error);
      throw error;
    }
  },

  // WebSocket connection helper
  createWebSocketConnection: (cameraId: string): WebSocket => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/camera/${cameraId}/stream/`;

    const ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      console.log(`WebSocket connected for camera ${cameraId}`);
    });

    ws.addEventListener("error", (error) => {
      console.error(`WebSocket error for camera ${cameraId}:`, error);
    });

    ws.addEventListener("close", (event) => {
      console.log(
        `WebSocket closed for camera ${cameraId}:`,
        event.code,
        event.reason
      );
    });

    return ws;
  },

  // Stream quality options
  getQualityOptions: () => [
    {
      value: "low",
      label: "Low (10 FPS)",
      description: "Lowest bandwidth usage",
    },
    {
      value: "medium",
      label: "Medium (15 FPS)",
      description: "Balanced performance",
    },
    {
      value: "high",
      label: "High (30 FPS)",
      description: "Best quality, higher bandwidth",
    },
  ],
};
