import { getUserById } from "@/lib/user";
import { UpdateSubscriptionForm } from "@/app/admin/users/[id]/UpdateSubscriptionForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { JournalEntry, Topic, Analysis, Mistake } from "@prisma/client";

type JournalEntryWithRelations = JournalEntry & {
  topic: Topic | null;
  analysis: (Analysis & { mistakes: Mistake[] }) | null;
};

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUserById({
    where: { id: params.id },
    include: {
      journalEntries: {
        include: {
          topic: true,
          analysis: {
            include: {
              mistakes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    return <div className="p-4">User not found</div>;
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Details</h2>
          <p className="text-muted-foreground">
            Manage subscription for {user.email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Subscription</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Tier:</span>{" "}
                {user.subscriptionTier}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {user.subscriptionStatus}
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <UpdateSubscriptionForm
            userId={params.id}
            currentTier={user.subscriptionTier || "FREE"}
            currentStatus={user.subscriptionStatus || "ACTIVE"}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Journal Entries</h3>
          {user.journalEntries?.length ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-2">
                {user.journalEntries.map((entry: JournalEntryWithRelations) => (
                  <Link href={`/journal/${entry.id}`} key={entry.id}>
                    <Card className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="font-semibold">
                          {entry.topic?.title || "Free Write"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1">
                          {entry.analysis
                            ? "Analysis available"
                            : "No analysis"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Analysis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.journalEntries.map(
                      (entry: JournalEntryWithRelations) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {entry.topic?.title || "Free Write"}
                          </TableCell>
                          <TableCell>
                            {entry.analysis ? (
                              <Link
                                href={`/journal/${entry.id}`}
                                className="text-primary hover:underline"
                              >
                                View Analysis
                              </Link>
                            ) : (
                              "No analysis"
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No journal entries found</p>
          )}
        </div>
      </div>
    </div>
  );
}