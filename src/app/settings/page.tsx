import React from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useAuth } from "@/lib/auth-context";
import { ProfileForm } from "@/components/ProfileForm";
import { AccountDeletion } from "@/components/AccountDeletion";
import { Button } from "@/components/ui/button";

interface PortalResponse {
  url: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
  const portalMutation = useMutation<AxiosResponse<PortalResponse>, Error>({
    mutationFn: () => axios.post('/api/billing/portal'),
    onSuccess: (response) => {
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ProfileForm
        email={profile?.email}
        nativeLanguage={profile?.nativeLanguage}
        targetLanguage={profile?.targetLanguage}
        writingStyle={profile?.writingStyle}
        writingPurpose={profile?.writingPurpose}
        selfAssessedLevel={profile?.selfAssessedLevel}
      />
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Subscription</h2>
        {profile?.subscriptionTier !== "FREE" && (
          <Button
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            className="mr-2"
          >
            {portalMutation.isPending ? "Loading..." : "Manage Subscription"}
          </Button>
        )}
        <Button
          asChild
          variant="outline"
          className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Link href="/pricing">View Pricing Plans</Link>
        </Button>
      </div>
      <AccountDeletion />
    </div>
  );
}
