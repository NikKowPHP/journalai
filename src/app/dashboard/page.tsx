"use client";
import React from "react";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/user";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user: authUser } = useAuth();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", authUser?.id],
    queryFn: () => getUserProfile(authUser?.id),
    enabled: !!authUser?.id,
  });

  const { data: suggestedTopics, isLoading: areTopicsLoading } = useQuery({
    queryKey: ["suggestedTopics"],
    queryFn: () =>
      fetch("/api/user/suggested-topics").then((res) => res.json()),
    enabled: !!user && user.onboardingCompleted,
  });

  if (isUserLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  if (user && !user.onboardingCompleted) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Welcome to LinguaScribe!</h1>
        <p>Please complete the setup to continue.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome back! Ready to continue your language journey.</p>
      
      {areTopicsLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        suggestedTopics?.length > 0 && (
          <SuggestedTopics topics={suggestedTopics} />
        )
      )}
    </div>
  );
}