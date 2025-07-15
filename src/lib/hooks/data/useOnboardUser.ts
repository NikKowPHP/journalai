import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { OnboardingData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export const useOnboardUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: (data: OnboardingData) => apiClient.user.onboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Your profile could not be saved.",
      });
    },
  });
};