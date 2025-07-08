import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PricingPlan {
  name: string
  price: string
  features: string[]
  cta: string
}

interface PricingTableProps {
  plans: PricingPlan[]
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={cn(
            "p-6 space-y-6",
            plan.name === "Pro" 
              ? "border-2 border-primary shadow-xl scale-105" 
              : "border"
          )}
        >
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <div className="text-4xl font-bold">
              ${plan.price}<span className="text-lg text-muted-foreground">/mo</span>
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
          
          <Button
            className="w-full"
            variant={plan.name === "Pro" ? "default" : "outline"}
          >
            {plan.cta}
          </Button>
        </Card>
      ))}
    </div>
  )
}