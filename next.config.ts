import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const pwaEnabled = process.env.NODE_ENV === "production";

const withPWA = withPWAInit({
  dest: "public",
  disable: !pwaEnabled,
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // API calls (Network first)
    {
      urlPattern: /\/api\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Pages and assets (Stale While Revalidate)
    {
      urlPattern: ({ request, url }: { request: Request; url: URL }) =>
        request.mode === "navigate" ||
        ["style", "script", "image", "font"].includes(request.destination),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages-assets-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This will allow all hostnames. Use with caution.
      },
    ],
  },
};

export default withPWA(nextConfig as any);