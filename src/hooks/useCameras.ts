import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { QUERY_KEYS } from "@/contexts/AdminDataContext";
import apiClient from "@/lib/api/axiosConfig";

interface UpdateCameraVariables {
  cameraId: string;
  data: {
    name?: string;
    stream_url?: string;
    username?: string;
    password?: string;
  };
}

interface AddCameraVariables {
  name: string;
  stream_url: string;
  username?: string;
  password?: string;
}

interface DeleteCameraVariables {
  cameraId: string;
}

export const useCameras = () => {
  const updateCamera = useOptimisticMutation<any, UpdateCameraVariables>({
    mutationFn: async ({ cameraId, data }) => {
      const response = await apiClient.put(`/cameras/${cameraId}/`, data);
      return response.data;
    },
    queryKey: QUERY_KEYS.cameras,
    onOptimisticUpdate: (oldData, { cameraId, data }) => {
      if (!oldData) return oldData;

      return oldData.map((camera: any) =>
        camera.id === cameraId
          ? { ...camera, ...data, updated_at: new Date().toISOString() }
          : camera
      );
    },
    onSuccessMessage: "Camera updated successfully",
    onErrorMessage: "Failed to update camera",
  });

  const addCamera = useOptimisticMutation<any, AddCameraVariables>({
    mutationFn: async (cameraData) => {
      const response = await apiClient.post("/cameras/", cameraData);
      return response.data.data;
    },
    queryKey: QUERY_KEYS.cameras,
    onOptimisticUpdate: (oldData, newCamera) => {
      if (!oldData) return [newCamera];

      const optimisticCamera = {
        id: `temp-${Date.now()}`,
        ...newCamera,
        status: "connecting",
        user_id: "current-user",
        user_name: "Current User",
        user_email: "user@example.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return [optimisticCamera, ...oldData];
    },
    onSuccessMessage: "Camera added successfully",
    onErrorMessage: "Failed to add camera",
  });

  const deleteCamera = useOptimisticMutation<any, DeleteCameraVariables>({
    mutationFn: async ({ cameraId }) => {
      const response = await apiClient.delete(`/cameras/${cameraId}/`);
      return response.data;
    },
    queryKey: QUERY_KEYS.cameras,
    onOptimisticUpdate: (oldData, { cameraId }) => {
      if (!oldData) return oldData;
      return oldData.filter((camera: any) => camera.id !== cameraId);
    },
    onSuccessMessage: "Camera deleted successfully",
    onErrorMessage: "Failed to delete camera",
  });

  return {
    updateCamera,
    addCamera,
    deleteCamera,
  };
};
