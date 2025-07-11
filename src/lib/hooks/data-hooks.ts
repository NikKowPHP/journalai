import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ProfileData } from "../services/api-client.service";
import { useAuth } from "../auth-context";
import { OnboardingData } from "../services/api-client.service";

export const useUserProfile = () => {
  const { user: authUser } = useAuth();
  return useQuery({
    queryKey: ["userProfile", authUser?.id],
    queryFn: apiClient.profile.get,
    enabled: !!authUser,
  });
};

export const useAnalyticsData = () => {
  const { user: authUser } = useAuth();
  return useQuery({
    queryKey: ["analytics", authUser?.id],
    queryFn: apiClient.analytics.get,
    enabled: !!authUser,
  });
};

export const useJournalHistory = () => {
  const { user: authUser } = useAuth();
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
  const { user: authUser } = useAuth();
  return useQuery({
    queryKey: ["studyDeck", authUser?.id],
    queryFn: apiClient.srs.getDeck,
    enabled: !!authUser,
  });
};

// Mutations

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  return useMutation({
    mutationFn: (data: Partial<ProfileData>) => apiClient.profile.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] });
    },
  });
};

export const useSubmitJournal = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  return useMutation({
    mutationFn: apiClient.journal.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals", authUser?.id] });
    },
  });
};

export const useAnalyzeJournal = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  return useMutation({
    mutationFn: apiClient.analyze.start,
    onSuccess: (analysis, journalId) => {
      queryClient.invalidateQueries({ queryKey: ["journal", journalId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", authUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] });
    },
  });
};

export const useRetryJournalAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.journal.retryAnalysis,
    onSuccess: (analysis, journalId) => {
      queryClient.invalidateQueries({ queryKey: ["journal", journalId] });
    },
  });
};

export const useGenerateTopics = () => {
  return useMutation({
    mutationFn: apiClient.user.generateTopics,
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: apiClient.user.delete,
  });
};

export const useCreateSrsFromMistake = () => {
  return useMutation({
    mutationFn: apiClient.srs.createFromMistake,
  });
};

export const useReviewSrsItem = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  return useMutation({
    mutationFn: apiClient.srs.review,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyDeck", authUser?.id] });
    },
  });
};

export const useOnboardUser = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  return useMutation({
    mutationFn: (data: OnboardingData) => apiClient.user.onboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] });
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  return useMutation({
    mutationFn: apiClient.user.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] });
    },
  });
};

export const useCreateCheckoutSession = () => {
    return useMutation({
        mutationFn: apiClient.billing.createCheckoutSession,
    });
};

export const useCreatePortalSession = () => {
    return useMutation({
        mutationFn: apiClient.billing.createPortalSession,
    });
};