import {
	Camera,
	Video,
	MessageCircle,
	Building2,
	Layout,
	FileText,
} from "lucide-react";
import type { ComponentType } from "react";

export const platformConfig: Record<
	string,
	{ icon: ComponentType<{ className?: string }>; color: string; label: string }
> = {
	instagram: { icon: Camera, color: "bg-pink-500", label: "Instagram" },
	tiktok: { icon: Video, color: "bg-black", label: "TikTok" },
	twitter: { icon: MessageCircle, color: "bg-black", label: "X" },
	linkedin: { icon: Building2, color: "bg-blue-600", label: "LinkedIn" },
	pinterest: { icon: Layout, color: "bg-red-500", label: "Pinterest" },
	facebook: { icon: MessageCircle, color: "bg-blue-500", label: "Facebook" },
};

export function getPlatformConfig(platform: string) {
	return (
		platformConfig[platform.toLowerCase()] ?? {
			icon: FileText,
			color: "bg-muted-foreground",
			label: platform,
		}
	);
}

export const platformOptions = [
	{ id: "instagram", label: "Instagram", icon: Camera, color: "bg-pink-500" },
	{ id: "tiktok", label: "TikTok", icon: Video, color: "bg-black" },
	{ id: "twitter", label: "X", icon: MessageCircle, color: "bg-black" },
	{ id: "linkedin", label: "LinkedIn", icon: Building2, color: "bg-blue-600" },
	{ id: "pinterest", label: "Pinterest", icon: Layout, color: "bg-red-500" },
	{
		id: "facebook",
		label: "Facebook",
		icon: MessageCircle,
		color: "bg-blue-500",
	},
] as const;
