import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";

export const useAutocomplete = () => {
  return useMutation({
    mutationFn: apiClient.ai.autocomplete,
  });
};
