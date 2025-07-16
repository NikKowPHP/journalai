"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useCreateCheckoutSession } from "@/lib/hooks/data";
import { tiers } from "@/lib/config/pricing";

export function PricingTable() {
  const router = useRouter();
  const checkoutMutation = useCreateCheckoutSession();

  const handleCheckout = (priceId: string) => {
    checkoutMutation.mutate(priceId, {
      onSuccess: (response) => {
        if (response.url) {
          window.location.href = response.url;
        }
      },
    });
  };

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
          <Button
            className="w-full"
            onClick={() => {
              if (tier.priceId) {
                handleCheckout(tier.priceId);
              } else {
                router.push("/signup");
              }
            }}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? "Processing..." : tier.cta}
          </Button>
        </Card>
      ))}
    </div>
  );
}
