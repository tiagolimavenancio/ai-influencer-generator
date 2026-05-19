import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ZERNIO_BASE } from "@/lib/constants";

export async function GET() {
	try {
		const apiKey = process.env.ZERNIO_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "ZERNIO_API_KEY not configured" },
				{ status: 500 },
			);
		}

		const response = await fetch(`${ZERNIO_BASE}/accounts`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			const error = await response.text();
			return NextResponse.json(
				{ error: `Zernio API error: ${error}` },
				{ status: response.status },
			);
		}

		const data = await response.json();
		const zernioAccounts = data.accounts || [];

		// Verify and sync with social_accounts in Supabase
		try {
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
			if (user) {
				const { data: existingAccounts } = await supabase
					.from("social_accounts")
					.select("*")
					.eq("user_id", user.id);

				if (existingAccounts) {
					for (const zernioAcc of zernioAccounts) {
						const existing = existingAccounts.find(
							(a: { platform: string }) => a.platform === zernioAcc.platform,
						);

						if (existing) {
							const updates: Record<string, unknown> = {};

							if (!existing.account_name && zernioAcc.displayName) {
								updates.account_name = zernioAcc.displayName;
							}
							if (!existing.account_image && zernioAcc.profilePicture) {
								updates.account_image = zernioAcc.profilePicture;
							}
							if (!existing.username && zernioAcc.username) {
								updates.username = zernioAcc.username;
							}
							if (
								!existing.followers_count &&
								zernioAcc.followersCount != null
							) {
								updates.followers_count = zernioAcc.followersCount;
							}
							if (!existing.profile_url && zernioAcc.profileUrl) {
								updates.profile_url = zernioAcc.profileUrl;
							}
							if (!existing.zernio_data) {
								updates.zernio_data = zernioAcc;
							}

							if (Object.keys(updates).length > 0) {
								await supabase
									.from("social_accounts")
									.update(updates)
									.eq("id", existing.id);
							}
						}
					}
				}
			}
		} catch {
			// Non-critical: sync is best-effort
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Zernio list accounts error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to list accounts",
			},
			{ status: 500 },
		);
	}
}
