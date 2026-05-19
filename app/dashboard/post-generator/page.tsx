"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	ArrowLeft,
	Sparkles,
	Image as ImageIcon,
	Zap,
	Loader2,
	Upload,
	X,
	RefreshCw,
	Camera,
	Video,
	Layout,
	Target,
	Rocket,
	Gift,
	Sun,
	Building2,
	Trees,
	Home,
	Palette,
	ShoppingBag,
	Laptop,
	Coffee,
	Dumbbell,
	Star,
	Send,
	Bookmark,
	MessageCircle,
	Heart,
	Play,
	Eye,
	AudioLines,
	TrendingUp,
	DollarSign,
	Calendar as CalendarIcon,
	Clock,
	CheckCircle,
	BarChart3,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
	getModels,
	getProfile,
	createPost,
	deductCredits,
	addCredits,
	getSocialAccounts,
	Model,
} from "@/lib/db";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

const platformOptions = [
	{
		id: "instagram",
		label: "Instagram",
		icon: Camera,
		color: "bg-pink-500",
	},
	{ id: "tiktok", label: "TikTok", icon: Video, color: "bg-black" },
	{ id: "twitter", label: "X", icon: X, color: "bg-black" },
	{ id: "linkedin", label: "LinkedIn", icon: Building2, color: "bg-blue-600" },
	{ id: "pinterest", label: "Pinterest", icon: ImageIcon, color: "bg-red-500" },
	{
		id: "facebook",
		label: "Facebook",
		icon: MessageCircle,
		color: "bg-blue-500",
	},
];

const postFormatOptions = [
	{ id: "portrait", label: "Portrait", icon: ImageIcon, aspect: "4:5" },
	{ id: "single", label: "Single", icon: ImageIcon, aspect: "1:1" },
	{ id: "story", label: "Story/Reel", icon: Play, aspect: "9:16" },
	{ id: "landscape", label: "Landscape", icon: Layout, aspect: "16:9" },
];

const goalOptions = [
	{
		id: "awareness",
		label: "Awareness",
		icon: Eye,
		color: "bg-purple-100 text-purple-700 border-purple-200",
	},
	{
		id: "engagement",
		label: "Engagement",
		icon: MessageCircle,
		color: "bg-blue-100 text-blue-700 border-blue-200",
	},
	{
		id: "launch",
		label: "Launch",
		icon: Rocket,
		color: "bg-orange-100 text-orange-700 border-orange-200",
	},
	{
		id: "conversion",
		label: "Conversion",
		icon: Target,
		color: "bg-green-100 text-green-700 border-green-200",
	},
	{
		id: "giveaway",
		label: "Giveaway",
		icon: Gift,
		color: "bg-pink-100 text-pink-700 border-pink-200",
	},
];

const sceneOptions = [
	{ id: "urban", label: "Urban", icon: Building2 },
	{ id: "studio", label: "Studio", icon: Camera },
	{ id: "nature", label: "Nature", icon: Trees },
	{ id: "beach", label: "Beach", icon: Sun },
	{ id: "home", label: "Home", icon: Home },
	{ id: "abstract", label: "Abstract", icon: Palette },
];

const outfitMoodOptions = [
	{ id: "casual", label: "Casual" },
	{ id: "formal", label: "Formal" },
	{ id: "streetwear", label: "Streetwear" },
	{ id: "elegant", label: "Elegant" },
	{ id: "sporty", label: "Sporty" },
	{ id: "bohemian", label: "Bohemian" },
];

const lightingOptions = [
	{ id: "natural", label: "Natural" },
	{ id: "soft", label: "Soft" },
	{ id: "dramatic", label: "Dramatic" },
	{ id: "golden-hour", label: "Golden Hour" },
	{ id: "studio", label: "Studio" },
	{ id: "neon", label: "Neon" },
];

const propsOptions = [
	{ id: "shopping-bag", label: "Shopping Bag", icon: ShoppingBag },
	{ id: "laptop", label: "Laptop", icon: Laptop },
	{ id: "headphones", label: "Headphones", icon: AudioLines },
	{ id: "coffee", label: "Coffee", icon: Coffee },
	{ id: "fitness", label: "Fitness Gear", icon: Dumbbell },
	{ id: "tech", label: "Tech", icon: Star },
];

const toneOptions = [
	{ id: "professional", label: "Professional" },
	{ id: "casual", label: "Casual" },
	{ id: "funny", label: "Funny" },
	{ id: "inspirational", label: "Inspirational" },
	{ id: "educational", label: "Educational" },
	{ id: "promotional", label: "Promotional" },
];

const ctaOptions = [
	{ id: "shop-now", label: "Shop Now" },
	{ id: "learn-more", label: "Learn More" },
	{ id: "sign-up", label: "Sign Up" },
	{ id: "book-now", label: "Book Now" },
	{ id: "get-offer", label: "Get Offer" },
	{ id: "download", label: "Download" },
	{ id: "contact-us", label: "Contact Us" },
];

const languageOptions = [
	{ id: "en", label: "English" },
	{ id: "es", label: "Spanish" },
	{ id: "fr", label: "French" },
	{ id: "de", label: "German" },
	{ id: "pt", label: "Portuguese" },
	{ id: "zh", label: "Chinese" },
];

const emojiDensityOptions = [
	{ id: "none", label: "None", emoji: "🚫" },
	{ id: "low", label: "Low", emoji: "✨" },
	{ id: "medium", label: "Medium", emoji: "✨🔥" },
	{ id: "high", label: "High", emoji: "✨🔥💯🚀" },
];

interface FormData {
	modelId: string;
	platform: string;
	format: string;
	campaignName: string;
	product: string;
	goal: string;
	brief: string;
	scene: string;
	outfitMood: string;
	lighting: string;
	props: string[];
	tone: string;
	cta: string;
	language: string;
	hashtagCount: number;
	emojiDensity: string;
	caption: string;
	prompt: string;
	scheduledAt: string;
	referenceImages: string[];
}

const defaultFormData: FormData = {
	modelId: "",
	platform: "",
	format: "single",
	campaignName: "",
	product: "",
	goal: "engagement",
	brief: "",
	scene: "studio",
	outfitMood: "casual",
	lighting: "natural",
	props: [],
	tone: "casual",
	cta: "shop-now",
	language: "en",
	hashtagCount: 10,
	emojiDensity: "medium",
	caption: "",
	prompt: "",
	scheduledAt: "",
	referenceImages: [],
};

export default function PostGeneratorPage() {
	const { user, isLoading: authLoading } = useAuth();
	const [models, setModels] = useState<Model[]>([]);
	const [formData, setFormData] = useState<FormData>(defaultFormData);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [credits, setCredits] = useState(300);
	const [isLoadingCredits, setIsLoadingCredits] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingModels, setIsLoadingModels] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"model" | "platform" | "format" | "content" | "visual" | "caption"
	>("model");
	const [showSaveOptions, setShowSaveOptions] = useState(false);
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
	const [scheduleTime, setScheduleTime] = useState("");
	const [publishNow, setPublishNow] = useState(true);
	const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isTestMode = process.env.NEXT_PUBLIC_LUMA_MOCK === "true";

	useEffect(() => {
		async function loadData() {
			if (user) {
				const [modelsData, profile, socialAccounts] = await Promise.all([
					getModels(user.id),
					getProfile(user.id),
					getSocialAccounts(user.id),
				]);
				setModels(modelsData);
				const platforms = socialAccounts.map((a) => a.platform);
				setConnectedPlatforms(platforms);
				if (profile) {
					setCredits(profile.credits);
				}
				if (modelsData.length > 0) {
					setFormData((prev) => ({ ...prev, modelId: modelsData[0].id }));
				}
				if (platforms.length > 0) {
					setFormData((prev) => ({ ...prev, platform: platforms[0] }));
				}
			}
			setIsLoadingModels(false);
			setIsLoadingCredits(false);
		}
		if (!authLoading) {
			loadData();
		}
	}, [user, authLoading]);

	const selectedModel = models.find((m) => m.id === formData.modelId);
	const reachEstimate = selectedModel
		? Math.floor(Math.random() * 50000 + 10000).toLocaleString()
		: "0";

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const currentCount = formData.referenceImages.length;
		const remaining = 3 - currentCount;

		for (let i = 0; i < Math.min(remaining, files.length); i++) {
			const file = files[i];
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) {
					setFormData((prev) => ({
						...prev,
						referenceImages: [
							...prev.referenceImages,
							event.target?.result as string,
						].slice(0, 3),
					}));
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const removeReferenceImage = (index: number) => {
		setFormData((prev) => ({
			...prev,
			referenceImages: prev.referenceImages.filter((_, i) => i !== index),
		}));
	};

	const generatePrompt = () => {
		const model = selectedModel;
		if (!model) return "";

		const sceneDesc =
			sceneOptions.find((s) => s.id === formData.scene)?.label || "Studio";
		const moodDesc =
			outfitMoodOptions.find((o) => o.id === formData.outfitMood)?.label ||
			"Casual";
		const lightingDesc =
			lightingOptions.find((l) => l.id === formData.lighting)?.label ||
			"Natural";
		const propsDesc =
			formData.props.length > 0
				? formData.props
						.map((p) => propsOptions.find((pr) => pr.id === p)?.label)
						.join(", ")
				: "";

		const prompt = `AI generated influencer portrait, ${model.name}, ${sceneDesc} setting, ${moodDesc} outfit, ${lightingDesc} lighting${propsDesc ? `, with ${propsDesc}` : ""}, ${formData.product ? `promoting ${formData.product}` : ""}, ${formData.brief ? `${formData.brief}` : ""}, high quality, professional photography, detailed, 8k quality`;

		setFormData((prev) => ({ ...prev, prompt }));
		return prompt;
	};

	const generateCaption = () => {
		const hashtags = Array.from(
			{ length: formData.hashtagCount },
			(_, i) => `#${formData.product || "AI"}${i + 1}`,
		).join(" ");
		const emojiMap: Record<string, string> = {
			none: "",
			low: "✨",
			medium: "✨🔥",
			high: "✨🔥💯🚀🎉",
		};
		const emojis = emojiMap[formData.emojiDensity] || "";

		const ctaText =
			ctaOptions.find((c) => c.id === formData.cta)?.label || "Shop Now";

		const captions: Record<string, string> = {
			professional: `Excited to share our latest content! ${emojis}\n\n${formData.brief || "Check out our new post!"}\n\n👇 ${ctaText}\n\n${hashtags}`,
			casual: `Hey friends! ✨ Check this out! ${emojis}\n\n${formData.brief || "New content drop!"}\n\n${ctaText.toLowerCase()} link in bio! 🔗\n\n${hashtags}`,
			funny: `POV: When the content hits different 😂 ${emojis}\n\n${formData.brief || "Had to share this!"}\n\n${ctaText} before it goes viral! 🚀\n\n${hashtags}`,
			inspirational: `Dream big, create bigger ✨ ${emojis}\n\n${formData.brief || "Your potential is limitless!"}\n\n${ctaText} to start your journey!\n\n${hashtags}`,
			educational: `Here's what you need to know 📚 ${emojis}\n\n${formData.brief || "Quick tip for you!"}\n\nDon't forget to ${ctaText.toLowerCase()}!\n\n${hashtags}`,
			promotional: `🔥 NEW ALERT! ${emojis}\n\n${formData.brief || formData.product || "Special offer just for you!"}\n\n${ctaText} - Don't miss out!\n\n${hashtags}`,
		};

		setFormData((prev) => ({
			...prev,
			caption: captions[formData.tone] || captions.casual,
		}));
	};

	const handleGenerate = async () => {
		if (!user) return;

		if (!formData.modelId) {
			alert("Please select a model first!");
			return;
		}

		if (credits < 20) {
			alert("Insufficient credits! Please purchase more credits.");
			return;
		}

		setIsGenerating(true);

		const deducted = await deductCredits(user.id, 20);
		if (!deducted) {
			setIsGenerating(false);
			alert("Insufficient credits. Please purchase more credits.");
			return;
		}

		try {
			let imageUrl = "";

			if (isTestMode) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				const seed = Math.floor(Math.random() * 1000);
				imageUrl = `https://picsum.photos/seed/${seed}/800/800`;
			} else {
				const response = await fetch("/api/luma/generate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						prompt: formData.prompt || generatePrompt(),
						aspect_ratio:
							formData.format === "landscape"
								? "16:9"
								: formData.format === "story"
									? "9:16"
									: "1:1",
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to generate image");
				}

				const data = await response.json();
				imageUrl = data.imageUrl;
			}

			setGeneratedImage(imageUrl);
			setCredits((prev) => prev - 20);
		} catch (error) {
			console.error("Generation error:", error);
			await addCredits(user.id, 20, "Refund for failed post generation");
			alert("Failed to generate image. Credits have been refunded.");
		}

		setIsGenerating(false);
	};

	const handleSaveAsDraft = async () => {
		if (!user || !generatedImage) return;

		setIsSaving(true);
		const post = await createPost(
			user.id,
			formData.modelId,
			formData.caption,
			generatedImage,
			formData.platform || "draft",
			undefined,
			"draft",
		);

		if (post) {
			setShowSaveOptions(false);
			setShowSuccessDialog(true);
		} else {
			alert("Failed to save draft. Please try again.");
		}
		setIsSaving(false);
	};

	const handleSchedulePost = async () => {
		if (!user || !generatedImage) return;

		const scheduledAt = publishNow
			? new Date().toISOString()
			: scheduleDate && scheduleTime
				? `${format(scheduleDate, "yyyy-MM-dd")}T${scheduleTime}:00`
				: null;

		if (!publishNow && !scheduledAt) {
			alert("Please select a date and time to schedule your post.");
			return;
		}

		setIsSaving(true);
		const post = await createPost(
			user.id,
			formData.modelId,
			formData.caption,
			generatedImage,
			formData.platform,
			scheduledAt || undefined,
			"scheduled",
		);

		if (post) {
			try {
				await fetch("/api/zernio/schedule", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						caption: formData.caption,
						imageUrl: generatedImage,
						scheduledAt,
						platform: formData.platform,
						timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
						publishNow,
					}),
				});
			} catch (e) {
				console.error("Failed to schedule via Zernio:", e);
			}

			setShowScheduleModal(false);
			setShowSaveOptions(false);
			setGeneratedImage(null);
			setFormData(defaultFormData);
			setScheduleDate(undefined);
			setScheduleTime("");
			if (models.length > 0) {
				setFormData((prev) => ({ ...prev, modelId: models[0].id }));
			}
			alert(
				publishNow
					? "Post published successfully!"
					: "Post scheduled successfully!",
			);
		} else {
			alert("Failed to schedule post. Please try again.");
		}
		setIsSaving(false);
	};

	const renderModelPicker = () => (
		<div className="space-y-4">
			<label className="text-sm font-medium">Select Model</label>
			<div className="grid grid-cols-2 gap-3">
				{models.map((model) => (
					<button
						key={model.id}
						onClick={() =>
							setFormData((prev) => ({ ...prev, modelId: model.id }))
						}
						className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
							formData.modelId === model.id
								? "border-primary bg-primary/10"
								: "border-border hover:border-primary/50"
						}`}
					>
						<div className="flex items-center gap-3">
							<div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
								{model.portrait_url ? (
									<Image
										src={model.portrait_url}
										alt={model.name}
										fill
										className="object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-muted">
										<ImageIcon className="h-6 w-6 text-muted-foreground" />
									</div>
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">{model.name}</p>
								<p className="truncate text-xs capitalize text-muted-foreground">
									{model.vibe}
								</p>
								<p className="mt-1 text-xs font-medium text-primary">
									~{reachEstimate} reach
								</p>
							</div>
						</div>
						{formData.modelId === model.id && (
							<div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
								<svg
									className="h-3 w-3 text-primary-foreground"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						)}
					</button>
				))}
			</div>
		</div>
	);

	const renderPlatformTabs = () => {
		const availablePlatforms = platformOptions.filter((p) =>
			connectedPlatforms.includes(p.id),
		);

		return (
			<div className="space-y-4">
				<label className="text-sm font-medium">Platform</label>

				{availablePlatforms.length > 0 ? (
					<div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
						{availablePlatforms.map((platform) => {
							const Icon = platform.icon;
							return (
								<button
									key={platform.id}
									onClick={() =>
										setFormData((prev) => ({
											...prev,
											platform: platform.id,
										}))
									}
									className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
										formData.platform === platform.id
											? "border-primary bg-primary/10"
											: "border-border hover:border-primary/50"
									}`}
								>
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-full ${platform.color} text-white`}
									>
										<Icon className="h-5 w-5" />
									</div>
									<span className="text-xs font-medium">{platform.label}</span>
								</button>
							);
						})}
					</div>
				) : (
					<div className="rounded-lg border border-dashed border-border bg-muted/30 p-5 text-center">
						<p className="text-sm text-muted-foreground">
							No social media accounts connected.
						</p>
						<Link
							href="/dashboard/accounts"
							className="mt-2 inline-block text-sm font-semibold text-primary underline underline-offset-2"
						>
							Connect a social account
						</Link>
					</div>
				)}

				{connectedPlatforms.length > 0 && (
					<Link
						href="/dashboard/accounts"
						className="block text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
					>
						Connect more accounts
					</Link>
				)}
			</div>
		);
	};

	const renderPostFormat = () => (
		<div className="space-y-4">
			<label className="text-sm font-medium">Post Format</label>
			<div className="grid grid-cols-3 gap-3">
				{postFormatOptions.map((format) => {
					const Icon = format.icon;
					return (
						<button
							key={format.id}
							onClick={() =>
								setFormData((prev) => ({ ...prev, format: format.id }))
							}
							className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${
								formData.format === format.id
									? "border-primary bg-primary/10"
									: "border-border hover:border-primary/50"
							}`}
						>
							<div
								className={`flex items-center justify-center rounded-lg bg-muted ${
									format.aspect === "1:1"
										? "h-12 w-12"
										: format.aspect === "9:16"
											? "h-16 w-10"
											: "h-10 w-16"
								}`}
							>
								<Icon className="h-6 w-6 text-muted-foreground" />
							</div>
							<div className="text-center">
								<p className="text-sm font-medium">{format.label}</p>
								<p className="text-xs text-muted-foreground">{format.aspect}</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);

	const renderContentBrief = () => (
		<div className="space-y-5">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Campaign Name</label>
					<input
						type="text"
						value={formData.campaignName}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, campaignName: e.target.value }))
						}
						placeholder="Summer Sale 2024"
						className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
					/>
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium">Product</label>
					<input
						type="text"
						value={formData.product}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, product: e.target.value }))
						}
						placeholder="Skin care product"
						className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
					/>
				</div>
			</div>

			<div className="space-y-3">
				<label className="text-sm font-medium">Post Goal</label>
				<div className="flex flex-wrap gap-2">
					{goalOptions.map((goal) => {
						const Icon = goal.icon;
						return (
							<button
								key={goal.id}
								onClick={() =>
									setFormData((prev) => ({ ...prev, goal: goal.id }))
								}
								className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
									formData.goal === goal.id
										? goal.color
										: "border-border bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
							>
								<Icon className="h-4 w-4" />
								{goal.label}
							</button>
						);
					})}
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Brief</label>
				<textarea
					value={formData.brief}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, brief: e.target.value }))
					}
					placeholder="Describe your post content, key message, or any specific requirements..."
					rows={3}
					className="w-full resize-none rounded-lg border border-border bg-muted p-4 text-sm placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
				/>
			</div>
		</div>
	);

	const renderVisualDirection = () => (
		<div className="space-y-5">
			<div className="space-y-3">
				<label className="text-sm font-medium">Scene</label>
				<div className="flex flex-wrap gap-2">
					{sceneOptions.map((scene) => {
						const Icon = scene.icon;
						return (
							<button
								key={scene.id}
								onClick={() =>
									setFormData((prev) => ({ ...prev, scene: scene.id }))
								}
								className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
									formData.scene === scene.id
										? "border-primary bg-primary/10 text-primary"
										: "border-border bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
							>
								<Icon className="h-4 w-4" />
								{scene.label}
							</button>
						);
					})}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Outfit Mood</label>
					<select
						value={formData.outfitMood}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, outfitMood: e.target.value }))
						}
						className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
					>
						{outfitMoodOptions.map((mood) => (
							<option key={mood.id} value={mood.id}>
								{mood.label}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium">Lighting Style</label>
					<select
						value={formData.lighting}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, lighting: e.target.value }))
						}
						className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
					>
						{lightingOptions.map((light) => (
							<option key={light.id} value={light.id}>
								{light.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="space-y-3">
				<label className="text-sm font-medium">Props</label>
				<div className="flex flex-wrap gap-2">
					{propsOptions.map((prop) => {
						const Icon = prop.icon;
						return (
							<button
								key={prop.id}
								onClick={() => {
									setFormData((prev) => ({
										...prev,
										props: prev.props.includes(prop.id)
											? prev.props.filter((p) => p !== prop.id)
											: [...prev.props, prop.id],
									}));
								}}
								className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
									formData.props.includes(prop.id)
										? "border-primary bg-primary/10 text-primary"
										: "border-border bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
							>
								<Icon className="h-4 w-4" />
								{prop.label}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);

	const renderCaptionCopy = () => (
		<div className="space-y-5">
			<div className="space-y-3">
				<label className="text-sm font-medium">Tone</label>
				<div className="flex flex-wrap gap-2">
					{toneOptions.map((tone) => (
						<button
							key={tone.id}
							onClick={() =>
								setFormData((prev) => ({ ...prev, tone: tone.id }))
							}
							className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
								formData.tone === tone.id
									? "border-primary bg-primary/10 text-primary"
									: "border-border bg-muted text-muted-foreground hover:bg-muted/80"
							}`}
						>
							{tone.label}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">CTA</label>
					<select
						value={formData.cta}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, cta: e.target.value }))
						}
						className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
					>
						{ctaOptions.map((cta) => (
							<option key={cta.id} value={cta.id}>
								{cta.label}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium">Language</label>
					<select
						value={formData.language}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, language: e.target.value }))
						}
						className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
					>
						{languageOptions.map((lang) => (
							<option key={lang.id} value={lang.id}>
								{lang.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<label className="text-sm font-medium">Hashtag Count</label>
					<span className="text-sm font-medium text-primary">
						{formData.hashtagCount}
					</span>
				</div>
				<input
					type="range"
					min="0"
					max="30"
					value={formData.hashtagCount}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							hashtagCount: parseInt(e.target.value),
						}))
					}
					className="w-full accent-primary"
				/>
			</div>

			<div className="space-y-3">
				<label className="text-sm font-medium">Emoji Density</label>
				<div className="flex gap-2">
					{emojiDensityOptions.map((emoji) => (
						<button
							key={emoji.id}
							onClick={() =>
								setFormData((prev) => ({ ...prev, emojiDensity: emoji.id }))
							}
							className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium transition-all ${
								formData.emojiDensity === emoji.id
									? "border-primary bg-primary/10 text-primary"
									: "border-border bg-muted text-muted-foreground hover:bg-muted/80"
							}`}
						>
							<span className="block text-lg">{emoji.emoji}</span>
							<span className="text-xs">{emoji.label}</span>
						</button>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<label className="text-sm font-medium">Caption Preview</label>
					<button
						onClick={generateCaption}
						className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
					>
						<RefreshCw className="h-3 w-3" />
						Regenerate
					</button>
				</div>
				<textarea
					value={formData.caption}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, caption: e.target.value }))
					}
					placeholder="Your generated caption will appear here..."
					rows={4}
					className="w-full resize-none rounded-lg border border-border bg-muted p-4 text-sm placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
				/>
			</div>
		</div>
	);

	const renderReferenceImages = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Max 3 Images</label>
				<div className="flex gap-3">
					{formData.referenceImages.map((img, index) => (
						<div
							key={index}
							className="relative h-20 w-20 overflow-hidden rounded-lg"
						>
							<Image
								src={img}
								alt={`Reference ${index + 1}`}
								fill
								className="object-cover"
							/>
							<button
								onClick={() => removeReferenceImage(index)}
								className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
							>
								<X className="h-3 w-3" />
							</button>
						</div>
					))}
					{formData.referenceImages.length < 3 && (
						<button
							onClick={() => fileInputRef.current?.click()}
							className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50"
						>
							<Upload className="h-6 w-6 text-muted-foreground" />
						</button>
					)}
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					onChange={handleImageUpload}
					className="hidden"
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium">Generation Prompt</label>
				<textarea
					value={formData.prompt}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, prompt: e.target.value }))
					}
					placeholder="Edit the prompt or leave empty to auto-generate..."
					rows={4}
					className="w-full resize-none rounded-lg border border-border bg-muted p-4 font-mono text-sm placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
				/>
				<button
					onClick={generatePrompt}
					className="text-sm text-primary hover:text-primary/80"
				>
					Generate from inputs
				</button>
			</div>
		</div>
	);

	const renderPreview = () => {
		const formatSizes = {
			portrait: { width: 200, height: 250 },
			single: { width: 200, height: 200 },
			story: { width: 170, height: 300 },
			landscape: { width: 240, height: 135 },
		};

		const currentFormat =
			formatSizes[formData.format as keyof typeof formatSizes] ||
			formatSizes.single;

		return (
			<div className="flex justify-center py-6">
				<div
					className="relative rounded-[40px] border-[7px] border-gray-950 bg-gray-950 shadow-2xl"
					style={{ width: currentFormat.width + 30 }}
				>
					<div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-0.5 h-6 w-20 rounded-b-xl bg-gray-900" />

					<div className="p-3">
						<div className="relative overflow-hidden rounded-md bg-gray-800">
							<div
								className="relative mx-auto bg-gray-700"
								style={{
									width: currentFormat.width,
									height: currentFormat.height,
								}}
							>
								{generatedImage ? (
									<Image
										src={generatedImage}
										alt="Generated post"
										fill
										className="object-cover"
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										<div className="text-center">
											<ImageIcon className="mx-auto h-8 w-8 text-gray-500" />
											<p className="mt-2 text-xs text-gray-500">Post Image</p>
										</div>
									</div>
								)}
							</div>
						</div>

						<div
							className="mx-auto mt-2 space-y-1"
							style={{ width: currentFormat.width }}
						>
							<div className="flex items-center justify-between">
								<div className="flex gap-3">
									<Heart className="h-4 w-4 text-white" />
									<MessageCircle className="h-4 w-4 text-white" />
									<Send className="h-4 w-4 text-white" />
								</div>
								<Bookmark className="h-4 w-4 text-white" />
							</div>

							<p className="text-xs text-white">1,234 likes</p>

							<div className="flex items-start gap-2">
								<div className="h-4 w-4 flex-shrink-0 rounded-full bg-pink-500" />
								<p className="truncate text-xs text-white">
									<span className="font-semibold">
										{selectedModel?.name || "ai_influencer"}
									</span>
									<span className="ml-1 opacity-80">
										{formData.caption?.slice(0, 35) || "Your caption..."}
									</span>
								</p>
							</div>

							<p className="text-[10px] text-gray-500">View all 12 comments</p>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const tabs = [
		{ id: "model", label: "Model" },
		{ id: "platform", label: "Platform" },
		{ id: "format", label: "Format" },
		{ id: "content", label: "Content" },
		{ id: "visual", label: "Visual" },
		{ id: "caption", label: "Caption" },
	] as const;

	if (authLoading || isLoadingModels || isLoadingCredits) {
		return (
			<div className="flex min-h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (models.length === 0) {
		return (
			<div className="p-8">
				<div className="mb-8 flex items-center gap-4 border-b border-border pb-5">
					<Link
						href="/dashboard/models"
						className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div className="flex-1">
						<h1 className="text-3xl font-bold">Post Generator</h1>
						<p className="mt-2 text-muted-foreground">
							Create engaging posts with your AI influencers
						</p>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
					<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
						<ImageIcon className="h-10 w-10 text-muted-foreground" />
					</div>
					<h3 className="text-xl font-semibold">No Models Available</h3>
					<p className="mt-2 max-w-md text-muted-foreground">
						You need to create at least one AI influencer model before
						generating posts.
					</p>
					<Link
						href="/dashboard/models/create"
						className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
					>
						Create Your First Model
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<div className="mb-8 flex items-center gap-4 border-b border-border pb-5">
				<Link
					href="/dashboard/models"
					className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">Post Generator</h1>
					<p className="mt-2 text-muted-foreground">
						Create engaging posts with your AI influencers
					</p>
				</div>
				<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
					<Zap className="h-5 w-5 text-primary" />
					<span className="font-bold">{credits}</span>
					<span className="text-sm text-muted-foreground">Credits</span>
				</div>
			</div>

			<div className="flex flex-col gap-8 xl:flex-row">
				<div className="flex-1 space-y-6">
					<div className="rounded-xl border border-border bg-card">
						<div className="flex border-b">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
										activeTab === tab.id
											? "border-b-2 border-primary bg-primary/5 text-primary"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>
						<div className="p-6">
							{activeTab === "model" && renderModelPicker()}
							{activeTab === "platform" && renderPlatformTabs()}
							{activeTab === "format" && renderPostFormat()}
							{activeTab === "content" && renderContentBrief()}
							{activeTab === "visual" && renderVisualDirection()}
							{activeTab === "caption" && renderCaptionCopy()}
						</div>
					</div>

					<div className="rounded-xl border border-border bg-card p-6">
						<h3 className="mb-4 text-lg font-semibold">Reference Images</h3>
						{renderReferenceImages()}
					</div>
				</div>

				<div className="w-full space-y-6 xl:w-[450px]">
					<div className="sticky top-8 space-y-6">
						<div className="rounded-xl border border-border bg-card p-6 min-h-[600px]">
							<h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
							{renderPreview()}
						</div>

						<button
							onClick={handleGenerate}
							disabled={isGenerating || credits < 20 || !formData.modelId}
							className={`w-full rounded-xl bg-primary px-6 py-5 text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${
								isGenerating ? "cursor-wait" : ""
							}`}
						>
							<div className="flex items-center justify-center gap-3">
								{isGenerating ? (
									<>
										<Loader2 className="h-6 w-6 animate-spin" />
										<span className="text-lg font-bold">Generating...</span>
									</>
								) : (
									<>
										<Sparkles className="h-6 w-6" />
										<span className="text-lg font-bold">Generate Post</span>
										<div className="rounded-lg bg-white/20 px-2 py-1 text-xs font-bold">
											-20 ⚡
										</div>
									</>
								)}
							</div>
						</button>

						{generatedImage && (
							<div className="space-y-3">
								{!showSaveOptions ? (
									<button
										onClick={() => setShowSaveOptions(true)}
										className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold shadow-sm transition-all hover:bg-primary/90"
									>
										{formData.platform &&
										connectedPlatforms.includes(formData.platform)
											? "Save or Schedule Post"
											: "Save as Draft"}
									</button>
								) : (
									<div className="space-y-3">
										<div className="grid grid-cols-2 gap-3">
											<button
												onClick={handleSaveAsDraft}
												disabled={isSaving}
												className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-4 py-4 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-muted"
											>
												<Bookmark className="h-5 w-5" />
												<span>Save as Draft</span>
											</button>
											{formData.platform &&
												connectedPlatforms.includes(formData.platform) && (
													<button
														className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-4 py-4 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-muted"
														onClick={() => {
															setShowScheduleModal(true);
														}}
													>
														<CalendarIcon className="h-5 w-5" />
														<span>Schedule</span>
													</button>
												)}
										</div>

										<button
											onClick={() => {
												setShowSaveOptions(false);
												setGeneratedImage(null);
												setFormData(defaultFormData);
												if (models.length > 0) {
													setFormData((prev) => ({
														...prev,
														modelId: models[0].id,
													}));
												}
												if (connectedPlatforms.length > 0) {
													setFormData((prev) => ({
														...prev,
														platform: connectedPlatforms[0],
													}));
												}
											}}
											className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
										>
											Clear
										</button>
									</div>
								)}
							</div>
						)}

						{generatedImage && (
							<div className="rounded-xl border border-border bg-card p-5">
								<div className="mb-4 flex items-center gap-2">
									<BarChart3 className="h-5 w-5 text-primary" />
									<h4 className="text-base font-semibold">
										Estimated Performance
									</h4>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="rounded-lg bg-muted/50 p-3 text-center">
										<div className="mb-1 flex justify-center">
											<Heart className="h-4 w-4 text-pink-500" />
										</div>
										<p className="text-lg font-bold">
											{Math.floor(Math.random() * 5000 + 1000).toLocaleString()}
										</p>
										<p className="text-xs text-muted-foreground">Engagement</p>
									</div>
									<div className="rounded-lg bg-muted/50 p-3 text-center">
										<div className="mb-1 flex justify-center">
											<Eye className="h-4 w-4 text-blue-500" />
										</div>
										<p className="text-lg font-bold">
											{Math.floor(
												Math.random() * 50000 + 10000,
											).toLocaleString()}
										</p>
										<p className="text-xs text-muted-foreground">Impressions</p>
									</div>
									<div className="rounded-lg bg-muted/50 p-3 text-center">
										<div className="mb-1 flex justify-center">
											<DollarSign className="h-4 w-4 text-green-500" />
										</div>
										<p className="text-lg font-bold">
											${Math.floor(Math.random() * 500 + 50)}
										</p>
										<p className="text-xs text-muted-foreground">Ad Value</p>
									</div>
								</div>
							</div>
						)}

						{credits < 20 && (
							<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
								<div className="flex items-center gap-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
										<Zap className="h-6 w-6 text-yellow-600" />
									</div>
									<div>
										<h4 className="font-semibold text-yellow-800">
											Low Credits!
										</h4>
										<p className="text-sm text-yellow-700">
											Need more to generate posts
										</p>
									</div>
								</div>
								<button className="mt-4 w-full rounded-lg bg-yellow-500 px-4 py-3 text-sm font-bold text-white">
									Buy Credits
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{showScheduleModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
						<div className="mb-6 flex items-center justify-between">
							<h3 className="text-xl font-bold">Schedule Post</h3>
							<button
								onClick={() => setShowScheduleModal(false)}
								className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="space-y-5">
							<div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-green-500" />
									<span className="font-medium">Publish Now</span>
								</div>
								<button
									onClick={() => setPublishNow(!publishNow)}
									className={`relative h-7 w-14 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
										publishNow ? "bg-primary" : "bg-muted-foreground/40"
									}`}
									type="button"
									aria-pressed={publishNow}
								>
									<span
										className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
											publishNow ? "translate-x-7" : "translate-x-0"
										}`}
									/>
								</button>
							</div>

							{!publishNow && (
								<div className="space-y-4">
									<div className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-medium">
											<CalendarIcon className="h-4 w-4" />
											Select Date
										</label>
										<Popover>
											<PopoverTrigger
												className={cn(
													"w-full flex items-center justify-start gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm transition-colors hover:bg-muted",
													!scheduleDate && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="h-4 w-4" />
												{scheduleDate
													? format(scheduleDate, "PPP")
													: "Choose a date"}
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={scheduleDate}
													onSelect={setScheduleDate}
													disabled={(date) => date < new Date()}
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-medium">
											<Clock className="h-4 w-4" />
											Select Time
										</label>
										<TimePicker value={scheduleTime} onChange={setScheduleTime} />
									</div>
								</div>
							)}

							<div className="flex gap-3 pt-2">
								<button
									onClick={() => setShowScheduleModal(false)}
									className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
								>
									Cancel
								</button>
								<button
									onClick={handleSchedulePost}
									disabled={isSaving}
									className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
								>
									{isSaving
										? "Processing..."
										: publishNow
											? "Publish Now"
											: "Schedule Post"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showSuccessDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
						<div className="mb-4 flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
								<CheckCircle className="h-10 w-10 text-green-500" />
							</div>
						</div>
						<h3 className="mb-2 text-xl font-bold">Draft Saved!</h3>
						<p className="mb-6 text-sm text-muted-foreground">
							Your post has been saved as a draft. You can find it in your posts
							gallery.
						</p>
						<button
							onClick={() => {
								setShowSuccessDialog(false);
								setGeneratedImage(null);
								setFormData(defaultFormData);
								if (models.length > 0) {
									setFormData((prev) => ({
										...prev,
										modelId: models[0].id,
									}));
								}
							}}
							className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
						>
							Done
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
