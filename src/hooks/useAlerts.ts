import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { QUERY_KEYS } from "@/contexts/AdminDataContext";
import apiClient from "@/lib/api/axiosConfig";

interface UpdateAlertStatusVariables {
  alertId: string;
  status: "confirmed" | "dismissed";
}

export const useAlerts = () => {
  const updateAlertStatus = useOptimisticMutation<
    any,
    UpdateAlertStatusVariables
  >({
    mutationFn: async ({ alertId, status }) => {
      const response = await apiClient.patch(`/alerts/${alertId}/`, { status });
      return response.data;
    },
    queryKey: QUERY_KEYS.alerts,
    onOptimisticUpdate: (oldData, { alertId, status }) => {
      if (!oldData) return oldData;

      return oldData.map((alert: any) =>
        alert.id === alertId ? { ...alert, status } : alert
      );
    },
    onSuccessMessage: "Alert status updated successfully",
    onErrorMessage: "Failed to update alert status",
  });

  return {
    updateAlertStatus,
  };
};
