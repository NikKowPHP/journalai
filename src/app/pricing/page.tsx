import { PricingTable } from "@/components/PricingTable"

export default function PricingPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that works best for your learning journey
        </p>
      </div>
      <PricingTable />
    </div>
  )
}