import React from 'react';
import { ProfileForm } from "@/components/ProfileForm"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ProfileForm />
    </div>
  );
}