import { PricingTable } from "@/components/PricingTable"

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

export default function PricingPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Select the plan that works best for your learning journey
        </p>
      </div>
      <div className="p-6 bg-gradient-to-b from-background to-muted/10 rounded-lg">
        <PricingTable plans={PRICING_PLANS} />
      </div>
    </div>
  )
}