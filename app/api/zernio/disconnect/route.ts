import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
	try {
		const { accountId, platform } = await request.json();

		if (!accountId || !platform) {
			return NextResponse.json(
				{ error: "accountId and platform are required" },
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

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { error } = await supabase
			.from("social_accounts")
			.delete()
			.eq("id", accountId)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error disconnecting account:", error);
			return NextResponse.json(
				{ error: "Failed to disconnect account" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Disconnect error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Failed to disconnect",
			},
			{ status: 500 },
		);
	}
}
