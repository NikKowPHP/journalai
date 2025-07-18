
import axios from "axios";
import type { OnboardingData, ProfileUpdateData } from "@/lib/types";

export const apiClient = {
  profile: {
    get: async () => {
      const { data } = await axios.get("/api/user/profile");
      return data;
    },
    update: async (profileData: ProfileUpdateData) => {
      const { data } = await axios.put("/api/user/profile", profileData);
      return data;
    },
  },
  analytics: {
    get: async (params: { targetLanguage: string }) => {
      const { data } = await axios.get("/api/analytics", { params });
      return data;
    },
  },
  journal: {
    getAll: async (params: { targetLanguage: string }) => {
      const { data } = await axios.get("/api/journal", { params });
      return data;
    },
    getById: async (id: string) => {
      const { data } = await axios.get(`/api/journal/${id}`);
      return data;
    },
    create: async (payload: {
      content: string;
      topicTitle?: string;
      targetLanguage: string;
    }) => {
      const { data } = await axios.post("/api/journal", payload);
      return data;
    },
    retryAnalysis: async (id: string) => {
      const { data } = await axios.post(`/api/journal/${id}/retry-analysis`);
      return data;
    },
  },
  analyze: {
    start: async (journalId: string) => {
      const { data } = await axios.post("/api/analyze", { journalId });
      return data;
    },
  },
  srs: {
    getDeck: async (params: { targetLanguage: string, includeAll?: boolean }) => {
      const { data } = await axios.get("/api/srs/deck", { params });
      return data;
    },
    createFromMistake: async (mistakeId: string) => {
      const { data } = await axios.post("/api/srs/create-from-mistake", {
        mistakeId,
      });
      return data;
    },
    review: async (payload: { srsItemId: string; quality: number }) => {
      const { data } = await axios.post("/api/srs/review", payload);
      return data;
    },
    createFromTranslation: async (payload: {
      frontContent: string;
      backContent: string;
      targetLanguage: string;
      explanation?: string;
    }) => {
      const { data } = await axios.post(
        "/api/srs/create-from-translation",
        payload,
      );
      return data;
    },
  },
  user: {
    generateTopics: async (params: { targetLanguage: string }) => {
      const { data } = await axios.get("/api/user/generate-topics", {
        params,
      });
      return data;
    },
    getSuggestedTopics: async (params: { targetLanguage: string }) => {
      const { data } = await axios.get("/api/user/suggested-topics", {
        params,
      });
      return data;
    },
    delete: async () => {
      const { data } = await axios.delete("/api/user");
      return data;
    },
    onboard: async (onboardingData: OnboardingData) => {
      const { data } = await axios.post("/api/user/onboard", onboardingData);
      return data;
    },
    completeOnboarding: async () => {
      const { data } = await axios.post("/api/user/complete-onboarding");
      return data;
    },
  },
  admin: {
    getUsers: async (params: {
      search: string;
      page: number;
      limit: number;
    }) => {
      const { data } = await axios.get("/api/admin/users", { params });
      return data;
    },
    updateSubscription: async (
      userId: string,
      payload: { subscriptionTier: string; subscriptionStatus?: string },
    ) => {
      const { data } = await axios.put(
        `/api/admin/users/${userId}/subscription`,
        payload,
      );
      return data;
    },
    getSettings: async () => {
      const { data } = await axios.get("/api/admin/settings");
      return data;
    },
    updateSetting: async (payload: { key: string; value: any }) => {
      const { data } = await axios.put("/api/admin/settings", payload);
      return data;
    },
  },
  billing: {
    createCheckoutSession: async (priceId: string) => {
      const { data } = await axios.post("/api/billing/checkout", { priceId });
      return data;
    },
    createPortalSession: async () => {
      const { data } = await axios.post("/api/billing/portal");
      return data;
    },
  },
  ai: {
    autocomplete: async (payload: { text: string }) => {
      const { data } = await axios.post("/api/ai/autocomplete", payload);
      return data;
    },
    getStuckSuggestions: async (payload: {
      topic: string;
      currentText: string;
      targetLanguage: string;
    }) => {
      const { data } = await axios.post("/api/ai/stuck-helper", payload);
      return data;
    },
     translate: async (payload: {
      text: string;
      sourceLanguage: string;
      targetLanguage: string;
    }) => {
      const { data } = await axios.post("/api/ai/translate", payload);
      return data;
    },
    translateAndBreakdown: async (payload: {
      text: string;
      sourceLanguage: string;
      targetLanguage: string;
    }) => {
      const { data } = await axios.post(
        "/api/ai/translate-breakdown",
        payload,
      );
      return data;
    },
  },
};