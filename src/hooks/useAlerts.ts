import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { QUERY_KEYS } from "@/contexts/AdminDataContext";
import { alertsService, Alert } from '@/lib/api/alertsService';
import { toast } from '@/hooks/use-toast';
import apiClient from "@/lib/api/axiosConfig";

interface UpdateAlertStatusVariables {
  alertId: string;
  status: "confirmed" | "dismissed";
}

// Query keys for React Query
export const ALERT_KEYS = {
  all: ['alerts'] as const,
  reviewerAll: () => [...ALERT_KEYS.all, 'reviewer', 'all'] as const,
  reviewerPending: () => [...ALERT_KEYS.all, 'reviewer', 'pending'] as const,
  recent: (limit?: number) => [...ALERT_KEYS.all, 'recent', limit] as const,
};

// Hook for fetching all reviewer alerts with React Query
export const useReviewerAllAlerts = () => {
  return useQuery({
    queryKey: ALERT_KEYS.reviewerAll(),
    queryFn: alertsService.getReviewerAllAlerts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for confirming an alert with optimistic updates
export const useConfirmAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertsService.confirmAlert,
    onMutate: async (alertId: string) => {
      await queryClient.cancelQueries({ queryKey: ALERT_KEYS.reviewerAll() });
      const previousAlerts = queryClient.getQueryData(ALERT_KEYS.reviewerAll());
      
      queryClient.setQueryData(ALERT_KEYS.reviewerAll(), (old: any[]) => {
        if (!old) return old;
        return old.map((alert: any) =>
          alert.id === alertId ? { ...alert, status: 'confirmed' } : alert
        );
      });

      // Show optimistic success toast
      toast({
        title: "Alert Confirmed",
        description: "Alert has been confirmed successfully.",
      });

      return { previousAlerts };
    },
    onError: (err, alertId, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(ALERT_KEYS.reviewerAll(), context.previousAlerts);
      }
      toast({
        title: "Error",
        description: "Failed to confirm alert. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.reviewerAll() });
    },
  });
};

// Hook for marking an alert as false positive with optimistic updates
export const useMarkAsFalsePositive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertsService.markAsFalsePositive,
    onMutate: async (alertId: string) => {
      await queryClient.cancelQueries({ queryKey: ALERT_KEYS.reviewerAll() });
      const previousAlerts = queryClient.getQueryData(ALERT_KEYS.reviewerAll());
      
      queryClient.setQueryData(ALERT_KEYS.reviewerAll(), (old: any[]) => {
        if (!old) return old;
        return old.map((alert: any) =>
          alert.id === alertId ? { ...alert, status: 'false_positive' } : alert
        );
      });

      // Show optimistic success toast
      toast({
        title: "Alert Marked",
        description: "Alert has been marked as false positive.",
      });

      return { previousAlerts };
    },
    onError: (err, alertId, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(ALERT_KEYS.reviewerAll(), context.previousAlerts);
      }
      toast({
        title: "Error",
        description: "Failed to mark alert as false positive. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.reviewerAll() });
    },
  });
};

// Hook for deleting a single alert with optimistic updates
export const useDeleteAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertsService.deleteAlert,
    onMutate: async (alertId: string) => {
      await queryClient.cancelQueries({ queryKey: ALERT_KEYS.reviewerAll() });
      const previousAlerts = queryClient.getQueryData(ALERT_KEYS.reviewerAll());
      
      queryClient.setQueryData(ALERT_KEYS.reviewerAll(), (old: any[]) => {
        if (!old) return old;
        return old.filter((alert: any) => alert.id !== alertId);
      });

      // Show optimistic success toast
      toast({
        title: "Alert Deleted",
        description: "Alert has been deleted successfully.",
      });

      return { previousAlerts };
    },
    onError: (err, alertId, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(ALERT_KEYS.reviewerAll(), context.previousAlerts);
      }
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.reviewerAll() });
    },
  });
};

// Hook for deleting multiple alerts with optimistic updates
export const useDeleteMultipleAlerts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertsService.deleteMultipleAlerts,
    onMutate: async (alertIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ALERT_KEYS.reviewerAll() });
      const previousAlerts = queryClient.getQueryData(ALERT_KEYS.reviewerAll());
      
      queryClient.setQueryData(ALERT_KEYS.reviewerAll(), (old: any[]) => {
        if (!old) return old;
        return old.filter((alert: any) => !alertIds.includes(alert.id));
      });

      // Show optimistic success toast
      toast({
        title: "Alerts Deleted",
        description: `${alertIds.length} alerts have been deleted successfully.`,
      });

      return { previousAlerts };
    },
    onError: (err, alertIds, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(ALERT_KEYS.reviewerAll(), context.previousAlerts);
      }
      toast({
        title: "Error",
        description: "Failed to delete alerts. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_KEYS.reviewerAll() });
    },
  });
};

export const useAlerts = () => {
  const updateAlertStatus = useOptimisticMutation<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
