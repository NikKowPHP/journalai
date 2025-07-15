import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useLanguageStore } from "@/lib/stores/language.store";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/stores/auth.store";

export const useGenerateTopics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );
  return useMutation({
    mutationFn: () =>
      apiClient.user.generateTopics({
        targetLanguage: activeTargetLanguage!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["suggestedTopics", authUser?.id, activeTargetLanguage],
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: error.message || "Could not generate topics at this time.",
      });
    },
  });
};