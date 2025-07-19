
import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

// Read from test specific .env file.
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

// Use a distinct port for E2E tests to avoid conflicts with local development
const PORT = process.env.PORT || 3001;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.DATABASE_URL!,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      APP_ENCRYPTION_KEY: process.env.APP_ENCRYPTION_KEY!,
    },
  },

  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [
    // Setup project
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // Main test projects
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: "e2e/onboarding.spec.ts", // Onboarding runs with a fresh user
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: "e2e/onboarding.spec.ts",
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: "e2e/onboarding.spec.ts",
    },

    // Onboarding test project (runs without saved auth state)
    {
      name: "onboarding-chromium",
      testMatch: "e2e/onboarding.spec.ts",
      use: { ...devices["Desktop Chrome"] },
      // No dependencies, as it creates its own user
    },
  ],
});