import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainService } from '@/lib/api/trainService';
import { toast } from '@/hooks/use-toast';

// Query keys for React Query
export const TRAINING_KEYS = {
  all: ['training'] as const,
  byAlertType: (alertType: string) => [...TRAINING_KEYS.all, 'alertType', alertType] as const,
  results: (alertType?: string) => [...TRAINING_KEYS.all, 'results', alertType] as const,
};

// Hook for fetching training data with React Query
export const useTrainingData = (alertType?: string) => {
  return useQuery({
    queryKey: TRAINING_KEYS.byAlertType(alertType || 'all'),
    queryFn: () => trainService.getTrainingData(alertType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching training results
export const useTrainingResults = (alertType?: string) => {
  return useQuery({
    queryKey: TRAINING_KEYS.results(alertType),
    queryFn: () => trainService.getTrainingResults(alertType),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for deleting training data with optimistic updates
export const useDeleteTrainingData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertIds, alertType }: { alertIds: number[], alertType: string }) => 
      trainService.deleteTrainingData(alertIds, alertType),
    onMutate: async ({ alertIds, alertType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: TRAINING_KEYS.byAlertType(alertType) });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(TRAINING_KEYS.byAlertType(alertType));
      
      // Optimistically update by removing the deleted items
      queryClient.setQueryData(TRAINING_KEYS.byAlertType(alertType), (old: any[]) => {
        if (!old) return old;
        return old.filter((item: any) => !alertIds.includes(item.id));
      });

      // Show optimistic success toast
      toast({
        title: "Training Data Deleted",
        description: `${alertIds.length} training data items have been deleted successfully.`,
      });

      return { previousData };
    },
    onError: (error, { alertIds, alertType }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(TRAINING_KEYS.byAlertType(alertType), context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to delete training data. Please try again.",
        variant: "destructive",
      });
      console.error("Delete training data error:", error);
    },
    onSettled: (_, __, { alertType }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: TRAINING_KEYS.byAlertType(alertType) });
    },
  });
};

// Hook for extracting frames
export const useExtractFrames = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertIds, alertType }: { alertIds: number[], alertType: string }) => 
      trainService.extractFrames(alertIds, alertType),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Frames extracted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: TRAINING_KEYS.all });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to extract frames. Please try again.",
        variant: "destructive",
      });
      console.error("Extract frames error:", error);
    },
  });
};

// Hook for saving training data
export const useSaveTrainingData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertIds, alertType }: { alertIds: number[], alertType: string }) => 
      trainService.saveTrainingData(alertIds, alertType),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Training data saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: TRAINING_KEYS.all });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save training data. Please try again.",
        variant: "destructive",
      });
      console.error("Save training data error:", error);
    },
  });
};

// Hook for training model
export const useTrainModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertType: string) => trainService.trainModel(alertType),
    onSuccess: (_, alertType) => {
      toast({
        title: "Training Started",
        description: `${alertType} model training has been initiated.`,
      });
      // Invalidate results to show training status
      queryClient.invalidateQueries({ queryKey: TRAINING_KEYS.results(alertType) });
      
      // Set up polling for training results
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: TRAINING_KEYS.results(alertType) });
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start model training. Please try again.",
        variant: "destructive",
      });
      console.error("Train model error:", error);
    },
  });
};