import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
	try {
		const { userId, amount } = await request.json();

		if (!userId || !amount || typeof amount !== "number") {
			return NextResponse.json(
				{ error: "Missing or invalid required fields" },
				{ status: 400 },
			);
		}

		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
		const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

		if (!serviceRoleKey) {
			return NextResponse.json(
				{ error: "Service role key not configured" },
				{ status: 500 },
			);
		}

		const supabase = createClient(supabaseUrl, serviceRoleKey, {
			auth: { persistSession: false },
		});

		const { data: remainingCredits, error } = await supabase.rpc(
			"deduct_credits",
			{
				user_uuid: userId,
				amount,
			},
		);

		if (error) {
			const message = error.message.toLowerCase();
			if (message.includes("insufficient credits")) {
				return NextResponse.json(
					{ error: "Insufficient credits" },
					{ status: 400 },
				);
			}
			console.error("Credits deduction error:", error);
			return NextResponse.json(
				{ error: "Failed to deduct credits" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			remainingCredits,
		});
	} catch (error) {
		console.error("Deduct credits error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
