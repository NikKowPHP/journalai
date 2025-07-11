import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api-client.service";
import { useAuth } from "../auth-context";

export const useAdminUsers = (page: number, searchTerm: string) => {
  const { user: authUser } = useAuth();
  return useQuery({
    queryKey: ["admin-users", searchTerm, page],
    queryFn: () =>
      apiClient.admin.getUsers({ search: searchTerm, page, limit: 20 }),
    enabled: !!authUser,
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