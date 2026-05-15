import Link from "next/link";
import {
	Package,
	Calendar,
	Users,
	Eye,
	Bot,
	Sparkles,
	Clock,
	Plus,
	Image as ImageIcon,
} from "lucide-react";
import { getModels } from "@/lib/db";
import Image from "next/image";

export default async function DashboardPage() {
	let models: import("@/types/database").Model[] = [];
	try {
		const { createServerClient } = await import("@supabase/ssr");
		const { cookies } = await import("next/headers");
		const cookieStore = await cookies();
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						try {
							cookiesToSet.forEach(({ name, value, options }) =>
								cookieStore.set(name, value, options),
							);
						} catch {}
					},
				},
			},
		);
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (user) {
			const { getModels: fetchModels } = await import("@/lib/db");
			models = await fetchModels(user.id);
		}
	} catch {}

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
							<p className="mt-1 text-3xl font-bold">0</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Package className="h-6 w-6 text-primary" />
						</div>
					</div>
					<p className="mt-4 text-sm text-muted-foreground">
						No content created yet
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Scheduled Posts</p>
							<p className="mt-1 text-3xl font-bold">0</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Calendar className="h-6 w-6 text-primary" />
						</div>
					</div>
					<p className="mt-4 text-sm text-muted-foreground">
						No posts scheduled
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
							href="/dashboard/studio"
							className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<Sparkles className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-medium">Open Studio</p>
								<p className="text-sm text-muted-foreground">Create content</p>
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

			<div className="mt-8 rounded-lg border border-border bg-card p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Studio Gallery</h2>
					<Link
						href="/dashboard/models/create"
						className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
					>
						<Plus className="h-3 w-3" />
						Create Model
					</Link>
				</div>
				{models.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
							<Sparkles className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold">No AI Models Yet</h3>
						<p className="mt-2 max-w-md text-sm text-muted-foreground">
							Start creating your AI influencer models. Each model is unique and
							customizable to match your brand.
						</p>
						<Link
							href="/dashboard/models/create"
							className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
						>
							<Plus className="h-4 w-4" />
							Create Your First Model
						</Link>
					</div>
				) : (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{models.map((model) => (
							<div
								key={model.id}
								className="group relative overflow-hidden rounded-lg border border-border bg-card"
							>
								<div className="relative aspect-square">
									{model.portrait_url ? (
										<Image
											src={model.portrait_url}
											alt={model.name}
											fill
											className="object-cover transition-transform group-hover:scale-105"
										/>
									) : (
										<div className="flex h-full items-center justify-center bg-muted">
											<ImageIcon className="h-12 w-12 text-muted-foreground" />
										</div>
									)}
								</div>
								<div className="p-4">
									<h3 className="font-semibold">{model.name}</h3>
									<p className="text-sm capitalize text-muted-foreground">
										{model.gender} - {model.vibe}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{new Date(model.created_at).toLocaleDateString()}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
