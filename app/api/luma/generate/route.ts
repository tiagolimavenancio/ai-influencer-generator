import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { prompt } = await request.json();

		if (!prompt) {
			return NextResponse.json(
				{ error: "Prompt is required" },
				{ status: 400 },
			);
		}

		const apiKey = process.env.NEXT_PUBLIC_LUMA_AGENTS_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "LUMA_AGENTS_API_KEY not configured" },
				{ status: 500 },
			);
		}

		const submitResponse = await fetch(
			"https://agents.lumalabs.ai/v1/generations",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					aspect_ratio: "16:9",
				}),
			},
		);

		if (!submitResponse.ok) {
			const error = await submitResponse.text();
			return NextResponse.json(
				{ error: `Failed to submit: ${error}` },
				{ status: submitResponse.status },
			);
		}

		const { id } = await submitResponse.json();

		const maxAttempts = 60;
		const pollInterval = 2000;
		let attempts = 0;
		let pollResponse;

		while (attempts < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, pollInterval));

			pollResponse = await fetch(
				`https://agents.lumalabs.ai/v1/generations/${id}`,
				{
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				},
			);

			if (!pollResponse.ok) {
				const error = await pollResponse.text();
				return NextResponse.json(
					{ error: `Polling failed: ${error}` },
					{ status: pollResponse.status },
				);
			}

			const data = await pollResponse.json();

			if (data.state === "completed") {
				return NextResponse.json({ imageUrl: data.output[0].url });
			} else if (data.state === "failed") {
				return NextResponse.json(
					{ error: `Generation failed: ${data.failure_reason}` },
					{ status: 500 },
				);
			}

			attempts++;
		}

		return NextResponse.json(
			{ error: "Generation timed out" },
			{ status: 504 },
		);
	} catch (error) {
		console.error("Luma generation error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Generation failed",
			},
			{ status: 500 },
		);
	}
}
