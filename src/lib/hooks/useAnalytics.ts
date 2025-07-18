
// src/lib/hooks/useAnalytics.ts
import { usePostHog } from "posthog-js/react";

const mockPostHog = {
  capture: () => {},
  identify: () => {},
  reset: () => {},
  // Add any other methods you might call to the mock
};

/**
 * A safe hook to access the PostHog instance.
 * In environments where PostHog is not available (e.g., during tests or if it fails to initialize),
 * it returns a mock object with no-op functions to prevent application crashes.
 * @returns {PostHog} The PostHog instance or a mock object.
 */
export const useAnalytics = () => {
  try {
    // This will throw if the provider is not found
    const posthog = usePostHog();

    // A safe wrapper for the capture function
    const capture: typeof posthog.capture = (...args) => {
      // Don't do anything if PostHog isn't configured to run
      if (!posthog || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        return;
      }
      try {
        posthog.capture(...args);
      } catch (e) {
        console.error("PostHog capture error:", e);
      }
    };

    return {
      ...posthog,
      capture, // Override with the safe version
    };
  } catch (error) {
    console.warn("PostHog context not found. Analytics will be disabled.");
    return mockPostHog;
  }
};