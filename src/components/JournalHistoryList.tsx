import Link from "next/link";
import { Card, CardContent } from "./ui/card";

interface JournalEntry {
  id: string;
  title: string;
  snippet: string;
  date: string;
}

interface JournalHistoryListProps {
  journals: JournalEntry[];
}

export function JournalHistoryList({ journals }: JournalHistoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Previous Entries</h2>
      <div className="space-y-2 md:space-y-4">
        {journals.map((entry, index) => (
          <Link key={entry.id} href={`/journal/${entry.id}`} passHref>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg md:rounded-xl">
              <CardContent className="p-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium line-clamp-1">{entry.title}</h3>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {entry.date}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {entry.snippet}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
