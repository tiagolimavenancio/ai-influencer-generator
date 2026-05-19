"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
	getProfile,
	SUBSCRIPTION_PLANS,
	type SubscriptionPlanId,
} from "@/lib/db";
import type { Profile } from "@/types/database";
import {
	CheckCircle,
	CreditCard,
	Loader2,
	Zap,
	Sparkles,
	Crown,
	Check,
} from "lucide-react";

export default function SettingsPage() {
	const { user } = useAuth();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [checkoutLoading, setCheckoutLoading] =
		useState<SubscriptionPlanId | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const loadProfile = useCallback(async () => {
		if (!user) return;
		const p = await getProfile(user.id);
		setProfile(p);
		setLoading(false);
	}, [user]);

	useEffect(() => {
		loadProfile();
	}, [loadProfile]);

	useEffect(() => {
		if (!user) return;
		const params = new URLSearchParams(window.location.search);
		if (params.get("success") === "true") {
			setSuccessMessage("Payment successful! Your credits have been added.");
			const url = new URL(window.location.pathname, window.location.origin);
			window.history.replaceState({}, "", url.toString());
			// Wait for webhook to process, then refresh profile data
			const retry = async () => {
				for (let i = 0; i < 10; i++) {
					await new Promise((r) => setTimeout(r, 2000));
					const p = await getProfile(user.id);
					if (p && p.plan !== "free") {
						setProfile(p);
						return;
					}
				}
				// Final fetch even if plan didn't update
				const p = await getProfile(user.id);
				setProfile(p);
			};
			retry();
		}
	}, [user]);

	async function handleSubscribe(planId: SubscriptionPlanId) {
		if (planId === "free") return;
		setCheckoutLoading(planId);
		try {
			const res = await fetch("/api/stripe/create-checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ plan: planId }),
			});
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				alert(data.error || "Failed to create checkout session");
			}
		} catch {
			alert("Something went wrong. Please try again.");
		}
		setCheckoutLoading(null);
	}

	const currentPlan = profile?.plan || "free";

	if (loading) {
		return (
			<div className="flex min-h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
				<p className="mt-2 text-muted-foreground">
					Manage your subscription and payment
				</p>
			</div>

			{successMessage && (
				<div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
					<CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
					{successMessage}
				</div>
			)}

			<div className="mb-8 rounded-xl border border-border bg-card p-6">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold">Credit Balance</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Available credits for generating posts and models
						</p>
					</div>
					<div className="flex items-center gap-3 rounded-lg bg-muted/50 px-6 py-4">
						<Zap className="h-6 w-6 text-primary" />
						<div>
							<p className="text-2xl font-bold">{profile?.credits ?? 0}</p>
							<p className="text-xs text-muted-foreground">Credits</p>
						</div>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-3">
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Current Plan
						</p>
						<p className="mt-1 text-base font-semibold capitalize">
							{currentPlan === "free"
								? "Free"
								: `${SUBSCRIPTION_PLANS[currentPlan as SubscriptionPlanId]?.name} Plan`}
						</p>
					</div>
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Status
						</p>
						<p className="mt-1 text-base font-semibold capitalize">
							{profile?.plan === "free" ? "Active" : "Active"}
						</p>
					</div>
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							AI Model Creation
						</p>
						<p className="mt-1 text-base font-semibold">50 credits</p>
					</div>
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Post Creation
						</p>
						<p className="mt-1 text-base font-semibold">20 credits</p>
					</div>
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Connected Accounts
						</p>
						<p className="mt-1 text-base font-semibold">
							{currentPlan === "free"
								? "1 max"
								: currentPlan === "standard"
									? "Up to 5"
									: "Unlimited"}
						</p>
					</div>
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Auto-Scheduling
						</p>
						<p className="mt-1 text-base font-semibold">
							{currentPlan === "free" ? "Up to 5 posts" : "Unlimited"}
						</p>
					</div>
				</div>
			</div>

			<h2 className="mb-6 text-2xl font-bold">Choose Your Plan</h2>
			<p className="mb-8 text-sm text-muted-foreground">
				Subscribe to a plan and get credits added to your account every month
			</p>

			<div className="grid gap-6 lg:grid-cols-3">
				{Object.values(SUBSCRIPTION_PLANS).map((plan) => {
					const isCurrentPlan = currentPlan === plan.id;
					const isFree = plan.id === "free";
					const Icon =
						plan.id === "free"
							? Sparkles
							: plan.id === "standard"
								? Zap
								: Crown;

					return (
						<div
							key={plan.id}
							className={`relative flex flex-col rounded-xl border-2 p-6 ${
								isCurrentPlan
									? "border-primary bg-primary/5"
									: "border-border bg-card"
							}`}
						>
							{isCurrentPlan && !isFree && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
									Current Plan
								</div>
							)}

							<div className="mb-4 flex items-center gap-3">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-lg ${
										plan.id === "free"
											? "bg-muted text-muted-foreground"
											: plan.id === "standard"
												? "bg-blue-100 text-blue-600"
												: "bg-amber-100 text-amber-600"
									}`}
								>
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">{plan.name}</h3>
									<p className="text-xs text-muted-foreground">
										{plan.description}
									</p>
								</div>
							</div>

							<div className="mb-6">
								{isFree ? (
									<p className="text-3xl font-bold">Free</p>
								) : (
									<div className="flex items-baseline gap-1">
										<span className="text-3xl font-bold">${plan.price}</span>
										<span className="text-sm text-muted-foreground">
											/month
										</span>
									</div>
								)}
							</div>

							<div className="mb-6 space-y-3">
								<div className="flex items-start gap-2">
									<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<span className="text-sm text-muted-foreground">
										<strong>{plan.features.monthlyCredits}</strong>
									</span>
								</div>
								<div className="flex items-start gap-2">
									<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<span className="text-sm text-muted-foreground">
										<strong>{plan.features.aiCreationCost}</strong> per model
									</span>
								</div>
								<div className="flex items-start gap-2">
									<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<span className="text-sm text-muted-foreground">
										<strong>{plan.features.postCreationCost}</strong> per post
									</span>
								</div>
								<div className="flex items-start gap-2">
									<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<span className="text-sm text-muted-foreground">
										<strong>{plan.features.connectedAccounts}</strong>
									</span>
								</div>
								<div className="flex items-start gap-2">
									<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<span className="text-sm text-muted-foreground">
										<strong>{plan.features.autoPostScheduling}</strong>
									</span>
								</div>
							</div>

							<button
								onClick={() => handleSubscribe(plan.id as SubscriptionPlanId)}
								disabled={isCurrentPlan || checkoutLoading !== null}
								className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
									isCurrentPlan
										? "cursor-default border border-border bg-muted text-muted-foreground"
										: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
								}`}
							>
								{checkoutLoading === plan.id ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Loading...
									</>
								) : isCurrentPlan ? (
									<>
										<CheckCircle className="h-4 w-4" />
										Current Plan
									</>
								) : (
									<>
										<CreditCard className="h-4 w-4" />
										{isFree ? "Get Started" : `Subscribe - $${plan.price}/mo`}
									</>
								)}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
