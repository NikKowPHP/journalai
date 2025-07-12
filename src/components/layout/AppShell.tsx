"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthLinks } from "@/components/AuthLinks";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomTabBar } from "./BottomTabBar";
import { useOnboarding } from "@/lib/onboarding-context";
import { OnboardingWizard } from "../OnboardingWizard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { JournalEditor } from "../JournalEditor";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../ui/Spinner";
import { Button } from "../ui/button";

function AppFooter() {
  return (
    <footer className="hidden md:flex border-t py-6 bg-secondary/50">
      <div className="container mx-auto px-4 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} LinguaScribe. All rights reserved.</p>
        <div className="flex gap-4">
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
        </div>
      </div>
    </footer>
  );
}

const AwaitingAnalysisModal = () => {
    const { onboardingJournalId, setStep } = useOnboarding();
    const router = useRouter();

    const { data: journal } = useQuery({
        queryKey: ['journal', onboardingJournalId],
        queryFn: async () => {
            const res = await fetch(`/api/journal/${onboardingJournalId}`);
            if (!res.ok) throw new Error('Failed to fetch journal');
            return res.json();
        },
        enabled: !!onboardingJournalId,
        refetchInterval: 3000, // Poll every 3 seconds
    });

    useEffect(() => {
        if (journal?.analysis) {
            setStep('VIEW_ANALYSIS');
            router.push(`/journal/${journal.id}`);
        }
    }, [journal, setStep, router]);

    return (
        <Dialog open={true}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Analysis in Progress</DialogTitle>
                    <DialogDescription>
                        We're analyzing your journal entry. This may take a moment. Please wait...
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { step, setStep, isActive, setOnboardingJournalId, completeOnboarding } = useOnboarding();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  
  if (loading) {
    return null; // AuthProvider shows a global spinner
  }
  
  const OnboardingOverlay = () => {
    if (!isActive) return null;
    console.log('step', step)
    switch(step) {
        case 'PROFILE_SETUP':
            return <OnboardingWizard
                isOpen={true}
                onClose={() => {}}
                onComplete={() => setStep('FIRST_JOURNAL')}
                onError={(err) => console.error("Onboarding wizard error:", err)}
            />;
        
        case 'FIRST_JOURNAL':
            return <Dialog open={true}>
                <DialogContent showCloseButton={false} className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Your First Entry</DialogTitle>
                        <DialogDescription>
                            Great! Now, write a short paragraph in your target language. Don't worry about mistakes - that's how we learn!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <JournalEditor
                            isOnboarding={true}
                            onOnboardingSubmit={(id) => {
                                setOnboardingJournalId(id);
                                setStep('AWAITING_ANALYSIS');
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>;

        case 'AWAITING_ANALYSIS':
            return <AwaitingAnalysisModal />;

        case 'CREATE_DECK':
             return <Dialog open={true}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Flashcard Created!</DialogTitle>
                        <DialogDescription>
                            You've added your first correction to your study deck. Let's go practice.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => { router.push('/study'); setStep('STUDY_INTRO'); }}>
                            Go to Study Page
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>;

        case 'COMPLETED':
            return <Dialog open={true}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>🎉 Setup Complete!</DialogTitle>
                        <DialogDescription>
                            You're all set. You're ready to master your new language.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:flex-row">
                        <Button variant="secondary" onClick={() => { completeOnboarding(); router.push('/analytics'); }}>
                            View My Progress
                        </Button>
                        <Button onClick={() => { completeOnboarding(); router.push('/dashboard'); }}>
                            Explore Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>;
        
        default:
            return null;
    }
  };


  // If user is authenticated and not on an auth page, show the main app shell
  if (user && !isAuthPage) {
    return (
      <div className="flex h-screen bg-secondary/30">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
            <AppFooter />
          </main>
          <BottomTabBar />
        </div>
        <OnboardingOverlay />
      </div>
    );
  }
  
  // Otherwise, show the public layout
  return (
    <>
      <nav className="bg-background/80 backdrop-blur-lg border-b sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center h-16">
          <Link href="/" className="text-lg font-bold">
            LinguaScribe
          </Link>
          <div className="space-x-2 sm:space-x-4 flex items-center">
            <div className="hidden sm:flex items-center space-x-4">
              <Link href="/pricing" className="hover:underline text-sm font-medium">
                  Pricing
              </Link>
            </div>
            <AuthLinks />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
      <AppFooter />
    </>
  );
}