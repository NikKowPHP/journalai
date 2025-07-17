
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthLinks } from "@/components/AuthLinks";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomTabBar } from "./BottomTabBar";
import { OnboardingWizard } from "../OnboardingWizard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { JournalEditor } from "../JournalEditor";
import { Button } from "../ui/button";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useCompleteOnboarding } from "@/lib/hooks/data";

function AppFooter() {
  return (
    <footer className="hidden md:flex border-t py-6 bg-secondary/50">
      <div className="container mx-auto px-4 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} LinguaScribe. All rights reserved.</p>
        <div className="flex gap-4">
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookies"
            className="hover:text-foreground transition-colors"
          >
            Cookie Policy
          </Link>
          <a
            href="mailto:lessay.tech@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}

const GlobalSpinner = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "var(--background)",
      zIndex: 9999,
    }}
  >
    <div
      className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-r-primary"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const {
    step,
    isActive,
    setOnboardingJournalId,
    onboardingJournalId,
    setStep,
    resetOnboarding,
  } = useOnboardingStore();
  const completeOnboardingMutation = useCompleteOnboarding();
  const pathname = usePathname();
  const router = useRouter();

  const completeOnboarding = () => {
    completeOnboardingMutation.mutate(undefined, {
      onSuccess: () => {
        resetOnboarding();
      },
    });
  };

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

  const protectedRoutes = [
    "/dashboard",
    "/journal",
    "/study",
    "/translator",
    "/settings",
    "/admin",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  useEffect(() => {
    if (loading) return; // Don't do anything until auth state is confirmed

    if (user && isAuthPage) {
      router.replace("/dashboard");
    }
    if (!user && isProtectedRoute) {
      router.replace("/login");
    }
  }, [loading, user, isAuthPage, isProtectedRoute, router]);

  // NEW "GATEKEEPER" RENDER LOGIC
  // Show the spinner if:
  // 1. The initial auth state is still loading.
  // 2. A redirect is about to happen (e.g., logged-in user on /login).
  if (loading || (user && isAuthPage) || (!user && isProtectedRoute)) {
    return <GlobalSpinner />;
  }

  const OnboardingOverlay = () => {
    if (!isActive) return null;

    switch (step) {
      case "PROFILE_SETUP":
        return (
          <OnboardingWizard
            isOpen={true}
            onClose={() => {}}
            onComplete={() => setStep("FIRST_JOURNAL")}
            onError={(err) => console.error("Onboarding wizard error:", err)}
          />
        );

      case "FIRST_JOURNAL":
        return (
          <Dialog open={true}>
            <DialogContent showCloseButton={false} className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Your First Entry</DialogTitle>
                <DialogDescription>
                  Great! Now, write a short paragraph in your target language.
                  Don't worry about mistakes - that's how we learn!
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <JournalEditor
                  isOnboarding={true}
                  onOnboardingSubmit={(id) => {
                    setOnboardingJournalId(id);
                    setStep("VIEW_ANALYSIS"); // Pre-emptively set the step
                    router.push(`/journal/${id}`); // Redirect to the analysis page
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        );

      case "VIEW_ANALYSIS":
        // This logic handles showing a prompt to the user if they navigate away
        // from the journal page before finishing the tour.
        if (pathname.startsWith("/journal/")) return null;
        return (
          <Dialog open={true}>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Let's Review Your Feedback</DialogTitle>
                <DialogDescription>
                  Your first journal entry has been analyzed. Let's check out
                  the feedback together.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    router.push(`/journal/${onboardingJournalId}`);
                  }}
                  disabled={!onboardingJournalId}
                >
                  View My Analysis
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );

      case "CREATE_DECK":
        return (
          <Dialog open={true}>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Flashcard Created!</DialogTitle>
                <DialogDescription>
                  You've added your first correction to your study deck. Let's
                  go practice.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    router.push("/study");
                    setStep("STUDY_INTRO");
                  }}
                >
                  Go to Study Page
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );

      case "COMPLETED":
        return (
          <Dialog open={true}>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>🎉 Setup Complete!</DialogTitle>
                <DialogDescription>
                  You're all set. You're ready to master your new language.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  onClick={() => {
                    completeOnboarding();
                    router.push("/analytics");
                  }}
                >
                  View My Progress
                </Button>
                <Button
                  onClick={() => {
                    completeOnboarding();
                    router.push("/dashboard");
                  }}
                >
                  Explore Dashboard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );

      default:
        return null;
    }
  };

  // If user is authenticated show the main app shell
  if (user && !isAuthPage) {
    return (
      <div className="flex h-screen bg-secondary/30">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
          <AppFooter />
          <BottomTabBar />
        </div>
        <OnboardingOverlay />
      </div>
    );
  }

  // Otherwise, show the public layout
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-background/80 backdrop-blur-lg border-b sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center h-16">
          <Link href="/" className="text-lg font-bold">
            LinguaScribe
          </Link>
          <div className="space-x-2 sm:space-x-4 flex items-center">
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                href="/pricing"
                className="hover:underline text-sm font-medium"
              >
                Pricing
              </Link>
            </div>
            <AuthLinks />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}