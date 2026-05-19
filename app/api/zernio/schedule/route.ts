import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ZERNIO_BASE } from "@/lib/constants";

export async function POST(request: NextRequest) {
	try {
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

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { caption, imageUrl, scheduledAt, platform, timezone, publishNow } =
			await request.json();

		if (!platform || !imageUrl) {
			return NextResponse.json(
				{ error: "platform and imageUrl are required" },
				{ status: 400 },
			);
		}

		// Look up the user's connected social account for this platform
		const { data: socialAccount } = await supabase
			.from("social_accounts")
			.select("zernio_account_id")
			.eq("user_id", user.id)
			.eq("platform", platform)
			.single();

		if (!socialAccount?.zernio_account_id) {
			return NextResponse.json(
				{ error: `No connected account found for platform: ${platform}` },
				{ status: 400 },
			);
		}

		const body: Record<string, unknown> = {
			content: caption || "",
			mediaItems: [{ url: imageUrl, type: "image" }],
			platforms: [
				{ platform, accountId: socialAccount.zernio_account_id },
			],
		};

		if (publishNow) {
			body.publishNow = true;
		} else if (scheduledAt) {
			body.scheduledFor = scheduledAt;
			body.timezone = timezone || "UTC";
		} else {
			return NextResponse.json(
				{ error: "Either scheduledAt or publishNow must be provided" },
				{ status: 400 },
			);
		}

		const response = await fetch(`${ZERNIO_BASE}/posts`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Zernio schedule error:", errorText);
			return NextResponse.json(
				{ error: `Zernio API error: ${errorText}` },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json({ success: true, zernioPost: data });
	} catch (error) {
		console.error("Zernio schedule error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to schedule post",
			},
			{ status: 500 },
		);
	}
}
