"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Sparkles, 
  Image as ImageIcon, 
  Zap,
  Loader2,
  Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getModels, getProfile, createPost, deductCredits, Model } from "@/lib/db";

const platformOptions = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "twitter", label: "Twitter/X", emoji: "🐦" },
  { id: "linkedin", label: "LinkedIn", emoji: "💼" },
];

const toneOptions = [
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "inspirational", label: "Inspirational", emoji: "🌟" },
  { id: "educational", label: "Educational", emoji: "📚" },
  { id: "promotional", label: "Promotional", emoji: "📢" },
];

interface FormData {
  modelId: string;
  content: string;
  platform: string;
  tone: string;
  scheduledAt: string;
}

export default function PostGeneratorPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [formData, setFormData] = useState<FormData>({
    modelId: "",
    content: "",
    platform: "instagram",
    tone: "casual",
    scheduledAt: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [credits, setCredits] = useState(300);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user) {
        const [modelsData, profile] = await Promise.all([
          getModels(user.id),
          getProfile(user.id)
        ]);
        setModels(modelsData);
        if (profile) {
          setCredits(profile.credits);
        }
        if (modelsData.length > 0) {
          setFormData(prev => ({ ...prev, modelId: modelsData[0].id }));
        }
      }
      setIsLoadingModels(false);
      setIsLoadingCredits(false);
    }
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const handleGenerate = async () => {
    if (!user) return;

    if (!formData.modelId) {
      alert("Please select a model first!");
      return;
    }

    if (credits < 10) {
      alert("Insufficient credits! Please purchase more credits.");
      return;
    }

    if (!formData.content.trim()) {
      alert("Please enter some content for the post!");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setGeneratedImage(
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop"
    );

    const deducted = await deductCredits(user.id, 10);
    if (!deducted) {
      setGeneratedImage(null);
      setIsGenerating(false);
      alert("Failed to deduct credits. Please try again.");
      return;
    }

    setCredits((prev) => prev - 10);

    setIsGenerating(false);
  };

  const handleSavePost = async () => {
    if (!user || !generatedImage) return;

    setIsSaving(true);
    const post = await createPost(
      user.id,
      formData.modelId,
      formData.content,
      generatedImage,
      formData.platform,
      formData.scheduledAt || undefined
    );

    if (post) {
      alert("Post saved successfully!");
      setGeneratedImage(null);
      setFormData(prev => ({ ...prev, content: "" }));
    } else {
      alert("Failed to save post. Please try again.");
    }
    setIsSaving(false);
  };

  const generateContent = () => {
    const model = models.find(m => m.id === formData.modelId);
    if (!model) return "";

    const templates = {
      professional: `Check out our latest content featuring ${model.name}! 🌟 #AIInfluencer #ContentCreator`,
      casual: `Hey everyone! ✨ Just wanted to share this amazing content with ${model.name} 🎉 #AI #Influencer`,
      funny: `When the AI does the work 😂 Meet ${model.name} who's killing it! 💯 #Funny #AIInfluencer`,
      inspirational: `Dreams become reality with AI! 🌈 ${model.name} is proof that anything is possible! #Motivation #AI`,
      educational: `Did you know? AI is revolutionizing content creation! Learn with ${model.name} 📚 #EdTech #AI`,
      promotional: `🚀 NEW CONTENT ALERT! ${model.name} is here to elevate your feed! Get yours now! 🔥 #Promo #Trending`,
    };

    return templates[formData.tone as keyof typeof templates] || templates.casual;
  };

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
            <p className="mt-2 text-muted-foreground">Create engaging posts with your AI influencers</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No Models Available</h3>
          <p className="mt-2 max-w-md text-muted-foreground">
            You need to create at least one AI influencer model before generating posts.
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
          <p className="mt-2 text-muted-foreground">Create engaging posts with your AI influencers</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-bold">{credits}</span>
          <span className="text-sm text-muted-foreground">Credits</span>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Select Model</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setFormData(prev => ({ ...prev, modelId: model.id }))}
                  className={`relative overflow-hidden rounded-lg border-2 p-3 transition-all ${
                    formData.modelId === model.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {model.portrait_url && (
                    <Image
                      src={model.portrait_url}
                      alt={model.name}
                      width={100}
                      height={100}
                      className="mx-auto mb-2 h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <p className="text-sm font-medium">{model.name}</p>
                  {formData.modelId === model.id && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Post Content</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Platform</label>
                <div className="flex flex-wrap gap-3">
                  {platformOptions.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                      className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                        formData.platform === platform.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span>{platform.emoji}</span>
                      <span>{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setFormData(prev => ({ ...prev, tone: tone.id }))}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        formData.tone === tone.id
                          ? "bg-primary/10 text-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {tone.emoji} {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">Caption</label>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, content: generateContent() }))}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    ✨ Generate with AI
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post caption..."
                  rows={4}
                  className="w-full rounded-lg border border-border bg-muted p-4 placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  <Clock className="mr-2 inline h-4 w-4" />
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-3 transition-all focus:border-primary focus:bg-background focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-6 lg:w-[400px]">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Preview</h3>
              <div className="overflow-hidden rounded-lg border border-border">
                {generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt="Generated post"
                    width={400}
                    height={400}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="bg-card p-4">
                  <p className="text-sm line-clamp-3">
                    {formData.content || "Your caption will appear here..."}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || credits < 10}
              className={`w-full rounded-lg bg-primary px-6 py-5 text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${
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
                      -10 ⚡
                    </div>
                  </>
                )}
              </div>
            </button>

            {generatedImage && (
              <div className="flex gap-3">
                <button
                  onClick={handleSavePost}
                  disabled={isSaving}
                  className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Post"}
                </button>
                <button
                  onClick={() => {
                    setGeneratedImage(null);
                    setFormData(prev => ({ ...prev, content: "" }));
                  }}
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Clear
                </button>
              </div>
            )}

            {credits < 10 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Low Credits!</h4>
                    <p className="text-sm text-yellow-700">Need more to generate posts</p>
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