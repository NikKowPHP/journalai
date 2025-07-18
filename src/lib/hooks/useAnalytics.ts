
// src/lib/hooks/useAnalytics.ts
import { usePostHog } from "posthog-js/react";

/**
 * A safe hook to access the PostHog instance.
 * In environments where PostHog is not available (e.g., during tests or if it fails to initialize),
 * it returns a mock object with no-op functions to prevent application crashes.
 * @returns {PostHog} The PostHog instance or a mock object.
 */
export const useAnalytics = () => {
  try {
    // usePostHog throws an error if the provider is not in the tree
    const posthog = usePostHog();

    // Wrap in a safety check for production environments
    const capture = (...args: Parameters<typeof posthog.capture>) => {
      if (process.env.NODE_ENV === "production" && posthog) {
        try {
          posthog.capture(...args);
        } catch (e) {
          console.error("PostHog capture error:", e);
        }
      } else if (posthog) {
        // In development, just call it directly to see debug logs
        posthog.capture(...args);
      }
    };

    return {
      ...posthog,
      capture,
    };
  } catch (error) {
    // This can happen in environments where the provider is not available.
    // Return a mock object to prevent crashes.
    console.warn("PostHog context not found. Analytics will be disabled.");
    return {
      capture: () => {},
      identify: () => {},
      reset: () => {},
      // Add other methods as needed, with mock implementations
    };
  }
};