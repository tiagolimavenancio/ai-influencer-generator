import { createBrowserClient } from "@supabase/ssr";
import type {
	Model,
	Post,
	Profile,
	CreditTransaction,
	ModelFormData,
	SocialAccount,
} from "@/types/database";

export type {
	Model,
	Post,
	Profile,
	CreditTransaction,
	ModelFormData,
	SocialAccount,
};

function getClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set",
		);
	}
	return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export async function getProfile(userId: string): Promise<Profile | null> {
	const { data, error } = await getClient()
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) {
		console.error("Error fetching profile:", error);
		return null;
	}
	return data;
}

export async function updateCredits(
	userId: string,
	credits: number,
): Promise<Profile | null> {
	const { data, error } = await getClient()
		.from("profiles")
		.update({ credits, updated_at: new Date().toISOString() })
		.eq("id", userId)
		.select()
		.single();

	if (error) {
		console.error("Error updating credits:", error);
		return null;
	}
	return data;
}

export async function getModels(userId: string): Promise<Model[]> {
	const { data, error } = await getClient()
		.from("models")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching models:", error);
		return [];
	}
	return data || [];
}

export async function getModel(modelId: string): Promise<Model | null> {
	const { data, error } = await getClient()
		.from("models")
		.select("*")
		.eq("id", modelId)
		.single();

	if (error) {
		console.error("Error fetching model:", error);
		return null;
	}
	return data;
}

export async function createModel(
	userId: string,
	formData: ModelFormData,
	portraitUrl: string,
	fullBodyUrl: string,
	prompt: string,
): Promise<Model | null> {
	const { data, error } = await getClient()
		.from("models")
		.insert({
			user_id: userId,
			name: formData.name,
			gender: formData.gender,
			body_type: formData.bodyType,
			skin_tone: formData.skinTone,
			age_range: formData.ageRange,
			hair_style: formData.hairStyle,
			hair_color: formData.hairColor,
			eye_color: formData.eyeColor,
			vibe: formData.vibe,
			portrait_url: portraitUrl,
			full_body_url: fullBodyUrl,
			prompt,
			credits_spent: 50,
		})
		.select()
		.single();

	if (error) {
		console.error(
			"Error creating model:",
			error.message,
			error.details,
			error.hint,
		);
		return null;
	}
	return data;
}

export async function deleteModel(modelId: string): Promise<boolean> {
	const { error } = await getClient().from("models").delete().eq("id", modelId);
	if (error) {
		console.error("Error deleting model:", error);
		return false;
	}
	return true;
}

export async function getPosts(userId: string): Promise<Post[]> {
	const { data, error } = await getClient()
		.from("posts")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching posts:", error);
		return [];
	}
	return data || [];
}

export async function getPost(postId: string): Promise<Post | null> {
	const { data, error } = await getClient()
		.from("posts")
		.select("*")
		.eq("id", postId)
		.single();

	if (error) {
		console.error("Error fetching post:", error);
		return null;
	}
	return data;
}

export async function createPost(
	userId: string,
	modelId: string | null,
	caption: string,
	imageUrl: string | null,
	platform: string,
	scheduledAt?: string,
	status?: string,
): Promise<Post | null> {
	const postStatus = status || (scheduledAt ? "scheduled" : "draft");

	const { data, error } = await getClient()
		.from("posts")
		.insert({
			user_id: userId,
			model_id: modelId,
			caption,
			image_url: imageUrl,
			platform,
			status: postStatus,
			scheduled_at: scheduledAt || null,
			credits_spent: 20,
		})
		.select()
		.single();

	if (error) {
		console.error("Error creating post:", error);
		return null;
	}
	return data;
}

export async function updatePost(
	postId: string,
	updates: Partial<Post>,
): Promise<Post | null> {
	const { data, error } = await getClient()
		.from("posts")
		.update(updates)
		.eq("id", postId)
		.select()
		.single();

	if (error) {
		console.error("Error updating post:", error);
		return null;
	}
	return data;
}

export async function deletePost(postId: string): Promise<boolean> {
	const { error } = await getClient().from("posts").delete().eq("id", postId);
	if (error) {
		console.error("Error deleting post:", error);
		return false;
	}
	return true;
}

export async function getCreditTransactions(
	userId: string,
): Promise<CreditTransaction[]> {
	const { data, error } = await getClient()
		.from("credit_transactions")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(50);

	if (error) {
		console.error("Error fetching transactions:", error);
		return [];
	}
	return data || [];
}

export async function deductCredits(
	userId: string,
	amount: number,
): Promise<boolean> {
	const { data, error } = await getClient().rpc("deduct_credits", {
		user_uuid: userId,
		amount,
	});

	if (error) {
		console.error("Error deducting credits:", error);
		return false;
	}
	return data !== null;
}

export async function uploadModelImage(
	userId: string,
	imageUrl: string,
	type: "portrait" | "full-body",
): Promise<string | null> {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			console.error("Failed to fetch image from URL:", imageUrl);
			return null;
		}
		const blob = await response.blob();
		const buffer = await blob.arrayBuffer();

		const extension = imageUrl.split(".").pop()?.split("?")[0] || "png";
		const timestamp = Date.now();
		const fileName = `${userId}/${type}-${timestamp}.${extension}`;

		const { data, error } = await getClient()
			.storage.from("influencers")
			.upload(fileName, buffer, {
				contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
				upsert: false,
			});

		if (error) {
			console.error("Storage upload error:", error);
			return null;
		}

		const { data: publicUrlData } = getClient()
			.storage.from("influencers")
			.getPublicUrl(data.path);

		return publicUrlData.publicUrl;
	} catch (err) {
		console.error("uploadModelImage error:", err);
		return null;
	}
}

export async function getSocialAccounts(
	userId: string,
): Promise<SocialAccount[]> {
	const { data, error } = await getClient()
		.from("social_accounts")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching social accounts:", error);
		return [];
	}
	return data || [];
}

export async function saveSocialAccount(
	account: Omit<SocialAccount, "id" | "created_at">,
): Promise<SocialAccount | null> {
	const { data, error } = await getClient()
		.from("social_accounts")
		.upsert(
			{
				user_id: account.user_id,
				platform: account.platform,
				zernio_account_id: account.zernio_account_id,
				account_name: account.account_name,
				account_image: account.account_image,
				username: account.username,
				followers_count: account.followers_count,
				profile_url: account.profile_url,
				zernio_data: account.zernio_data,
			},
			{ onConflict: "user_id, platform" },
		)
		.select()
		.single();

	if (error) {
		console.error("Error saving social account:", error);
		return null;
	}
	return data;
}

export async function deleteSocialAccount(
	userId: string,
	platform: string,
): Promise<boolean> {
	const { error } = await getClient()
		.from("social_accounts")
		.delete()
		.eq("user_id", userId)
		.eq("platform", platform);

	if (error) {
		console.error("Error deleting social account:", error);
		return false;
	}
	return true;
}

export async function deleteSocialAccountById(id: string): Promise<boolean> {
	const { error } = await getClient()
		.from("social_accounts")
		.delete()
		.eq("id", id);

	if (error) {
		console.error("Error deleting social account:", error);
		return false;
	}
	return true;
}

export async function updateSubscription(
	userId: string,
	updates: {
		stripe_customer_id?: string;
		stripe_subscription_id?: string;
		plan?: string;
		subscription_period_end?: string;
	},
): Promise<Profile | null> {
	const { data, error } = await getClient()
		.from("profiles")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", userId)
		.select()
		.single();

	if (error) {
		console.error("Error updating subscription:", error);
		return null;
	}
	return data;
}

export const SUBSCRIPTION_PLANS = {
	free: {
		id: "free",
		name: "Free",
		price: 0,
		credits: 300,
		description: "Best for trying the app",
		features: {
			monthlyCredits: "300 credits",
			aiCreationCost: "50 credits",
			postCreationCost: "20 credits",
			connectedAccounts: "1 account",
			autoPostScheduling: "Up to 5 scheduled posts",
		},
		stripePrice: 0,
	},
	standard: {
		id: "standard",
		name: "Standard",
		price: 9.99,
		credits: 2000,
		description: "Best for creators & small teams",
		features: {
			monthlyCredits: "2,000 credits/month",
			aiCreationCost: "50 credits",
			postCreationCost: "20 credits",
			connectedAccounts: "Up to 5 accounts",
			autoPostScheduling: "Unlimited scheduled posts",
		},
		stripePrice: 999,
	},
	pro: {
		id: "pro",
		name: "Pro",
		price: 29.99,
		credits: 10000,
		description: "Best for power users & agencies",
		features: {
			monthlyCredits: "10,000 credits/month",
			aiCreationCost: "50 credits",
			postCreationCost: "20 credits",
			connectedAccounts: "Unlimited accounts",
			autoPostScheduling: "Unlimited scheduled posts",
		},
		stripePrice: 2999,
	},
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

export async function addCredits(
	userId: string,
	amount: number,
	description?: string,
): Promise<boolean> {
	const { data, error } = await getClient().rpc("add_credits", {
		user_uuid: userId,
		amount,
		description: description || "Credit purchase",
	});

	if (error) {
		console.error("Error adding credits:", error);
		return false;
	}
	return data !== null;
}
