import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";

export const useStuckWriterSuggestions = () => {
  return useMutation({
    mutationFn: apiClient.ai.getStuckSuggestions,
    // No onSuccess or onError toast needed for this feature as it's non-critical
  });
};