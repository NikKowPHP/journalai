import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useToast } from "@/components/ui/use-toast";

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: apiClient.user.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
      toast({
        title: "Onboarding Complete!",
        description: "Welcome! You're all set to start your journey.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not finalize onboarding.",
      });
    },
  });
};