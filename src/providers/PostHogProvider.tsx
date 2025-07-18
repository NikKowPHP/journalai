
// src/providers/PostHogProvider.tsx
"use client";

import React, { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";
import { useAuthStore } from "@/lib/stores/auth.store";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // We're handling page views manually if needed
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
      });
    } else {
      posthog.reset();
    }
  }, [user]);

  return <Provider client={posthog}>{children}</Provider>;
}