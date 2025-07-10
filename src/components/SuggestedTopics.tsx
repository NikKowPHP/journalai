import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuggestedTopicsProps {
  topics: string[];
}

export function SuggestedTopics({ topics }: SuggestedTopicsProps) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {topics.map((topic) => (
            <li key={topic}>
              <Link href={`/journal?topic=${encodeURIComponent(topic)}`} passHref>
                <Button variant="link" className="p-0 h-auto text-base">
                  {topic}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}