import Link from "next/link";
import {
	Package,
	Calendar,
	Users,
	Eye,
	Bot,
	Sparkles,
	Plus,
	Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import PostGallery from "@/components/dashboard/PostGallery";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	let models: import("@/types/database").Model[] = [];
	let posts: import("@/types/database").Post[] = [];
	if (user) {
		const [modelsResult, postsResult] = await Promise.all([
			supabase.from("models").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
			supabase.from("posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
		]);
		models = modelsResult.data || [];
		posts = postsResult.data || [];
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="mt-2 text-muted-foreground">
					Welcome to your AI Influencer Generator dashboard
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Total Content</p>
							<p className="mt-1 text-3xl font-bold">
								{
									posts.filter(
										(p) => p.status === "draft" || p.status === "scheduled",
									).length
								}
							</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Package className="h-6 w-6 text-primary" />
						</div>
					</div>
					<p className="mt-4 text-sm text-muted-foreground">
						{posts.filter(
							(p) => p.status === "draft" || p.status === "scheduled",
						).length === 0
							? "No content created yet"
							: "Drafts and scheduled posts"}
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Scheduled Posts</p>
							<p className="mt-1 text-3xl font-bold">
								{posts.filter((p) => p.status === "scheduled").length}
							</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Calendar className="h-6 w-6 text-primary" />
						</div>
					</div>
					<p className="mt-4 text-sm text-muted-foreground">
						{posts.filter((p) => p.status === "scheduled").length === 0
							? "No posts scheduled"
							: "Awaiting publication"}
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">
								Connected Accounts
							</p>
							<p className="mt-1 text-3xl font-bold">0</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Users className="h-6 w-6 text-primary" />
						</div>
					</div>
					<p className="mt-4 text-sm text-muted-foreground">
						Connect your social accounts
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Total Views</p>
							<p className="mt-1 text-3xl font-bold">0</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Eye className="h-6 w-6 text-primary" />
						</div>
					</div>
					<p className="mt-4 text-sm text-muted-foreground">
						Track your content performance
					</p>
				</div>
			</div>

			<div className="mt-8 grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border border-border bg-card p-6">
					<h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
					<div className="grid gap-4 sm:grid-cols-2">
						<Link
							href="/dashboard/models"
							className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<Bot className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">Create New Model</p>
								<p className="text-sm text-muted-foreground">
									Generate AI influencer
								</p>
							</div>
						</Link>
						<Link
							href="/dashboard/post-generator"
							className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<Sparkles className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">Create Post</p>
								<p className="text-sm text-muted-foreground">Generate content</p>
							</div>
						</Link>
						<Link
							href="/dashboard/calendar"
							className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<Calendar className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">Schedule Post</p>
								<p className="text-sm text-muted-foreground">
									Plan your content
								</p>
							</div>
						</Link>
						<Link
							href="/dashboard/accounts"
							className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<Users className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">Connect Account</p>
								<p className="text-sm text-muted-foreground">
									Link social media
								</p>
							</div>
						</Link>
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card p-6">
					<h2 className="mb-4 text-lg font-semibold">My Models</h2>
					{models.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<ImageIcon className="h-6 w-6 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">No models yet</p>
							<Link
								href="/dashboard/models/create"
								className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
							>
								<Plus className="h-3 w-3" />
								Create First Model
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-3 gap-3">
							{models.slice(0, 6).map((model) => (
								<Link
									key={model.id}
									href="/dashboard/models"
									className="group relative overflow-hidden rounded-lg"
								>
									<div className="aspect-square">
										{model.portrait_url ? (
											<Image
												src={model.portrait_url}
												alt={model.name}
												fill
												className="object-cover transition-transform group-hover:scale-105"
											/>
										) : (
											<div className="flex h-full items-center justify-center bg-muted">
												<ImageIcon className="h-6 w-6 text-muted-foreground" />
											</div>
										)}
									</div>
									<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
										<p className="text-xs font-medium text-white">
											{model.name}
										</p>
									</div>
								</Link>
							))}
							{models.length > 6 && (
								<Link
									href="/dashboard/models"
									className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted"
								>
									+{models.length - 6} more
								</Link>
							)}
						</div>
					)}
				</div>
			</div>

			<PostGallery posts={posts} models={models} />
		</div>
	);
}
