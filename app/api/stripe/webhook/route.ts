import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { PLAN_CREDITS } from "@/lib/constants";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin configuration");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 },
      );
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = getAdminClient();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.client_reference_id || session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const credits = parseInt(session.metadata?.credits || "0");

      if (!userId || !plan) {
        return NextResponse.json(
          { error: "Missing user or plan" },
          { status: 400 },
        );
      }

      const subscriptionId = session.subscription as string;
      let periodEnd: string;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();
      } else {
        periodEnd = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          plan,
          subscription_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update profile subscription:", updateError);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 },
        );
      }

      const { error: creditsError } = await supabase.rpc("add_credits", {
        user_uuid: userId,
        amount: credits,
        description: `Subscription: ${plan} plan`,
      });

      if (creditsError) {
        console.error("Failed to add subscription credits:", creditsError);
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = (invoice as any).subscription as string | null;

      if (!subscriptionId) {
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const plan = subscription.metadata?.plan;
      const userId = subscription.metadata?.user_id;

      if (!userId || !plan) {
        return NextResponse.json({ received: true });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();

      await supabase
        .from("profiles")
        .update({
          subscription_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      const monthlyCredits = PLAN_CREDITS[plan] || 0;
      if (monthlyCredits > 0) {
        const { error: creditsError } = await supabase.rpc("add_credits", {
          user_uuid: userId,
          amount: monthlyCredits,
          description: `Monthly credits: ${plan} plan`,
        });

        if (creditsError) {
          console.error("Failed to add monthly credits:", creditsError);
        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 },
    );
  }
}
