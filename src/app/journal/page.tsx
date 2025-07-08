import React from 'react';
import { JournalEditor } from "@/components/JournalEditor"
import { JournalHistoryList } from "@/components/JournalHistoryList"

const mockJournals = [
  {
    id: "1",
    title: "First Journal Entry",
    snippet: "Today I learned some new vocabulary...",
    date: "2025-07-01",
  },
  {
    id: "2",
    title: "Second Journal Entry",
    snippet: "Practiced writing about my daily routine...",
    date: "2025-07-03",
  },
  {
    id: "3",
    title: "Third Journal Entry",
    snippet: "Tried describing my favorite book...",
    date: "2025-07-05",
  },
];

export default function JournalPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Journal</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <JournalHistoryList journals={mockJournals} />
        <JournalEditor onSubmit={() => console.log('Journal submitted')} />
      </div>
    </div>
  );
}