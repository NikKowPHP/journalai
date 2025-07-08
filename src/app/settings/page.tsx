import React from "react";
import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { AccountDeletion } from "@/components/AccountDeletion";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ProfileForm />
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Subscription</h2>
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
