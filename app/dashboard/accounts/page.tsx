"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSocialAccounts, type SocialAccount } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
	AlertCircle,
	CheckCircle2,
	Unlink,
	Loader2,
	RefreshCw,
	Check,
	ExternalLink,
	X,
	ArrowRight,
} from "lucide-react";

type PlatformId = (typeof PLATFORMS)[number]["id"];

interface ZernioAccount {
	_id: string;
	platform: string;
	displayName?: string;
	username?: string;
	profilePicture?: string;
	followersCount?: number;
	profileUrl?: string;
	metadata?: {
		profileData?: {
			bio?: string;
			extraData?: {
				followsCount?: number;
				mediaCount?: number;
				accountType?: string;
			};
		};
	};
}

const PLATFORMS = [
	{
		id: "instagram",
		name: "Instagram",
		subtitle: "Connect your Instagram account to start scheduling posts.",
		logo: (
			<svg viewBox="0 0 48 48" className="h-full w-full">
				<rect x="4" y="4" width="40" height="40" rx="10" fill="url(#ig-grad)" />
				<circle
					cx="24"
					cy="24"
					r="10"
					fill="none"
					stroke="#fff"
					strokeWidth="2.5"
				/>
				<circle cx="34" cy="14" r="2.5" fill="#fff" />
				<defs>
					<linearGradient id="ig-grad" x1="4" y1="4" x2="44" y2="44">
						<stop stopColor="#f09433" />
						<stop offset="0.25" stopColor="#e6683c" />
						<stop offset="0.5" stopColor="#dc2743" />
						<stop offset="0.75" stopColor="#cc2366" />
						<stop offset="1" stopColor="#bc1888" />
					</linearGradient>
				</defs>
			</svg>
		),
	},
	{
		id: "tiktok",
		name: "TikTok",
		subtitle: "Connect your TikTok account to start scheduling posts.",
		logo: (
			<svg viewBox="0 0 48 48" className="h-full w-full">
				<rect x="4" y="4" width="40" height="40" rx="10" fill="#111" />
				<path
					d="M32 14h-4v12a4 4 0 1 1-3-3.87V18a8 8 0 1 0 7 7.87V14z"
					fill="#fff"
				/>
				<path
					d="M28 14h4v1.87A8 8 0 0 1 25 22v-4a4 4 0 0 1 3-4z"
					fill="#25f4ee"
				/>
			</svg>
		),
	},
	{
		id: "facebook",
		name: "Facebook",
		subtitle: "Connect your Facebook account to start scheduling posts.",
		logo: (
			<svg viewBox="0 0 48 48" className="h-full w-full">
				<rect x="4" y="4" width="40" height="40" rx="10" fill="#1877f2" />
				<path
					d="M30 14h-4a4 4 0 0 0-4 4v4h-2v4h2v8h4v-8h3l1-4h-4v-2a1 1 0 0 1 1-1h3v-4z"
					fill="#fff"
				/>
			</svg>
		),
	},
	{
		id: "pinterest",
		name: "Pinterest",
		subtitle: "Connect your Pinterest account to start scheduling posts.",
		logo: (
			<svg viewBox="0 0 48 48" className="h-full w-full">
				<rect x="4" y="4" width="40" height="40" rx="10" fill="#e60023" />
				<path
					d="M24 12a12 12 0 0 0-4.8 23.07c-.1-.87-.19-2.22.04-3.17l1.2-5.1s-.3-.6-.3-1.5c0-1.4.82-2.45 1.83-2.45.86 0 1.28.65 1.28 1.42 0 .87-.55 2.16-.84 3.36-.24.95.48 1.81 1.42 1.81 1.7 0 2.85-2.18 2.85-4.77 0-2.23-1.5-3.9-4.23-3.9-3.08 0-5 2.28-5 5.17 0 .94.3 1.6.78 2.12.22.26.25.36.17.65l-.25 1c-.08.32-.34.44-.62.32-1.72-.7-2.53-2.58-2.53-4.7 0-3.48 2.94-7.66 8.77-7.66 4.7 0 7.78 3.4 7.78 7.06 0 4.84-2.7 8.45-6.66 8.45-1.33 0-2.58-.72-3.02-1.54l-.86 3.43c-.27 1.04-.78 2.07-1.26 2.88A12 12 0 1 0 24 12z"
					fill="#fff"
				/>
			</svg>
		),
	},
	{
		id: "twitter",
		name: "X / Twitter",
		subtitle: "Connect your X / Twitter account to start scheduling posts.",
		logo: (
			<svg viewBox="0 0 48 48" className="h-full w-full">
				<rect x="4" y="4" width="40" height="40" rx="10" fill="#000" />
				<path
					d="M14 14l7.55 10.1L14 34h1.7l6.65-7.18L28 34h7.5l-7.97-10.66L34.5 14h-1.7l-6.12 6.61L21.5 14H14zm2.5 1.25h2.66l11.82 15.8h-2.66L16.5 15.25z"
					fill="#fff"
				/>
			</svg>
		),
	},
	{
		id: "youtube",
		name: "YouTube",
		subtitle: "Connect your YouTube account to start scheduling posts.",
		logo: (
			<svg viewBox="0 0 48 48" className="h-full w-full">
				<rect x="4" y="4" width="40" height="40" rx="10" fill="#ff0000" />
				<path
					d="M36 24c0 4.56-.36 5.56-1.48 6.74C33.3 32 29.44 32 24 32s-9.3 0-10.52-1.26C12.36 29.56 12 28.56 12 24s.36-5.56 1.48-6.74C14.7 16 18.56 16 24 16s9.3 0 10.52 1.26C35.64 18.44 36 19.44 36 24z"
					fill="#fff"
				/>
				<path d="M22 20.5l6.5 3.5-6.5 3.5v-7z" fill="#ff0000" />
			</svg>
		),
	},
] as const;

export default function AccountsPage() {
	const { user } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [accounts, setAccounts] = useState<SocialAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [connecting, setConnecting] = useState<PlatformId | null>(null);
	const [disconnecting, setDisconnecting] = useState<string | null>(null);
	const [syncing, setSyncing] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const [connectingPlatform, setConnectingPlatform] = useState<
		(typeof PLATFORMS)[number] | null
	>(null);

	const popupRef = useRef<Window | null>(null);

	const status = searchParams.get("connected");
	const error = searchParams.get("error");

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		getSocialAccounts(user.id).then((data) => {
			if (!cancelled) {
				setAccounts(data);
				setLoading(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [user]);

	useEffect(() => {
		if (!connectingPlatform) return;

		const platformId = connectingPlatform.id;
		const knownIds = new Set(accounts.map((a) => a.zernio_account_id));
		let attempts = 0;
		const maxAttempts = 30;

		const interval = setInterval(async () => {
			attempts++;
			if (attempts > maxAttempts) {
				clearInterval(interval);
				setConnecting(null);
				setConnectingPlatform(null);
				setShowDialog(false);
				return;
			}

			try {
				const res = await fetch("/api/zernio/accounts");
				if (!res.ok) return;
				const data = await res.json();
				const zernioAccounts: ZernioAccount[] = data.accounts || [];
				const newAccount = zernioAccounts.find(
					(acc) => acc.platform === platformId && !knownIds.has(acc._id),
				);

				if (newAccount) {
					clearInterval(interval);
					const saveRes = await fetch("/api/zernio/save-account", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							zernioAccountId: newAccount._id,
							platform: newAccount.platform,
							accountName: newAccount.displayName || null,
							accountImage: newAccount.profilePicture || null,
							username: newAccount.username || null,
							followersCount: newAccount.followersCount ?? null,
							profileUrl: newAccount.profileUrl || null,
							zernioData: newAccount,
						}),
					});

					if (saveRes.ok) {
						const saved = await saveRes.json();
						if (saved.account) {
							setAccounts((prev) => {
								const filtered = prev.filter(
									(a) => a.platform !== saved.account.platform,
								);
								return [saved.account, ...filtered];
							});
						}
					}

					setConnecting(null);
					setConnectingPlatform(null);
					setShowDialog(false);
				}
			} catch {
				// poll error, retry
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [connectingPlatform, accounts]);

	async function handleConnect(platform: (typeof PLATFORMS)[number]) {
		if (!user || connecting) return;
		setConnecting(platform.id);
		setConnectingPlatform(platform);
		setShowDialog(true);

		try {
			const callbackUrl = `${window.location.origin}/api/zernio/callback?platform=${platform.id}&userId=${user.id}`;

			const res = await fetch(
				`/api/zernio/connect?platform=${platform.id}&userId=${user.id}&redirectUri=${encodeURIComponent(callbackUrl)}`,
			);
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to get connect URL");
			}

			const authUrl = data.authUrl || data.auth_url;

			if (!authUrl) {
				throw new Error("No auth URL returned from Zernio");
			}

			popupRef.current = window.open(authUrl, "_blank", "width=600,height=700");
			if (!popupRef.current) {
				setTimeout(() => {
					window.location.href = authUrl;
				}, 0);
			}
		} catch (err) {
			console.error("Connect error:", err);
			alert(err instanceof Error ? err.message : "Failed to connect");
			setConnecting(null);
			setConnectingPlatform(null);
			setShowDialog(false);
		}
	}

	function handleCancelConnect() {
		if (popupRef.current && !popupRef.current.closed) {
			popupRef.current.close();
		}
		setConnecting(null);
		setConnectingPlatform(null);
		setShowDialog(false);
	}

	async function handleDisconnect(account: SocialAccount) {
		if (!user || disconnecting) return;
		setDisconnecting(account.id);

		try {
			const res = await fetch("/api/zernio/disconnect", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accountId: account.id,
					platform: account.platform,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to disconnect");
			}

			setAccounts((prev) => prev.filter((a) => a.id !== account.id));
		} catch (err) {
			console.error("Disconnect error:", err);
			alert(err instanceof Error ? err.message : "Failed to disconnect");
		} finally {
			setDisconnecting(null);
		}
	}

	async function handleSync() {
		setSyncing(true);
		try {
			if (!user) return;
			const data = await getSocialAccounts(user.id);
			setAccounts(data);
			await new Promise((r) => setTimeout(r, 1500));
		} catch (err) {
			console.error("Sync error:", err);
		} finally {
			setSyncing(false);
		}
	}

	const connectedPlatforms = new Set(accounts.map((a) => a.platform));

	const getConnectedAccount = (platform: string) =>
		accounts.find((a) => a.platform === platform);

	const steps = [
		{
			step: 1,
			title: "Choose Platform",
			description:
				"Select the social media platform you want to connect from the options above. We support Instagram, TikTok, Facebook, Pinterest, X/Twitter, and YouTube.",
			color: "bg-blue-500",
		},
		{
			step: 2,
			title: "Authorize Zernio",
			description:
				"Click the Connect button and you'll be redirected to Zernio's secure OAuth flow. Log in to your account and grant the necessary permissions.",
			color: "bg-purple-500",
		},
		{
			step: 3,
			title: "Automate & Scale",
			description:
				"Once connected, your account is ready. Schedule posts, manage content, and publish across all your platforms from one dashboard.",
			color: "bg-green-500",
		},
	];

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="p-8">
			<div className="mb-8 flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold">Social Accounts</h1>
					<p className="mt-2 text-muted-foreground">
						Connect your social media accounts to manage posts and schedule
						content across all platforms
					</p>
				</div>
				<Button
					variant="outline"
					size="default"
					disabled={syncing}
					onClick={handleSync}
					className="shrink-0"
				>
					<RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
					{syncing ? "Syncing..." : "Sync Accounts"}
				</Button>
			</div>

			{(status === "success" || error) && (
				<div
					className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 ${
						status === "success"
							? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
							: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
					}`}
				>
					{status === "success" ? (
						<CheckCircle2 className="h-5 w-5 shrink-0" />
					) : (
						<AlertCircle className="h-5 w-5 shrink-0" />
					)}
					<p className="text-sm">
						{status === "success"
							? "Account connected successfully!"
							: error === "missing_params"
								? "Missing connection parameters"
								: error === "api_not_configured"
									? "Zernio API is not configured. Please set ZERNIO_API_KEY."
									: error === "zernio_fetch_failed"
										? "Failed to fetch account from Zernio."
										: error === "account_not_found"
											? "Could not find the connected account on Zernio."
											: error === "save_failed"
												? "Failed to save account to database."
												: `Connection failed: ${error}`}
					</p>
					<Button
						variant="ghost"
						size="xs"
						className="ml-auto"
						onClick={() => router.replace("/dashboard/accounts")}
					>
						Dismiss
					</Button>
				</div>
			)}

			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{PLATFORMS.map((platform) => {
					const isConnected = connectedPlatforms.has(platform.id);
					const account = getConnectedAccount(platform.id);
					const isConnecting = connecting === platform.id;
					const isDisconnecting = disconnecting === account?.id;

					return (
						<div
							key={platform.id}
							className="group relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
						>
							<div
								className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
									isConnected
										? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{isConnected ? (
									<Check className="h-3 w-3" />
								) : (
									<span className="h-3 w-3 rounded-full border border-current opacity-60" />
								)}
								{isConnected ? "Connected" : "Not Connected"}
							</div>

							<div className="p-6 pb-4">
								<div className="mb-4 h-12 w-12">{platform.logo}</div>

								<h3 className="mb-1.5 text-lg font-semibold">
									{platform.name}
								</h3>

								<p className="text-sm leading-relaxed text-muted-foreground">
									{platform.subtitle}
								</p>
							</div>

							<div className="border-t px-6 py-4">
								{isConnected && account ? (
									<div className="rounded-xl border bg-muted/40 p-4">
										<div className="mb-4 flex items-center gap-3">
											{account.account_image ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={account.account_image}
													alt=""
													className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-border"
												/>
											) : (
												<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium text-muted-foreground ring-2 ring-border">
													{account.account_name?.charAt(0) || "?"}
												</div>
											)}
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold">
													{account.account_name || "Connected Account"}
												</p>
												{account.username && (
													<p className="truncate text-xs text-muted-foreground">
														@{account.username}
													</p>
												)}
											</div>
											{account.followers_count != null && (
												<div className="shrink-0 text-right">
													<p className="text-sm font-bold">
														{account.followers_count.toLocaleString()}
													</p>
													<p className="text-xs text-muted-foreground">
														Followers
													</p>
												</div>
											)}
										</div>

										<div className="mb-3 space-y-2">
											<div className="grid grid-cols-2 gap-2 text-center text-xs">
												<div className="rounded-lg bg-background px-2 py-1.5">
													<span className="block font-semibold text-foreground">
														{platform.name}
													</span>
													<span className="text-muted-foreground">
														Platform
													</span>
												</div>
												<div className="rounded-lg bg-background px-2 py-1.5">
													<span className="block font-semibold text-foreground lowercase">
														{account.username
															? `@${account.username}`
															: account.account_name
																? `@${account.account_name.toLowerCase().replace(/\s+/g, "_")}`
																: "—"}
													</span>
													<span className="text-muted-foreground">
														Username
													</span>
												</div>
											</div>
											{(account.followers_count != null ||
												account.profile_url) && (
												<div className="grid grid-cols-2 gap-2 text-center text-xs">
													{account.followers_count != null && (
														<div className="rounded-lg bg-background px-2 py-1.5">
															<span className="block font-semibold text-foreground">
																{account.followers_count.toLocaleString()}
															</span>
															<span className="text-muted-foreground">
																Followers
															</span>
														</div>
													)}
													{account.profile_url && (
														<div className="rounded-lg bg-background px-2 py-1.5">
															<span className="block truncate font-semibold text-foreground">
																<a
																	href={account.profile_url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="underline underline-offset-2"
																>
																	View Profile
																</a>
															</span>
															<span className="text-muted-foreground">
																Link
															</span>
														</div>
													)}
												</div>
											)}
										</div>

										<Button
											variant="destructive"
											size="sm"
											className="w-full"
											disabled={!!disconnecting}
											onClick={() => handleDisconnect(account)}
										>
											{isDisconnecting ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Unlink className="h-4 w-4" />
											)}
											{isDisconnecting
												? "Disconnecting..."
												: "Disconnect Account"}
										</Button>
									</div>
								) : (
									<Button
										variant="default"
										size="default"
										className="w-full"
										disabled={!!connecting}
										onClick={() => handleConnect(platform)}
									>
										{isConnecting ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"+ Connect Account"
										)}
									</Button>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Connecting Dialog */}
			{showDialog && connectingPlatform && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-2xl border bg-card p-8 shadow-2xl">
						<div className="mb-6 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<div className="h-10 w-10">{connectingPlatform.logo}</div>
							</div>
							<h3 className="text-lg font-semibold">
								Connecting {connectingPlatform.name}
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								A Zernio authorization page has opened in a new tab. Please
								complete the authorization there.
							</p>
						</div>

						<div className="mb-6 space-y-3">
							<div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
								<ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									If no tab opened,{" "}
									<button
										type="button"
										className="font-medium text-primary underline underline-offset-2"
										onClick={async () => {
											try {
												const res = await fetch(
													`/api/zernio/connect?platform=${connectingPlatform.id}&userId=${user?.id}`,
												);
												const data = await res.json();
												const url = data.authUrl || data.auth_url;
												if (url) window.open(url, "_blank");
											} catch {}
										}}
									>
										click here
									</button>
								</span>
							</div>
							<div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
								<Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
								<span className="text-sm text-muted-foreground">
									Waiting for authorization...
								</span>
							</div>
						</div>

						<Button
							variant="outline"
							size="default"
							className="w-full"
							onClick={handleCancelConnect}
						>
							<X className="h-4 w-4" />
							Cancel
						</Button>
					</div>
				</div>
			)}

			<div className="mt-14">
				<div className="rounded-2xl border bg-card p-8 md:p-10">
					<div className="mb-8 text-center">
						<h2 className="text-2xl font-bold">How it works</h2>
						<p className="mt-2 text-muted-foreground">
							Get started in three simple steps
						</p>
					</div>

					<div className="relative grid gap-8 md:grid-cols-3">
						<div className="absolute left-1/2 top-12 hidden h-0.5 w-2/3 -translate-x-1/2 md:block" />
						{steps.map((step, index) => (
							<div key={step.step} className="relative text-center">
								<div className="mb-5 flex justify-center">
									<div
										className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${step.color}`}
									>
										{step.step}
									</div>
								</div>
								<h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>
								{index < steps.length - 1 && (
									<div className="mt-4 flex justify-center md:hidden">
										<ArrowRight className="h-5 w-5 rotate-90 text-muted-foreground/40" />
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
