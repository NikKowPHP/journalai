"use client";
import { StudySession } from "@/components/StudySession";
import { useQuery } from "@tanstack/react-query";

export default function StudyPage() {
  const { data: studyDeck, isLoading, error } = useQuery({
    queryKey: ["studyDeck"],
    queryFn: async () => {
      const res = await fetch("/api/srs/deck");
      if (!res.ok) throw new Error("Failed to fetch study deck");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading study deck...</div>;
  if (error) return <div>Error loading study deck: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Study Deck (SRS)</h1>
      <StudySession cards={studyDeck} />
    </div>
  );
}