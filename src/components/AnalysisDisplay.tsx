interface AnalysisDisplayProps {
  content: string
  highlights: Array<{
    start: number
    end: number
    type: 'grammar' | 'phrasing' | 'vocabulary'
  }>
}

export function AnalysisDisplay({ content, highlights }: AnalysisDisplayProps) {
  const parts = []
  let lastIndex = 0

  // Sort highlights by start index
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start)

  sortedHighlights.forEach((highlight, index) => {
    // Add text before the highlight
    if (highlight.start > lastIndex) {
      parts.push(content.slice(lastIndex, highlight.start))
    }

    // Add highlighted text
    const highlightedText = content.slice(highlight.start, highlight.end)
    const bgColor = {
      grammar: 'bg-red-100',
      phrasing: 'bg-blue-100',
      vocabulary: 'bg-yellow-100',
    }[highlight.type]
    
    parts.push(
      <span key={`highlight-${index}`} className={`${bgColor} rounded px-1`}>
        {highlightedText}
      </span>
    )

    lastIndex = highlight.end
  })

  // Add remaining text after last highlight
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="text-lg font-semibold mb-4">Your Original Text</h2>
      <div className="prose max-w-none">{parts}</div>
    </div>
  )
}