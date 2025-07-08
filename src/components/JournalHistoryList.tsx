import Link from "next/link"

interface JournalEntry {
  id: string
  title: string
  snippet: string
  date: string
}

interface JournalHistoryListProps {
  journals: JournalEntry[]
}

export function JournalHistoryList({ journals }: JournalHistoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Previous Entries</h2>
      {journals.map((entry) => (
        <Link
          key={entry.id}
          href={`/journal/${entry.id}`}
          className="block p-4 border rounded-lg hover:bg-gray-50"
        >
          <h3 className="font-medium">{entry.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{entry.snippet}</p>
          <time className="text-xs text-gray-500">{entry.date}</time>
        </Link>
      ))}
    </div>
  )
}