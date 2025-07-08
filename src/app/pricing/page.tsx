import { PricingTable } from "@/components/PricingTable";

export default function PricingPage() {
  return (
    <div className="container max-w-4xl py-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that works best for your learning journey. Upgrade or
          downgrade at any time.
        </p>
        <PricingTable />
      </div>
    </div>
  );
}
