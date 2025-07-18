import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";

export const useTranslateText = () => {
  return useMutation({
    mutationFn: apiClient.ai.translate,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
  });
};