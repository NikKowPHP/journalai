import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLanguageStore } from "@/lib/stores/language.store";
import { useToast } from "@/components/ui/use-toast";

export const useCreateSrsFromMistake = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );
  return useMutation({
    mutationFn: apiClient.srs.createFromMistake,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studyDeck", authUser?.id, activeTargetLanguage],
      });
      toast({
        title: "Added to Deck",
        description: "The item has been added to your study deck.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: error.message || "Could not add item to your study deck.",
      });
    },
  });
};
