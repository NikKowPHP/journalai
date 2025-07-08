import React from 'react';
import { JournalEditor } from "@/components/JournalEditor"
import { JournalHistoryList } from "@/components/JournalHistoryList"

export default function JournalPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Journal</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <JournalHistoryList />
        <JournalEditor />
      </div>
    </div>
  );
}