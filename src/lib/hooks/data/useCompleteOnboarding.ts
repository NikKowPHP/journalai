import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useToast } from "@/components/ui/use-toast";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";

export const useCompleteOnboarding = (options?: {
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);

  return useMutation({
    mutationFn: apiClient.user.completeOnboarding,
    onSuccess: () => {
      // First, invalidate the user profile so the client re-fetches it with onboardingCompleted: true
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
      // Second, show a success message
      toast({
        title: "Onboarding Complete!",
        description: "Welcome! You're all set to start your journey.",
      });
      // Third, reset the global onboarding state store
      resetOnboarding();
      // Finally, execute any additional success logic, like navigation.
      options?.onSuccess?.();
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