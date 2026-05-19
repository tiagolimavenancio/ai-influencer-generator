import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ZERNIO_BASE } from "@/lib/constants";

async function createProfile(apiKey: string) {
	const res = await fetch(`${ZERNIO_BASE}/profiles`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: "AI Influencer Generator",
			description: "Auto-created profile for AI Influencer Generator",
		}),
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(`Failed to create Zernio profile: ${error}`);
	}

	const data = await res.json();
	return data.profile._id as string;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const platform = searchParams.get("platform");
		const userId = searchParams.get("userId");
		const redirectUri = searchParams.get("redirectUri");

		if (!platform || !userId) {
			return NextResponse.json(
				{ error: "platform and userId are required" },
				{ status: 400 },
			);
		}

		const apiKey = process.env.ZERNIO_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "ZERNIO_API_KEY not configured" },
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

		const { data: profile } = await supabase
			.from("profiles")
			.select("zernio_profile_id")
			.eq("id", userId)
			.single();

		let zernioProfileId = profile?.zernio_profile_id || null;

		if (!zernioProfileId) {
			zernioProfileId = await createProfile(apiKey);

			const { error: updateError } = await supabase
				.from("profiles")
				.update({ zernio_profile_id: zernioProfileId })
				.eq("id", userId);

			if (updateError) {
				console.error("Failed to save Zernio profile ID:", updateError);
			}
		}

		let connectUrl = `${ZERNIO_BASE}/connect/${platform}?profileId=${zernioProfileId}`;
		if (redirectUri) {
			connectUrl += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
		}

		const response = await fetch(connectUrl, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			return NextResponse.json(
				{ error: `Zernio API error: ${errorText}` },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Zernio connect error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to get connect URL",
			},
			{ status: 500 },
		);
	}
}
