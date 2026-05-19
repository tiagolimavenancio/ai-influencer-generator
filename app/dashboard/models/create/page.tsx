"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	ArrowLeft,
	Sparkles,
	User,
	Palette,
	RefreshCw,
	Zap,
	Crown,
	Eye,
	Heart,
	Smile,
	Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { OptionGrid } from "@/components/ui/OptionGrid";
import {
	createModel,
	deductCredits,
	addCredits,
	uploadModelImage,
} from "@/lib/db";

interface Option {
	id: string;
	label: string;
	emoji: string;
}

const genderOptions: Option[] = [
	{ id: "male", label: "Male", emoji: "👨" },
	{ id: "female", label: "Female", emoji: "👩" },
];

const bodyTypeOptions: Option[] = [
	{ id: "slim", label: "Slim", emoji: "✨" },
	{ id: "athletic", label: "Athletic", emoji: "💪" },
	{ id: "curvy", label: "Curvy", emoji: "🔥" },
	{ id: "average", label: "Average", emoji: "🙂" },
	{ id: "muscular", label: "Muscular", emoji: "🏋️" },
];

const skinToneOptions: Option[] = [
	{ id: "fair", label: "Fair", emoji: "🫧" },
	{ id: "light", label: "Light", emoji: "🌸" },
	{ id: "medium", label: "Medium", emoji: "☀️" },
	{ id: "tan", label: "Tan", emoji: "🌺" },
	{ id: "dark", label: "Dark", emoji: "🌙" },
	{ id: "deep", label: "Deep", emoji: "🌑" },
];

const ageRangeOptions: Option[] = [
	{ id: "18-25", label: "18-25", emoji: "🌱" },
	{ id: "26-35", label: "26-35", emoji: "🌿" },
	{ id: "36-45", label: "36-45", emoji: "🌳" },
	{ id: "46-55", label: "46-55", emoji: "🍂" },
];

const hairStyleOptions: Option[] = [
	{ id: "straight", label: "Straight", emoji: "📏" },
	{ id: "wavy", label: "Wavy", emoji: "🌊" },
	{ id: "curly", label: "Curly", emoji: "🌀" },
	{ id: "coily", label: "Coily", emoji: "🪶" },
	{ id: "bob", label: "Bob Cut", emoji: "💇" },
	{ id: "long", label: "Long", emoji: "〰️" },
	{ id: "short", label: "Short", emoji: "✂️" },
	{ id: "bun", label: "Bun", emoji: "🍡" },
];

const hairColorOptions: Option[] = [
	{ id: "black", label: "Black", emoji: "⚫" },
	{ id: "brown", label: "Brown", emoji: "🟤" },
	{ id: "blonde", label: "Blonde", emoji: "🟡" },
	{ id: "auburn", label: "Auburn", emoji: "🔴" },
	{ id: "red", label: "Red", emoji: "🔴" },
	{ id: "silver", label: "Silver", emoji: "⚪" },
	{ id: "blue", label: "Blue", emoji: "🔵" },
	{ id: "pink", label: "Pink", emoji: "🔴" },
	{ id: "purple", label: "Purple", emoji: "🟣" },
	{ id: "green", label: "Green", emoji: "🟢" },
];

const eyeColorOptions: Option[] = [
	{ id: "brown", label: "Brown", emoji: "🟤" },
	{ id: "hazel", label: "Hazel", emoji: "🌰" },
	{ id: "green", label: "Green", emoji: "🟢" },
	{ id: "blue", label: "Blue", emoji: "🔵" },
	{ id: "gray", label: "Gray", emoji: "⚫" },
	{ id: "black", label: "Black", emoji: "⚫" },
];

const vibeOptions: Option[] = [
	{ id: "friendly", label: "Friendly", emoji: "😊" },
	{ id: "professional", label: "Professional", emoji: "💼" },
	{ id: "edgy", label: "Edgy", emoji: "😈" },
	{ id: "cheerful", label: "Cheerful", emoji: "🌟" },
	{ id: "mysterious", label: "Mysterious", emoji: "🌙" },
	{ id: "elegant", label: "Elegant", emoji: "👑" },
	{ id: "bold", label: "Bold", emoji: "🔥" },
	{ id: "minimalist", label: "Minimalist", emoji: "⬜" },
	{ id: "glamorous", label: "Glamorous", emoji: "✨" },
	{ id: "natural", label: "Natural", emoji: "🌿" },
];

interface FormData {
	name: string;
	gender: string;
	bodyType: string;
	skinTone: string;
	ageRange: string;
	hairStyle: string;
	hairColor: string;
	eyeColor: string;
	vibe: string;
}

export default function CreateModelPage() {
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const { credits, setCredits, isLoadingCredits } = useCredits();
	const [formData, setFormData] = useState<FormData>({
		name: "",
		gender: "",
		bodyType: "",
		skinTone: "",
		ageRange: "",
		hairStyle: "",
		hairColor: "",
		eyeColor: "",
		vibe: "",
	});
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [generatedImages, setGeneratedImages] = useState<{
		portrait: string;
		fullBody: string;
		isMock: boolean;
	} | null>(null);
	const [autoPrompt, setAutoPrompt] = useState<string>("");
	const isTestMode = process.env.NEXT_PUBLIC_LUMA_MOCK === "true";

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/auth/sign-in");
		}
	}, [authLoading, user, router]);

	const updateFormData = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setAutoPrompt("");
	};

	const resetToAuto = () => {
		setAutoPrompt("");
	};

	const generatePrompt = () => {
		const selectedGender = genderOptions.find((g) => g.id === formData.gender);
		const selectedBodyType = bodyTypeOptions.find(
			(b) => b.id === formData.bodyType,
		);
		const selectedSkinTone = skinToneOptions.find(
			(s) => s.id === formData.skinTone,
		);
		const selectedAgeRange = ageRangeOptions.find(
			(a) => a.id === formData.ageRange,
		);
		const selectedHairStyle = hairStyleOptions.find(
			(h) => h.id === formData.hairStyle,
		);
		const selectedHairColor = hairColorOptions.find(
			(hc) => hc.id === formData.hairColor,
		);
		const selectedEyeColor = eyeColorOptions.find(
			(e) => e.id === formData.eyeColor,
		);
		const selectedVibe = vibeOptions.find((v) => v.id === formData.vibe);

		return `AI generated ${selectedGender?.label || ""} influencer, ${formData.name || "Model Name"}, ${selectedBodyType?.label || ""} ${selectedSkinTone?.label || ""} skin tone, ${selectedAgeRange?.label || ""} years old, ${selectedHairStyle?.label || ""} ${selectedHairColor?.label || ""} hair, ${selectedEyeColor?.label || ""} eyes, ${selectedVibe?.label || ""} vibe and aesthetic, high quality, professional photography, studio lighting, detailed facial features, sharp focus, 8k quality`;
	};

	const handleQuickMock = async () => {
		if (!user) return;

		if (credits < 50) {
			alert("Insufficient credits! Please purchase more credits.");
			return;
		}

		if (
			!formData.name ||
			!formData.gender ||
			!formData.bodyType ||
			!formData.skinTone ||
			!formData.ageRange ||
			!formData.hairStyle ||
			!formData.hairColor ||
			!formData.eyeColor ||
			!formData.vibe
		) {
			alert("Please fill in all options before generating.");
			return;
		}

		const seed = Math.floor(Math.random() * 1000);
		setGeneratedImages({
			portrait: `https://picsum.photos/seed/${seed}/400/500`,
			fullBody: `https://picsum.photos/seed/${seed + 1}/800/1200`,
			isMock: true,
		});
		setSaveSuccess(false);
		setCredits((prev) => prev - 50);
	};

	const handleGenerate = async () => {
		if (!user) return;

		if (credits < 50) {
			alert("Insufficient credits! Please purchase more credits.");
			return;
		}

		if (
			!formData.name ||
			!formData.gender ||
			!formData.bodyType ||
			!formData.skinTone ||
			!formData.ageRange ||
			!formData.hairStyle ||
			!formData.hairColor ||
			!formData.eyeColor ||
			!formData.vibe
		) {
			alert("Please fill in all options before generating!");
			return;
		}

		setIsGenerating(true);

		const deducted = await deductCredits(user.id, 50);
		if (!deducted) {
			setIsGenerating(false);
			alert("Insufficient credits. Please purchase more credits.");
			return;
		}

		const basePrompt = generatePrompt();
		const prompt = autoPrompt.trim() || basePrompt;

		try {
			const portraitPrompt = `${prompt}, portrait, close-up face shot, professional headshot`;
			const fullBodyPrompt = `${prompt}, full body shot, standing pose, fashion photography`;

			const [portraitResponse, fullBodyResponse] = await Promise.all([
				fetch("/api/luma/generate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ prompt: portraitPrompt }),
				}),
				fetch("/api/luma/generate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ prompt: fullBodyPrompt }),
				}),
			]);

			const [portraitData, fullBodyData] = await Promise.all([
				portraitResponse.json(),
				fullBodyResponse.json(),
			]);

			if (portraitData?.error || fullBodyData?.error) {
				throw new Error(portraitData.error || fullBodyData.error);
			}

			setGeneratedImages({
				portrait: portraitData.imageUrl,
				fullBody: fullBodyData.imageUrl,
				isMock: portraitData._mock || fullBodyData._mock || false,
			});
			setSaveSuccess(false);
			setCredits((prev) => prev - 50);
		} catch (error) {
			console.error("Generation error:", error);
			await addCredits(user.id, 50, "Refund for failed generation");
			alert("Failed to generate images. Please try again.");
		}

		setIsGenerating(false);
	};

	const handleSaveModel = async () => {
		if (!user || !generatedImages) return;

		setIsSaving(true);

		console.log("Saving model with user:", user.id);
		console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

		let portraitUrl: string;
		let fullBodyUrl: string;

		if (generatedImages.isMock) {
			console.log("Using mock images - skipping storage upload");
			portraitUrl = generatedImages.portrait;
			fullBodyUrl = generatedImages.fullBody;
		} else {
			const [portraitStorageUrl, fullBodyStorageUrl] = await Promise.all([
				uploadModelImage(user.id, generatedImages.portrait, "portrait"),
				uploadModelImage(user.id, generatedImages.fullBody, "full-body"),
			]);

			if (!portraitStorageUrl || !fullBodyStorageUrl) {
				setIsSaving(false);
				alert("Failed to upload images. Please try again.");
				return;
			}
			portraitUrl = portraitStorageUrl;
			fullBodyUrl = fullBodyStorageUrl;
		}

		const prompt = generatePrompt();
		console.log("Creating model with data:", {
			portraitUrl,
			fullBodyUrl,
			prompt,
		});

		const model = await createModel(
			user.id,
			formData,
			portraitUrl,
			fullBodyUrl,
			prompt,
		);

		if (model) {
			setSaveSuccess(true);
			router.push("/dashboard/models");
		} else {
			alert("Failed to save model. Please check console for details.");
		}
		setIsSaving(false);
	};

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
					<h1 className="text-3xl font-bold">Create New Model</h1>
					<p className="mt-2 text-muted-foreground">
						Design your AI influencer with custom traits
					</p>
				</div>
				<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
					<Zap className="h-5 w-5 text-primary" />
					{isLoadingCredits ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<>
							<span className="font-bold">{credits}</span>
							<span className="text-sm text-muted-foreground">Credits</span>
						</>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-8 lg:flex-row">
				<div className="flex-1 space-y-8">
					<div className="rounded-lg border border-border bg-card p-6">
						<div className="mb-6 flex items-center gap-2">
							<User className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold">Influencer Name</h3>
						</div>
						<div className="relative">
							<input
								type="text"
								value={formData.name}
								onChange={(e) => updateFormData("name", e.target.value)}
								placeholder="Enter your influencer name..."
								className="w-full rounded-lg border border-border bg-muted px-5 py-4 text-lg font-medium placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
							/>
							<div className="absolute right-4 top-1/2 -translate-y-1/2">
								<Sparkles className="h-5 w-5 text-muted-foreground" />
							</div>
						</div>
					</div>

					<div className="rounded-lg border border-border bg-card p-6">
						<OptionGrid
							options={genderOptions}
							selected={formData.gender}
							onSelect={(id) => updateFormData("gender", id)}
							title="Gender"
							icon={User}
						/>

						<OptionGrid
							options={bodyTypeOptions}
							selected={formData.bodyType}
							onSelect={(id) => updateFormData("bodyType", id)}
							title="Body Type"
							icon={Smile}
						/>

						<OptionGrid
							options={skinToneOptions}
							selected={formData.skinTone}
							onSelect={(id) => updateFormData("skinTone", id)}
							title="Skin Tone"
							icon={Palette}
						/>

						<OptionGrid
							options={ageRangeOptions}
							selected={formData.ageRange}
							onSelect={(id) => updateFormData("ageRange", id)}
							title="Age Range"
							icon={Crown}
						/>

						<OptionGrid
							options={hairStyleOptions}
							selected={formData.hairStyle}
							onSelect={(id) => updateFormData("hairStyle", id)}
							title="Hair Style"
							icon={Sparkles}
						/>

						<OptionGrid
							options={hairColorOptions}
							selected={formData.hairColor}
							onSelect={(id) => updateFormData("hairColor", id)}
							title="Hair Color"
							icon={Palette}
						/>

						<OptionGrid
							options={eyeColorOptions}
							selected={formData.eyeColor}
							onSelect={(id) => updateFormData("eyeColor", id)}
							title="Eye Color"
							icon={Eye}
						/>

						<OptionGrid
							options={vibeOptions}
							selected={formData.vibe}
							onSelect={(id) => updateFormData("vibe", id)}
							title="Vibe / Aesthetic"
							icon={Heart}
						/>
					</div>

					<div className="rounded-lg border border-border bg-card p-6">
						<div className="mb-4 flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-primary" />
							<h3 className="text-lg font-semibold">Prompt Preview</h3>
							{autoPrompt && (
								<button
									onClick={resetToAuto}
									className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/80"
								>
									<RefreshCw className="h-3 w-3" />
									Reset to Auto
								</button>
							)}
						</div>
						<textarea
							value={autoPrompt || generatePrompt()}
							onChange={(e) => setAutoPrompt(e.target.value)}
							placeholder="Auto-generated prompt..."
							rows={4}
							className="w-full resize-none rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
						/>
						{autoPrompt && (
							<p className="mt-2 text-xs text-muted-foreground">
								Custom prompt active. Click &ldquo;Reset to Auto&rdquo; to
								restore.
							</p>
						)}
					</div>

					<button
						onClick={handleGenerate}
						disabled={isGenerating}
						className={`w-full rounded-lg bg-primary px-6 py-5 text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${
							isGenerating ? "cursor-wait" : ""
						}`}
					>
						<div className="flex items-center justify-center gap-3">
							{isGenerating ? (
								<>
									<RefreshCw className="h-6 w-6 animate-spin" />
									<span className="text-lg font-bold">Generating...</span>
								</>
							) : (
								<>
									<Sparkles className="h-6 w-6" />
									<span className="text-lg font-bold">Generate Influencer</span>
									<div className="rounded-lg bg-white/20 px-2 py-1 text-xs font-bold">
										-50 ⚡
									</div>
								</>
							)}
						</div>
					</button>

					{isTestMode && (
						<button
							onClick={handleQuickMock}
							disabled={isGenerating}
							className={`w-full rounded-lg border-2 border-dashed border-primary bg-primary/10 px-6 py-4 text-primary shadow-sm transition-all hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
								isGenerating ? "cursor-wait" : ""
							}`}
						>
							<div className="flex items-center justify-center gap-3">
								<Zap className="h-5 w-5" />
								<span className="text-base font-bold">
									Quick Mock (Test Mode)
								</span>
								<div className="rounded-lg bg-primary/20 px-2 py-1 text-xs font-bold">
									-50 ⚡
								</div>
							</div>
						</button>
					)}
				</div>

				<div className="w-full space-y-6 lg:w-[400px]">
					<div className="sticky top-8 space-y-6">
						<div className="rounded-lg border border-border bg-card p-6">
							<div className="mb-4 flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-primary" />
								<h3 className="text-lg font-semibold">Ready to Visualize</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								Configure your options and click generate to see results
							</p>
						</div>

						{generatedImages && (
							<div className="rounded-lg border border-border bg-card p-6">
								<div className="mb-4 flex items-center gap-2">
									<Eye className="h-5 w-5 text-primary" />
									<h3 className="text-lg font-semibold">Generated Preview</h3>
								</div>
								<div className="space-y-4">
									<div className="relative overflow-hidden rounded-lg">
										<div className="absolute -left-4 -top-4 z-10 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
											<span className="text-xs font-bold">Portrait</span>
										</div>
										<Image
											src={generatedImages.portrait}
											alt="Portrait of generated influencer"
											width={400}
											height={192}
											className="h-48 w-full object-cover"
										/>
									</div>
									<div className="relative overflow-hidden rounded-lg">
										<div className="absolute -left-4 -top-4 z-10 flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg">
											<span className="text-xs font-bold">Full Body</span>
										</div>
										<Image
											src={generatedImages.fullBody}
											alt="Full body of generated influencer"
											width={400}
											height={256}
											className="h-64 w-full object-cover"
										/>
									</div>
								</div>
								<div className="mt-4 space-y-3">
									<button
										onClick={handleSaveModel}
										disabled={isSaving}
										className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
											saveSuccess
												? "bg-green-500 text-white hover:bg-green-600"
												: "bg-primary text-primary-foreground hover:bg-primary/90"
										}`}
									>
										{saveSuccess
											? "✓ Saved Successfully"
											: isSaving
												? "Saving..."
												: "Save AI Model to Studio"}
									</button>
									{saveSuccess && (
										<p className="text-center text-xs text-muted-foreground">
											Your model is now available in the Studio Gallery
										</p>
									)}
								</div>
							</div>
						)}

						{credits < 50 && (
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
											Purchase more to continue generating
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
		</div>
	);
}
