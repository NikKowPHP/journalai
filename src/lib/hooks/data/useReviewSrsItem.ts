
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";

export const useReviewSrsItem = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.srs.review,
    // onSuccess is removed to prevent UI lag. The database update now happens silently.
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Review Failed",
        description: error.message || "Could not save your review.",
      });
    },
  });
};