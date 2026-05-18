import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
	try {
		const { zernioAccountId, platform, accountName, accountImage, username, followersCount, profileUrl, zernioData } = await request.json();

		if (!zernioAccountId || !platform) {
			return NextResponse.json(
				{ error: "zernioAccountId and platform are required" },
				{ status: 400 },
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

		const { data, error } = await supabase
			.from("social_accounts")
			.upsert(
				{
					user_id: user.id,
					platform,
					zernio_account_id: zernioAccountId,
					account_name: accountName || null,
					account_image: accountImage || null,
					username: username || null,
					followers_count: followersCount ?? null,
					profile_url: profileUrl || null,
					zernio_data: zernioData || null,
				},
				{ onConflict: "user_id, platform" },
			)
			.select()
			.single();

		if (error) {
			console.error("Error saving social account:", error);
			return NextResponse.json(
				{ error: "Failed to save account" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, account: data });
	} catch (error) {
		console.error("Save account error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to save account" },
			{ status: 500 },
		);
	}
}
