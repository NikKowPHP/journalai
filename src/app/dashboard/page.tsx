import React from "react";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/user";

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const [showWizard, setShowWizard] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ["user", authUser?.id],
    queryFn: () => getUserProfile(authUser?.id),
    enabled: !!authUser?.id,
  });

  React.useEffect(() => {
    if (user && !user.nativeLanguage) {
      setShowWizard(true);
    }
  }, [user]);

  const handleWizardComplete = () => {
    setShowWizard(false);
    // TODO: Add logic to refresh user data after onboarding
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">LinguaScribe Dashboard</h1>
      {user?.nativeLanguage ? (
        <p>Welcome back! Ready to continue your language journey.</p>
      ) : (
        <p>Loading your dashboard...</p>
      )}

      <OnboardingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
        onError={(error) => console.error("Onboarding error:", error)}
      />
    </div>
  );
}
