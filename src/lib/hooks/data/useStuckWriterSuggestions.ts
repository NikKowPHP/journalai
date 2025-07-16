
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";

export const useStuckWriterSuggestions = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.ai.getStuckSuggestions,
    onError: (error: Error) => {
      console.error("Stuck writer suggestions error:", error);
      toast({
        variant: "destructive",
        title: "Suggestion Error",
        description:
          error.message || "Could not get writing suggestions at this time.",
      });
    },
  });
};