import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ProfileData } from "../services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { OnboardingData } from "../services/api-client.service";
import { useToast } from "@/components/ui/use-toast";

export const useUserProfile = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["userProfile", authUser?.id],
    queryFn: apiClient.profile.get,
    enabled: !!authUser,
  });
};

export const useAnalyticsData = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["analytics", authUser?.id],
    queryFn: apiClient.analytics.get,
    enabled: !!authUser,
  });
};

export const useJournalHistory = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["journals", authUser?.id],
    queryFn: apiClient.journal.getAll,
    enabled: !!authUser,
  });
};

export const useJournalEntry = (id: string) => {
  return useQuery({
    queryKey: ["journal", id],
    queryFn: () => apiClient.journal.getById(id),
    enabled: !!id,
  });
};

export const useStudyDeck = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["studyDeck", authUser?.id],
    queryFn: apiClient.srs.getDeck,
    enabled: !!authUser,
  });
};

// Mutations

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: (data: Partial<ProfileData>) => apiClient.profile.update(data),
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

export const useSubmitJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: apiClient.journal.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals", authUser?.id] });
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

export const useAnalyzeJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: apiClient.analyze.start,
    onSuccess: (analysis, journalId) => {
      queryClient.invalidateQueries({ queryKey: ["journal", journalId] });
      queryClient.invalidateQueries({ queryKey: ["journals", authUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["analytics", authUser?.id] });
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
      toast({
        title: "Analysis Complete",
        description: "Your journal feedback is ready to view.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description:
          error.message || "We encountered an error analyzing your entry.",
      });
    },
  });
};

export const useRetryJournalAnalysis = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.journal.retryAnalysis,
    onSuccess: (analysis, journalId) => {
      queryClient.invalidateQueries({ queryKey: ["journal", journalId] });
      toast({
        title: "Analysis Started",
        description:
          "We are re-analyzing your entry. The page will update shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Retry Failed",
        description: error.message || "Could not start the re-analysis.",
      });
    },
  });
};

export const useGenerateTopics = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.user.generateTopics,
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: error.message || "Could not generate topics at this time.",
      });
    },
  });
};

export const useDeleteAccount = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.user.delete,
    onSuccess: () => {
      toast({
        title: "Account Deletion Initiated",
        description: "You will be logged out and your account will be deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description:
          error.message || "Please contact support to delete your account.",
      });
    },
  });
};

export const useCreateSrsFromMistake = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.srs.createFromMistake,
    onSuccess: () => {
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

export const useReviewSrsItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: apiClient.srs.review,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyDeck", authUser?.id] });
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

export const useOnboardUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: (data: OnboardingData) => apiClient.user.onboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Your profile could not be saved.",
      });
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  return useMutation({
    mutationFn: apiClient.user.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });
      toast({
        title: "Onboarding Complete!",
        description: "Welcome! You're all set to start your journey.",
      });
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

export const useCreateCheckoutSession = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.billing.createCheckoutSession,
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description:
          error.message || "Could not proceed to checkout. Please try again.",
      });
    },
  });
};

export const useCreatePortalSession = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.billing.createPortalSession,
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Portal Error",
        description: error.message || "Could not open the billing portal.",
      });
    },
  });
};

export const useAutocomplete = () => {
  return useMutation({
    mutationFn: apiClient.ai.autocomplete,
  });
};