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
  Check,
  Crown,
  Eye,
  Heart,
  Smile,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProfile, createModel, deductCredits } from "@/lib/db";

interface Option {
  id: string;
  label: string;
  emoji: string;
}

interface OptionGridProps {
  options: Option[];
  selected: string;
  onSelect: (id: string) => void;
  title: string;
  icon: React.ElementType;
}

function OptionGrid({ options, selected, onSelect, title, icon: Icon }: OptionGridProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`group relative overflow-hidden rounded-lg border-2 p-4 transition-all hover:shadow-md ${
              selected === option.id
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="relative z-10">
              <div className="mb-2 text-2xl">{option.emoji}</div>
              <div className={`text-sm font-medium ${selected === option.id ? "text-primary" : ""}`}>
                {option.label}
              </div>
              {selected === option.id && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
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
  const [generatedImages, setGeneratedImages] = useState<{ portrait: string; fullBody: string } | null>(null);
  const [credits, setCredits] = useState(300);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function loadCredits() {
      if (user) {
        const profile = await getProfile(user.id);
        if (profile) {
          setCredits(profile.credits);
        }
        setIsLoadingCredits(false);
      }
    }
    loadCredits();
  }, [user]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatePrompt = () => {
    const selectedGender = genderOptions.find((g) => g.id === formData.gender);
    const selectedBodyType = bodyTypeOptions.find((b) => b.id === formData.bodyType);
    const selectedSkinTone = skinToneOptions.find((s) => s.id === formData.skinTone);
    const selectedAgeRange = ageRangeOptions.find((a) => a.id === formData.ageRange);
    const selectedHairStyle = hairStyleOptions.find((h) => h.id === formData.hairStyle);
    const selectedHairColor = hairColorOptions.find((hc) => hc.id === formData.hairColor);
    const selectedEyeColor = eyeColorOptions.find((e) => e.id === formData.eyeColor);
    const selectedVibe = vibeOptions.find((v) => v.id === formData.vibe);

    return `AI generated ${selectedGender?.label || ""} influencer, ${formData.name || "Model Name"}, ${selectedBodyType?.label || ""} ${selectedSkinTone?.label || ""} skin tone, ${selectedAgeRange?.label || ""} years old, ${selectedHairStyle?.label || ""} ${selectedHairColor?.label || ""} hair, ${selectedEyeColor?.label || ""} eyes, ${selectedVibe?.label || ""} vibe and aesthetic, high quality, professional photography, studio lighting, detailed facial features, sharp focus, 8k quality`;
  };

  const handleGenerate = async () => {
    if (!user) return;

    if (credits < 50) {
      alert("Insufficient credits! Please purchase more credits.");
      return;
    }

    if (!formData.name || !formData.gender || !formData.bodyType || !formData.skinTone || 
        !formData.ageRange || !formData.hairStyle || !formData.hairColor || !formData.eyeColor || !formData.vibe) {
      alert("Please fill in all options before generating!");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const deducted = await deductCredits(user.id, 50);
    if (!deducted) {
      setIsGenerating(false);
      alert("Failed to deduct credits. Please try again.");
      return;
    }

    setCredits((prev) => prev - 50);
    setGeneratedImages({
      portrait: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      fullBody: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
    });

    setIsGenerating(false);
  };

  const handleSaveModel = async () => {
    if (!user || !generatedImages) return;

    setIsSaving(true);
    const prompt = generatePrompt();
    const model = await createModel(
      user.id,
      formData,
      generatedImages.portrait,
      generatedImages.fullBody,
      prompt
    );

    if (model) {
      router.push('/dashboard/models');
    } else {
      alert("Failed to save model. Please try again.");
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
          <p className="mt-2 text-muted-foreground">Design your AI influencer with custom traits</p>
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

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Prompt Preview</h3>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="font-mono text-xs leading-relaxed">
                  {generatePrompt()}
                </p>
              </div>
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
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={handleSaveModel}
                    disabled={isSaving}
                    className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Model"}
                  </button>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || credits < 50}
                    className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    Regenerate
                  </button>
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
                    <h4 className="font-semibold text-yellow-800">Low Credits!</h4>
                    <p className="text-sm text-yellow-700">Purchase more to continue generating</p>
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