import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: QueryKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOptimisticUpdate?: (oldData: any, variables: TVariables) => any;
  onSuccessMessage?: string;
  onErrorMessage?: string;
  invalidateQueries?: QueryKey[];
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  onOptimisticUpdate,
  onSuccessMessage,
  onErrorMessage,
  invalidateQueries = [],
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      if (onOptimisticUpdate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(queryKey, (old: any) =>
          onOptimisticUpdate(old, variables)
        );
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast({
        title: "Error",
        description: onErrorMessage || "Operation failed",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      if (onSuccessMessage) {
        toast({
          title: "Success",
          description: onSuccessMessage,
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });

      // Invalidate additional queries if specified
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}
