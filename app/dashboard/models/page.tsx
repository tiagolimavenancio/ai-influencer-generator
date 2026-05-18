"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	Plus,
	Image as ImageIcon,
	Trash2,
	FileText,
	ArrowRight,
	Zap,
	Loader2,
} from "lucide-react";
import PostGallery from "@/components/dashboard/PostGallery";
import { useAuth } from "@/context/AuthContext";
import {
	getModels,
	getPosts,
	getProfile,
	deleteModel,
	Model,
	Post,
} from "@/lib/db";

export default function ModelsPage() {
	const { user, isLoading: authLoading } = useAuth();
	const [models, setModels] = useState<Model[]>([]);
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [credits, setCredits] = useState(300);
	const [isLoadingCredits, setIsLoadingCredits] = useState(true);

	useEffect(() => {
		async function loadData() {
			if (user) {
				const [modelsData, postsData, profile] = await Promise.all([
					getModels(user.id),
					getPosts(user.id),
					getProfile(user.id),
				]);
				setModels(modelsData);
				setPosts(postsData);
				if (profile) {
					setCredits(profile.credits);
				}
				setIsLoadingCredits(false);
			}
			setIsLoading(false);
		}
		if (!authLoading) {
			loadData();
		}
	}, [user, authLoading]);

	const handleDeleteModel = async (modelId: string) => {
		if (confirm("Are you sure you want to delete this model?")) {
			const success = await deleteModel(modelId);
			if (success) {
				setModels(models.filter((m) => m.id !== modelId));
			}
		}
	};

	if (authLoading || isLoading) {
		return (
			<div className="flex min-h-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">AI Studio</h1>
					<p className="mt-2 text-muted-foreground">
						Manage models and generate viral content
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

			<div className="grid gap-6 md:grid-cols-2">
				<Link
					href="/dashboard/models/create"
					className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted"
				>
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Plus className="h-6 w-6 text-primary" />
						</div>
						<div className="flex-1">
							<p className="font-medium">Create New Model</p>
							<p className="text-sm text-muted-foreground">
								Design a custom AI influencer with unique traits
							</p>
						</div>
						<div className="flex items-center gap-1 text-sm font-medium text-primary">
							<span>Get Started</span>
							<ArrowRight className="h-4 w-4" />
						</div>
					</div>
				</Link>

				<Link
					href="/dashboard/post-generator"
					className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted"
				>
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<FileText className="h-6 w-6 text-primary" />
						</div>
						<div className="flex-1">
							<p className="font-medium">Create New Post</p>
							<p className="text-sm text-muted-foreground">
								Generate high-quality social media posts
							</p>
						</div>
						<div className="flex items-center gap-1 text-sm font-medium text-primary">
							<span>Get Started</span>
							<ArrowRight className="h-4 w-4" />
						</div>
					</div>
				</Link>
			</div>

			<div className="mt-12 grid gap-12 lg:grid-cols-2">
				<div>
					<h2 className="mb-6 text-2xl font-semibold">My Models</h2>
					{models.length === 0 ? (
						<div className="rounded-lg border border-border bg-card p-12 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
								<ImageIcon className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-semibold">No models created yet</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Start by creating your first AI influencer model
							</p>
							<Link
								href="/dashboard/models/create"
								className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
							>
								<Plus className="h-4 w-4" />
								Create First Model
							</Link>
						</div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{models.map((model) => (
								<div
									key={model.id}
									className="group relative rounded-lg border border-border bg-card"
								>
									<div className="relative aspect-square">
										{model.portrait_url ? (
											<Image
												src={model.portrait_url}
												alt={model.name}
												fill
												className="object-cover"
											/>
										) : (
											<div className="flex h-full items-center justify-center bg-muted">
												<ImageIcon className="h-12 w-12 text-muted-foreground" />
											</div>
										)}
										<button
											onClick={() => handleDeleteModel(model.id)}
											className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
									<div className="p-4">
										<h3 className="font-semibold">{model.name}</h3>
										<p className="text-sm text-muted-foreground capitalize">
											{model.gender} - {model.vibe}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											Created {new Date(model.created_at).toLocaleDateString()}
										</p>
									</div>
								</div>
							))}
							<Link
								href="/dashboard/models/create"
								className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
							>
								<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
									<Plus className="h-6 w-6 text-primary" />
								</div>
								<p className="font-semibold">Create New Model</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Design a new AI influencer
								</p>
							</Link>
						</div>
					)}
				</div>

				<div>
					<h2 className="mb-6 text-2xl font-semibold">Recent Posts</h2>
					<PostGallery posts={posts} models={models} embedded />
				</div>
			</div>
		</div>
	);
}
