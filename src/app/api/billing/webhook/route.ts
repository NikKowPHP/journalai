import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/services/stripe.service";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.customer || !session.subscription) {
        console.warn("Missing customer or subscription in checkout session");
        break;
      }

      try {
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        
        let tier = "FREE";
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          tier = "PRO";
        }
        
        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: "active",
          },
        });
      } catch (err) {
        console.error("Error handling checkout.session.completed:", err);
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      if (!subscription.customer) {
        console.warn("Missing customer in subscription update");
        break;
      }

      try {
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        
        let tier = "FREE";
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          tier = "PRO";
        }
        
        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: subscription.status,
          },
        });
      } catch (err) {
        console.error("Error handling customer.subscription.updated:", err);
      }
      break;
    }
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}