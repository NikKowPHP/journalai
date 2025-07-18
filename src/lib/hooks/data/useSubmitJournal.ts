
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLanguageStore } from "@/lib/stores/language.store";
import { useToast } from "@/components/ui/use-toast";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

export const useSubmitJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );
  const analytics = useAnalytics();
  return useMutation({
    mutationFn: (payload: { content: string; topicTitle?: string }) =>
      apiClient.journal.create({
        ...payload,
        targetLanguage: activeTargetLanguage!,
      }),
    onSuccess: (data, variables) => {
      analytics.capture("Journal Submitted", {
        journalId: data.id,
        language: activeTargetLanguage,
        characterCount: variables.content.length,
      });
      queryClient.invalidateQueries({
        queryKey: ["journals", authUser?.id, activeTargetLanguage],
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Your journal entry could not be saved.",
      });
    },
  });
};