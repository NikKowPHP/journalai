"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PricingTable() {
  const tiers = [
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
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {tiers.map((tier) => (
        <Card key={tier.name} className="p-6 flex flex-col gap-4">
          <h3 className="text-2xl font-bold">{tier.name}</h3>
          <p className="text-4xl font-bold">{tier.price}</p>
          <ul className="flex-1 space-y-2">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <span className="ml-2">{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full">{tier.cta}</Button>
        </Card>
      ))}
    </div>
  );
}
