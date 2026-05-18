export interface Profile {
	id: string;
	email: string | null;
	full_name: string | null;
	avatar_url: string | null;
	credits: number;
	created_at: string;
	updated_at: string;
}

export interface Model {
	id: string;
	user_id: string;
	name: string;
	gender: string;
	body_type: string | null;
	skin_tone: string | null;
	age_range: string | null;
	hair_style: string | null;
	hair_color: string | null;
	eye_color: string | null;
	vibe: string | null;
	portrait_url: string | null;
	full_body_url: string | null;
	prompt: string | null;
	credits_spent: number;
	created_at: string;
	updated_at: string;
}

export interface Post {
	id: string;
	user_id: string;
	model_id: string | null;
	caption: string | null;
	image_url: string;
	platform: string;
	status: string;
	scheduled_at: string | null;
	credits_spent: number;
	created_at: string;
}

export interface CreditTransaction {
	id: string;
	user_id: string;
	amount: number;
	type: "purchase" | "usage" | "refund" | "bonus";
	description: string | null;
	created_at: string;
}

export type ModelFormData = {
	name: string;
	gender: string;
	bodyType: string;
	skinTone: string;
	ageRange: string;
	hairStyle: string;
	hairColor: string;
	eyeColor: string;
	vibe: string;
};

export type PostFormData = {
	modelId: string;
	caption: string;
	platform: string;
	scheduledAt?: string;
};
