import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Displays a single feedback item with original text, suggestion, and explanation.
 * @param {object} props - The component props.
 * @param {string} props.original - The original user-submitted text.
 * @param {string} props.suggestion - The suggested improved version.
 * @param {string} props.explanation - The reasoning behind the suggestion.
 * @returns {React.ReactElement} A card component displaying the feedback.
 */
interface FeedbackCardProps {
  original: string;
  suggestion: string;
  explanation: string;
  mistakeId: string;
  onOnboardingAddToDeck?: () => void;
}

function AddToDeckButton({
  mistakeId,
  onOnboardingAddToDeck,
}: {
  mistakeId: string;
  onOnboardingAddToDeck?: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () =>
      axios.post("/api/srs/create-from-mistake", { mistakeId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["studyDeck"] });
      onOnboardingAddToDeck?.();
    },
  });

  if (isSuccess) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Added to Deck!
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? "Adding..." : "Add to Study Deck"}
    </Button>
  );
}

export function FeedbackCard({
  original,
  suggestion,
  explanation,
  mistakeId,
  onOnboardingAddToDeck,
}: FeedbackCardProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Original Text</h3>
        <p className="text-sm line-through text-muted-foreground">{original}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-medium">Suggested Correction</h3>
        <p className="text-sm text-green-700 dark:text-green-400">
          {suggestion}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-medium">Explanation</h3>
        <p className="text-sm text-muted-foreground">{explanation}</p>
      </div>

      <AddToDeckButton
        mistakeId={mistakeId}
        onOnboardingAddToDeck={onOnboardingAddToDeck}
      />
    </Card>
  );
}
