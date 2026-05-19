import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ZERNIO_BASE } from "@/lib/constants";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const platform = searchParams.get("platform");
		const userId = searchParams.get("userId");

		if (!platform || !userId) {
			return NextResponse.redirect(
				new URL("/dashboard/accounts?error=missing_params", request.url),
			);
		}

		const apiKey = process.env.ZERNIO_API_KEY;
		if (!apiKey) {
			return NextResponse.redirect(
				new URL("/dashboard/accounts?error=api_not_configured", request.url),
			);
		}

		const response = await fetch(`${ZERNIO_BASE}/accounts`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			return NextResponse.redirect(
				new URL("/dashboard/accounts?error=zernio_fetch_failed", request.url),
			);
		}

		const { accounts } = await response.json();

		const connectedAccount = accounts.find(
			(acc: { platform: string }) => acc.platform === platform,
		);

		if (!connectedAccount) {
			return NextResponse.redirect(
				new URL("/dashboard/accounts?error=account_not_found", request.url),
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

		const { error } = await supabase.from("social_accounts").upsert(
			{
				user_id: userId,
				platform,
				zernio_account_id: connectedAccount._id,
				account_name: connectedAccount.displayName || null,
				account_image: connectedAccount.profilePicture || null,
				username: connectedAccount.username || null,
				followers_count: connectedAccount.followersCount ?? null,
				profile_url: connectedAccount.profileUrl || null,
				zernio_data: connectedAccount,
			},
			{ onConflict: "user_id, platform" },
		);

		if (error) {
			console.error("Error saving social account:", error);
			return NextResponse.redirect(
				new URL("/dashboard/accounts?error=save_failed", request.url),
			);
		}

		return NextResponse.redirect(
			new URL("/dashboard/accounts?connected=success", request.url),
		);
	} catch (error) {
		console.error("Zernio callback error:", error);
		return NextResponse.redirect(
			new URL("/dashboard/accounts?error=callback_failed", request.url),
		);
	}
}
