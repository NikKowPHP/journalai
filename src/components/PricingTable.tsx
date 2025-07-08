import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Displays a grid of pricing plans with features and call-to-action buttons.
 * @param {object} props - The component props.
 * @param {Array} props.plans - Array of pricing plan objects containing:
 * @param {string} props.plans[].name - The name of the pricing tier.
 * @param {string} props.plans[].price - The monthly price (as string to allow formatting).
 * @param {string[]} props.plans[].features - Array of features included in this tier.
 * @param {string} props.plans[].cta - Call-to-action text for the tier's button.
 * @returns {React.ReactElement} A responsive grid of pricing cards.
 */
interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  cta: string;
}

interface PricingTableProps {
  plans: PricingPlan[];
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
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