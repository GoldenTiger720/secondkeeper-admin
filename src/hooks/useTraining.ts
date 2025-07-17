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

// Hook for deleting training data with proper backend waiting
export const useDeleteTrainingData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertIds, alertType }: { alertIds: string[], alertType: string }) => 
      trainService.deleteTrainingData(alertIds, alertType),
    onSuccess: (_, { alertIds }) => {
      toast({
        title: "Success",
        description: `${alertIds.length} training data items deleted successfully.`,
      });
      // Invalidate all training queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: TRAINING_KEYS.all });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete training data. Please try again.",
        variant: "destructive",
      });
      console.error("Delete training data error:", error);
    },
  });
};

// Hook for extracting frames
export const useExtractFrames = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertIds, alertType }: { alertIds: string[], alertType: string }) => 
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
    mutationFn: ({ alertIds, alertType }: { alertIds: string[], alertType: string }) => 
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