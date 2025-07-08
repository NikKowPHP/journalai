import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PRICING_PLANS = [
  {
    name: "Free",
    price: "0",
    features: [
      "Basic writing analysis",
      "5 journal entries/month",
      "Community support"
    ],
    cta: "Get Started"
  },
  {
    name: "Pro",
    price: "15",
    features: [
      "Advanced writing analysis",
      "Unlimited journal entries",
      "Priority support",
      "Weekly progress reports"
    ],
    cta: "Upgrade to Pro"
  },
  {
    name: "Expert",
    price: "30",
    features: [
      "All Pro features",
      "1-on-1 coaching session",
      "Custom learning plan",
      "24/7 premium support"
    ],
    cta: "Contact Sales"
  }
]

export function PricingTable() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PRICING_PLANS.map((plan) => (
        <Card key={plan.name} className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="text-3xl font-semibold">
              ${plan.price}<span className="text-sm text-muted-foreground">/month</span>
            </div>
          </div>
          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <span className="mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full">
            {plan.cta}
          </Button>
        </Card>
      ))}
    </div>
  )
}