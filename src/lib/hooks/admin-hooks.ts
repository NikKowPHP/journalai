import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useUserProfile } from "./data-hooks";

// The profile data will be passed in to determine if the query should run.
export const useAdminUsers = (
  userProfile: { subscriptionTier?: string } | null | undefined,
  page: number,
  searchTerm: string,
) => {
  return useQuery({
    queryKey: ["admin-users", searchTerm, page],
    queryFn: () =>
      apiClient.admin.getUsers({ search: searchTerm, page, limit: 20 }),
    // Only enable this query if the user profile is loaded AND the tier is 'ADMIN'.
    enabled: !!userProfile && userProfile.subscriptionTier === "ADMIN",
  });
};

export const useUpdateUserSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: { subscriptionTier: string; subscriptionStatus?: string };
    }) => apiClient.admin.updateSubscription(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      // Invalidation of the user detail page is handled by router.refresh() in the component
    },
  });
};

export const useAdminSettings = () => {
  const { data: userProfile } = useUserProfile();
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: apiClient.admin.getSettings,
    enabled: !!userProfile && userProfile.subscriptionTier === "ADMIN",
  });
};

export const useUpdateAdminSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      apiClient.admin.updateSetting({ key, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });
};