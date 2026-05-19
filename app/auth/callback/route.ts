import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");

	if (code) {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			console.error("Auth callback error:", error);
			return NextResponse.redirect(
				`${origin}/auth/sign-in?error=${encodeURIComponent(error.message)}`,
			);
		}

		if (user) {
			await createUserProfile(supabase, user);
		}

		return NextResponse.redirect(`${origin}/dashboard`);
	}

	return NextResponse.redirect(
		`${origin}/auth/sign-in?error=auth_callback_error`,
	);
}

async function createUserProfile(
	supabase: Awaited<ReturnType<typeof createClient>>,
	user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
) {
	const { data: existingProfile, error: checkError } = await supabase
		.from("profiles")
		.select("id")
		.eq("id", user.id)
		.maybeSingle();

	if (checkError) {
		console.error("Error checking existing profile:", checkError);
	}

	if (!existingProfile) {
		const fullName =
			(user.user_metadata?.full_name as string) ||
			(user.user_metadata?.name as string) ||
			"";
		const avatarUrl = (user.user_metadata?.avatar_url as string) || "";

		const { error: insertError } = await supabase.from("profiles").insert({
			id: user.id,
			email: user.email || "",
			full_name: fullName,
			avatar_url: avatarUrl,
		});

		if (insertError) {
			console.error("Error creating profile:", insertError);
		} else {
			console.log("Profile created for user:", user.id);
		}
	}
}
