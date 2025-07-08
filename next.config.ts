import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  aliases: {
    "@components": "./src/components",
    "@utils": "./src/utils",
    "@hooks": "./src/hooks",
    "@styles": "./src/styles",
    "@lib": "./src/lib",
    "@types": "./src/types",
    "@context": "./src/context",
    "@pages": "./src/pages",
    "@services": "./src/services",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This will allow all hostnames. Use with caution.
      },
    ],
  },
};

export default nextConfig;
