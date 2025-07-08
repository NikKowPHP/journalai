import Link from "next/link"

const mockEntries = [
  {
    id: "1",
    title: "First Journal Entry",
    content: "Today I learned some new vocabulary...",
    date: "2025-07-01",
  },
  {
    id: "2",
    title: "Second Journal Entry",
    content: "Practiced writing about my daily routine...",
    date: "2025-07-03",
  },
  {
    id: "3",
    title: "Third Journal Entry",
    content: "Tried describing my favorite book...",
    date: "2025-07-05",
  },
]

export function JournalHistoryList() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Previous Entries</h2>
      {mockEntries.map((entry) => (
        <Link
          key={entry.id}
          href={`/journal/${entry.id}`}
          className="block p-4 border rounded-lg hover:bg-gray-50"
        >
          <h3 className="font-medium">{entry.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
          <time className="text-xs text-gray-500">{entry.date}</time>
        </Link>
      ))}
    </div>
  )
}