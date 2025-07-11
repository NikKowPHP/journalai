"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthLinks } from "@/components/AuthLinks";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomTabBar } from "./BottomTabBar";
import { useOnboarding } from "@/lib/onboarding-context";
import { OnboardingWizard } from "../OnboardingWizard";

function AppFooter() {
  return (
    <footer className="border-t py-6 bg-secondary/50">
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { step, setStep, isActive } = useOnboarding();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  
  if (loading) {
    return null; // AuthProvider shows a global spinner
  }
  
  const OnboardingOverlay = () => {
    if (!isActive) return null;
    
    // In phase 3, this will have more steps. For now, it just shows the wizard.
    if (step === 'PROFILE_SETUP') {
      return (
        <OnboardingWizard
          isOpen={true}
          onClose={() => {
            // Onboarding is mandatory, can't be closed.
          }}
          onComplete={() => {
            // This is simplified. In the next phase, it will advance the step.
            // For now, it just completes.
            setStep('FIRST_JOURNAL');
          }}
          onError={(err) => console.error("Onboarding wizard error:", err)}
        />
      );
    }

    // Placeholder for other steps to be built in Phase 3
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center text-white p-4 text-center">
            <div>
                <h2 className="text-2xl font-bold mb-2">Onboarding in Progress</h2>
                <p>Current Step: {step}</p>
            </div>
        </div>
    );
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