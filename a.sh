#!/bin/bash

# Modify src/app/layout.tsx to separate viewport metadata
cat <<'EOF' > 'src/app/layout.tsx'
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Providers from "@/providers/Providers";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaScribe",
  description: "AI-powered language learning through writing",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
EOF

# Modify src/components/FeedbackCard.tsx to invalidate query cache
cat <<'EOF' > 'src/components/FeedbackCard.tsx'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface FeedbackCardProps {
  title: string;
  explanation: string;
  suggestion: string;
  mistakeId: string;
  onOnboardingAddToDeck?: () => void;
}

const AddToDeckButton = ({
  mistakeId,
  onOnboardingAddToDeck,
}: {
  mistakeId: string;
  onOnboardingAddToDeck?: () => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () =>
      axios.post("/api/srs/create-from-mistake", { mistakeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyDeck"] });
      onOnboardingAddToDeck?.();
    },
  });

  if (isSuccess) {
    return (
      <Button variant="ghost" disabled size="sm">
        Added to deck!
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus className="mr-2 h-4 w-4" />
      )}
      Add to deck
    </Button>
  );
};

export const FeedbackCard = ({
  title,
  explanation,
  suggestion,
  mistakeId,
  onOnboardingAddToDeck,
}: FeedbackCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <AddToDeckButton
            mistakeId={mistakeId}
            onOnboardingAddToDeck={onOnboardingAddToDeck}
          />
        </div>
        <CardDescription>{explanation}</CardDescription>
      </CardHeader>
    </Card>
  );
};
EOF

# Modify public/manifest.json to remove non-existent icons
cat <<'EOF' > 'public/manifest.json'
{
  "name": "LinguaScribe",
  "short_name": "LinguaScribe",
  "description": "AI-powered language learning through writing",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": []
}
EOF