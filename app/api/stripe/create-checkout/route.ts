import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PLANS } from "@/lib/constants";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
	try {
		if (!process.env.STRIPE_SECRET_KEY) {
			return NextResponse.json(
				{ error: "Stripe not configured" },
				{ status: 500 },
			);
		}

		const cookieStore = await cookies();
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					},
				},
			},
		);

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { plan } = await request.json();
		const planConfig = PLANS[plan as string];

		if (!planConfig) {
			return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
		}

		const { data: profile } = await supabase
			.from("profiles")
			.select("stripe_customer_id")
			.eq("id", user.id)
			.single();

		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			payment_method_types: ["card"],
			customer: profile?.stripe_customer_id || undefined,
			customer_email: profile?.stripe_customer_id ? undefined : user.email,
			client_reference_id: user.id,
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: `${planConfig.name} Plan`,
							description: `${planConfig.credits.toLocaleString()} credits per month`,
						},
						unit_amount: planConfig.amount,
						recurring: { interval: "month" },
					},
					quantity: 1,
				},
			],
			metadata: {
				plan,
				user_id: user.id,
				credits: planConfig.credits.toString(),
			},
			subscription_data: {
				metadata: {
					plan,
					user_id: user.id,
					credits: planConfig.credits.toString(),
				},
			},
			success_url: `${request.nextUrl.origin}/dashboard/settings?success=true`,
			cancel_url: `${request.nextUrl.origin}/dashboard/settings?canceled=true`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Stripe checkout error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Checkout failed" },
			{ status: 500 },
		);
	}
}
