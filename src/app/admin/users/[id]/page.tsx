import { getUserById } from "@/lib/user";
import { UpdateSubscriptionForm } from "@/app/admin/users/[id]/UpdateSubscriptionForm";

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUserById(params.id);

  if (!user) {
    return <div className="p-4">User not found</div>;
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Details</h2>
          <p className="text-muted-foreground">
            Manage subscription for {user.email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Subscription</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Tier:</span> {user.subscriptionTier}
              </p>
              <p>
                <span className="font-medium">Status:</span> {user.subscriptionStatus}
              </p>
              <p>
                <span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <UpdateSubscriptionForm
            userId={params.id}
            currentTier={user.subscriptionTier || "FREE"}
            currentStatus={user.subscriptionStatus || "ACTIVE"}
          />
        </div>
      </div>
    </div>
  );
}