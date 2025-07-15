import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useLanguageStore } from "@/lib/stores/language.store";
import { useToast } from "@/components/ui/use-toast";

export const useGenerateTopics = () => {
  const { toast } = useToast();
  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );
  return useMutation({
    mutationFn: () =>
      apiClient.user.generateTopics({
        targetLanguage: activeTargetLanguage!,
      }),
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: error.message || "Could not generate topics at this time.",
      });
    },
  });
};