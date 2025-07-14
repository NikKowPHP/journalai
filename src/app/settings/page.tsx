"use client";
import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { ProfileForm } from "@/components/ProfileForm";
import { AccountDeletion } from "@/components/AccountDeletion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ChevronsRight, LogOut, Mail } from "lucide-react";
import {
  useCreatePortalSession,
  useUserProfile,
} from "@/lib/hooks/data-hooks";

export default function SettingsPage() {
  const signOut = useAuthStore((state) => state.signOut);
  const { data: profile, isLoading } = useUserProfile();
  const portalMutation = useCreatePortalSession();

  const handleManageSubscription = () => {
    portalMutation.mutate(undefined, {
      onSuccess: (response) => {
        if (response.url) {
          window.location.href = response.url;
        }
      },
    });
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-title-1">Settings</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-subhead px-4 mb-2 text-muted-foreground uppercase">
            Profile
          </h2>
          <ProfileForm
            isLoading={isLoading}
            email={profile?.email}
            nativeLanguage={profile?.nativeLanguage}
            targetLanguage={profile?.targetLanguage}
            writingStyle={profile?.writingStyle}
            writingPurpose={profile?.writingPurpose}
            selfAssessedLevel={profile?.selfAssessedLevel}
          />
        </section>

        <section>
          <h2 className="text-subhead px-4 mb-2 text-muted-foreground uppercase">
            Subscription
          </h2>
          <Card>
            <CardContent className="p-0 md:p-2 divide-y">
              {profile?.subscriptionTier !== "FREE" && (
                <Button
                  variant="ghost"
                  onClick={handleManageSubscription}
                  disabled={portalMutation.isPending}
                  className="w-full justify-between h-14 px-4 rounded-none md:rounded-md"
                >
                  <span>
                    {portalMutation.isPending
                      ? "Loading..."
                      : "Manage Subscription"}
                  </span>
                  <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
              <Button
                asChild
                variant="ghost"
                className="w-full justify-between h-14 px-4 rounded-none md:rounded-md"
              >
                <Link href="/pricing">
                  <span>View Pricing Plans</span>
                  <ChevronsRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-subhead px-4 mb-2 text-muted-foreground uppercase">
            Data
          </h2>
          <Card>
            <CardContent className="p-0 md:p-2 divide-y">
              <Button
                asChild
                variant="ghost"
                className="w-full justify-between h-14 px-4 rounded-none md:rounded-md"
              >
                <Link href="/api/user/export">
                  <span>Export My Data</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-subhead px-4 mb-2 text-muted-foreground uppercase">
            Developer
          </h2>
          <Card>
            <CardContent className="p-0 md:p-2">
              <Button
                asChild
                variant="ghost"
                className="w-full justify-between h-14 px-4 rounded-none md:rounded-md"
              >
                <Link href="mailto:lessay.tech@gmail.com">
                  <span>Contact & Support</span>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-subhead px-4 mb-2 text-muted-foreground uppercase">
            Account
          </h2>
          <Card>
            <CardContent className="p-0 md:p-2">
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="w-full justify-between h-14 px-4 rounded-none md:rounded-md"
              >
                <span>Logout</span>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-subhead px-4 mb-2 text-muted-foreground uppercase">
            Danger Zone
          </h2>
          <Card>
            <CardContent className="p-0 md:p-2">
              <AccountDeletion />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}