
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";

export const useTranslateAndBreakdown = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: {
      text: string;
      sourceLanguage: string;
      targetLanguage: string;
    }) => apiClient.ai.translateAndBreakdown(payload),
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Translation Failed",
        description:
          error.message ||
          "We could not process your translation at this time.",
      });
    },
  });
};