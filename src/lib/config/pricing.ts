export const tiers = [
  {
    name: "Free",
    price: "$0",
    features: [
      "Basic journaling",
      "3 AI analyses per month",
      "Community support",
      "Basic flashcards",
    ],
    cta: "Get Started",
    priceId: null, // No price ID for free tier
  },
  {
    name: "Pro",
    price: "$9",
    features: [
      "Unlimited journaling",
      "10 AI analyses per day",
      "Priority support",
      "Advanced flashcards",
      "Progress tracking",
    ],
    cta: "Upgrade to Pro",
    priceId: "price_123", // Replace with actual Stripe price ID
  },
  {
    name: "Expert",
    price: "$29",
    features: [
      "Everything in Pro",
      "Unlimited AI analyses",
      "24/7 premium support",
      "Personalized coaching",
      "Early access to features",
    ],
    cta: "Upgrade to Expert",
    priceId: "price_456", // Replace with actual Stripe price ID
  },
];
