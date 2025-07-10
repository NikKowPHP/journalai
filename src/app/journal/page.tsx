"use client";
import React from "react";
import { JournalEditor } from "@/components/JournalEditor";
import { JournalHistoryList } from "@/components/JournalHistoryList";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export default function JournalPage() {
  const searchParams = useSearchParams();
  const topicFromQuery = searchParams.get("topic");

  const {
    data: journals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["journals"],
    queryFn: async () => {
      const res = await fetch("/api/journal");
      if (!res.ok) throw new Error("Failed to fetch journals");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading journals...</div>;
  if (error) return <div>Error loading journals: {(error as Error).message}</div>;

  const mappedJournals =
    journals?.map((j: any) => ({
      id: j.id,
      title: j.topic.title,
      snippet: j.content.substring(0, 100) + "...",
      date: new Date(j.createdAt).toLocaleDateString(),
    })) || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Journal</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <JournalHistoryList journals={mappedJournals} />
        <JournalEditor topicTitle={topicFromQuery || undefined} />
      </div>
    </div>
  );
}