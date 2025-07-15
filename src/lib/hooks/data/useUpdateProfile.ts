import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useToast } from "@/components/ui/use-toast";
import type { ProfileUpdateData } from "@/lib/types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: (data: ProfileUpdateData) => apiClient.profile.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
      toast({
        title: "Profile Saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description:
          error.message || "Could not save your profile. Please try again.",
      });
    },
  });
};