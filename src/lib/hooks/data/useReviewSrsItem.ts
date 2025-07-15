import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLanguageStore } from "@/lib/stores/language.store";
import { useToast } from "@/components/ui/use-toast";

export const useReviewSrsItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );
  return useMutation({
    mutationFn: apiClient.srs.review,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studyDeck", authUser?.id, activeTargetLanguage],
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Review Failed",
        description: error.message || "Could not save your review.",
      });
    },
  });
};