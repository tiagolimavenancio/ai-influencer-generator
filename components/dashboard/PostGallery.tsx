"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
	Calendar,
	Clock,
	Image as ImageIcon,
	X,
	CheckCircle,
	Camera,
	Video,
	MessageCircle,
	Layout,
	Building2,
	Sparkles,
	ChevronLeft,
	ChevronRight,
	FileText,
	Send,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Post, Model } from "@/types/database";
import { updatePost } from "@/lib/db";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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

const POSTS_PER_PAGE = 8;

const platformConfig: Record<
	string,
	{ icon: typeof Camera; color: string; label: string }
> = {
	instagram: { icon: Camera, color: "bg-pink-500", label: "Instagram" },
	tiktok: { icon: Video, color: "bg-black", label: "TikTok" },
	twitter: { icon: MessageCircle, color: "bg-black", label: "X" },
	linkedin: { icon: Building2, color: "bg-blue-600", label: "LinkedIn" },
	pinterest: { icon: Layout, color: "bg-red-500", label: "Pinterest" },
	facebook: { icon: MessageCircle, color: "bg-blue-500", label: "Facebook" },
};

function getPlatformConfig(platform: string) {
	return (
		platformConfig[platform.toLowerCase()] ?? {
			icon: FileText,
			color: "bg-muted-foreground",
			label: platform,
		}
	);
}

export default function PostGallery({
	posts,
	models,
	embedded = false,
}: {
	posts: Post[];
	models: Model[];
	embedded?: boolean;
}) {
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
	const [scheduleTime, setScheduleTime] = useState("");
	const [publishNow, setPublishNow] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const modelMap = useMemo(
		() => new Map(models.map((m) => [m.id, m])),
		[models],
	);

	const filteredPosts = useMemo(
		() => posts.filter((p) => p.status === "draft" || p.status === "scheduled"),
		[posts],
	);

	const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
	const paginatedPosts = filteredPosts.slice(
		(currentPage - 1) * POSTS_PER_PAGE,
		currentPage * POSTS_PER_PAGE,
	);

	function openDetail(post: Post) {
		setSelectedPost(post);
	}

	function closeDetail() {
		setSelectedPost(null);
		setShowScheduleModal(false);
	}

	function openScheduleForPost(post: Post) {
		const existingDate = post.scheduled_at
			? new Date(post.scheduled_at)
			: undefined;
		setScheduleDate(existingDate);
		setScheduleTime(
			existingDate
				? `${existingDate.getHours().toString().padStart(2, "0")}:${existingDate.getMinutes().toString().padStart(2, "0")}`
				: "",
		);
		setPublishNow(false);
		setShowScheduleModal(true);
	}

	async function handleSaveSchedule() {
		if (!selectedPost) return;

		const scheduledAt = publishNow
			? new Date().toISOString()
			: scheduleDate && scheduleTime
				? `${format(scheduleDate, "yyyy-MM-dd")}T${scheduleTime}:00`
				: null;

		if (!publishNow && !scheduledAt) return;

		setIsSaving(true);
		const result = await updatePost(selectedPost.id, {
			status: publishNow ? "published" : "scheduled",
			scheduled_at: scheduledAt,
		});
		if (result) {
			setSelectedPost(result);
			setShowScheduleModal(false);
		}
		setIsSaving(false);
	}

	async function handleMoveToDraft() {
		if (!selectedPost) return;
		setIsSaving(true);
		const result = await updatePost(selectedPost.id, {
			status: "draft",
			scheduled_at: null,
		});
		if (result) {
			setSelectedPost(result);
		}
		setIsSaving(false);
	}

	const renderPageNumbers = () => {
		const pages: React.ReactNode[] = [];
		const maxVisible = 5;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);
		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		if (start > 1) {
			pages.push(
				<button
					key={1}
					onClick={() => setCurrentPage(1)}
					className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
				>
					1
				</button>,
			);
			if (start > 2) {
				pages.push(
					<span key="dots-start" className="px-1 text-xs text-muted-foreground">
						...
					</span>,
				);
			}
		}

		for (let i = start; i <= end; i++) {
			pages.push(
				<button
					key={i}
					onClick={() => setCurrentPage(i)}
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
						i === currentPage
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:bg-muted",
					)}
				>
					{i}
				</button>,
			);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) {
				pages.push(
					<span key="dots-end" className="px-1 text-xs text-muted-foreground">
						...
					</span>,
				);
			}
			pages.push(
				<button
					key={totalPages}
					onClick={() => setCurrentPage(totalPages)}
					className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
				>
					{totalPages}
				</button>,
			);
		}

		return pages;
	};

	if (filteredPosts.length === 0) {
		if (embedded) return null;
		return (
			<div className="mt-8 rounded-lg border border-border bg-card p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Recent Posts</h2>
				</div>
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<Sparkles className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold">No Posts Yet</h3>
					<p className="mt-2 max-w-md text-sm text-muted-foreground">
						Generate and save your first post from the Studio. Drafts and
						scheduled posts will appear here.
					</p>
				</div>
			</div>
		);
	}

	const gridContent = (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{paginatedPosts.map((post) => {
					const platform = getPlatformConfig(post.platform);
					const PlatformIcon = platform.icon;
					const model = post.model_id ? modelMap.get(post.model_id) : null;
					return (
						<button
							key={post.id}
							onClick={() => openDetail(post)}
							className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-all hover:border-primary/50 hover:shadow-md"
						>
							<div className="relative aspect-[4/3] overflow-hidden bg-muted">
								{post.image_url ? (
									<Image
										src={post.image_url}
										alt={post.caption ?? "Post image"}
										fill
										className="object-cover transition-transform group-hover:scale-105"
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										<ImageIcon className="h-10 w-10 text-muted-foreground/50" />
									</div>
								)}

								<div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-xs">
									<PlatformIcon className="size-3" />
									{platform.label}
								</div>

								<div
									className={cn(
										"absolute right-2 top-2 rounded-md px-2 py-1 text-[10px] font-semibold",
										post.status === "draft"
											? "bg-yellow-500/80 text-yellow-950"
											: "bg-blue-500/80 text-white",
									)}
								>
									{post.status === "draft" ? "Draft" : "Scheduled"}
								</div>

								{post.scheduled_at && (
									<div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-xs">
										<Calendar className="size-3" />
										{format(new Date(post.scheduled_at), "MMM d, yyyy")}
									</div>
								)}
							</div>

							<div className="flex flex-1 flex-col gap-1 p-3">
								<p className="line-clamp-2 text-xs text-foreground/80">
									{post.caption || "No caption"}
								</p>
								{model && (
									<p className="text-[10px] text-muted-foreground">
										{model.name}
									</p>
								)}
								<p className="mt-auto text-[10px] text-muted-foreground">
									{format(new Date(post.created_at), "MMM d, yyyy")}
								</p>
							</div>
						</button>
					);
				})}
			</div>

			{totalPages > 1 && (
				<div className="mt-6 flex items-center justify-center gap-1">
					<button
						onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
					>
						<ChevronLeft className="size-4" />
					</button>
					{renderPageNumbers()}
					<button
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			)}

			{selectedPost && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:flex-row">
						<div className="relative flex aspect-[4/3] w-full items-center justify-center bg-muted sm:w-1/2 sm:aspect-auto">
							{selectedPost.image_url ? (
								<Image
									src={selectedPost.image_url}
									alt={selectedPost.caption ?? "Post image"}
									fill
									className="object-cover"
								/>
							) : (
								<ImageIcon className="h-16 w-16 text-muted-foreground/50" />
							)}

							<button
								onClick={closeDetail}
								className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition-colors hover:bg-black/70"
							>
								<X className="size-4" />
							</button>
						</div>

						<div className="flex w-full flex-col gap-4 p-6 sm:w-1/2">
							<div className="flex items-center gap-2">
								{(() => {
									const platform = getPlatformConfig(selectedPost.platform);
									const PlatformIcon = platform.icon;
									return (
										<div
											className={cn(
												"flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-white",
												platform.color,
											)}
										>
											<PlatformIcon className="size-3.5" />
											{platform.label}
										</div>
									);
								})()}

								<span
									className={cn(
										"rounded-md px-2 py-1 text-[10px] font-semibold",
										selectedPost.status === "draft"
											? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
											: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
									)}
								>
									{selectedPost.status === "draft" ? "Draft" : "Scheduled"}
								</span>
							</div>

							<div className="flex-1 space-y-3">
								<div>
									<p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
										Caption
									</p>
									<p className="text-sm leading-relaxed">
										{selectedPost.caption || (
											<span className="italic text-muted-foreground">
												No caption
											</span>
										)}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
											Model
										</p>
										<p className="text-xs font-medium">
											{selectedPost.model_id
												? (modelMap.get(selectedPost.model_id)?.name ??
													"Unknown")
												: "—"}
										</p>
									</div>
									<div>
										<p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
											Created
										</p>
										<p className="text-xs">
											{format(new Date(selectedPost.created_at), "MMM d, yyyy")}
										</p>
									</div>
								</div>

								{selectedPost.scheduled_at && (
									<div>
										<p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
											Scheduled
										</p>
										<p className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
											<Calendar className="size-3.5" />
											{format(
												new Date(selectedPost.scheduled_at),
												"MMM d, yyyy 'at' h:mm a",
											)}
										</p>
									</div>
								)}
							</div>

							{!showScheduleModal ? (
								<div className="flex flex-col gap-2">
									{selectedPost.status === "draft" && (
										<button
											onClick={() => openScheduleForPost(selectedPost)}
											className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
										>
											<Calendar className="size-4" />
											Schedule Post
										</button>
									)}
									{selectedPost.status === "scheduled" && (
										<>
											<button
												onClick={() => openScheduleForPost(selectedPost)}
												className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
											>
												<Calendar className="size-4" />
												Edit Schedule
											</button>
											<button
												onClick={handleMoveToDraft}
												disabled={isSaving}
												className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
											>
												<FileText className="size-4" />
												Move to Draft
											</button>
										</>
									)}
									<button
										onClick={closeDetail}
										className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
									>
										Close
									</button>
								</div>
							) : (
								<div className="space-y-4">
									<div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
										<div className="flex items-center gap-2">
											<Send className="size-4 text-green-500" />
											<span className="text-sm font-medium">
												{selectedPost.status === "draft"
													? "Publish Now"
													: "Update & Publish Now"}
											</span>
										</div>
										<button
											onClick={() => setPublishNow(!publishNow)}
											className={cn(
												"relative h-6 w-12 rounded-full transition-colors",
												publishNow ? "bg-primary" : "bg-muted-foreground/40",
											)}
											type="button"
											aria-pressed={publishNow}
										>
											<span
												className={cn(
													"absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
													publishNow && "translate-x-6",
												)}
											/>
										</button>
									</div>

									{!publishNow && (
										<div className="space-y-3">
											<div className="space-y-1.5">
												<label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
													<Calendar className="size-3.5" />
													Select Date
												</label>
												<Popover>
													<PopoverTrigger
														className={cn(
															"w-full flex items-center justify-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted",
															!scheduleDate && "text-muted-foreground",
														)}
													>
														<Calendar className="size-4" />
														{scheduleDate
															? format(scheduleDate, "PPP")
															: "Choose a date"}
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0">
														<CalendarComponent
															mode="single"
															selected={scheduleDate}
															onSelect={setScheduleDate}
															disabled={(date) => date < new Date()}
														/>
													</PopoverContent>
												</Popover>
											</div>

											<div className="space-y-1.5">
												<label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
													<Clock className="size-3.5" />
													Select Time
												</label>
												<div className="flex items-center gap-2">
													<Select
														value={
															scheduleTime
																? (scheduleTime.split(":")[0] ?? "12")
																: "12"
														}
														onValueChange={(value) => {
															const hour = parseInt(value ?? "12");
															const minute = scheduleTime
																? parseInt(scheduleTime.split(":")[1] ?? "0")
																: 0;
															setScheduleTime(
																`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
															);
														}}
													>
														<SelectTrigger className="flex-1">
															<SelectValue placeholder="Hour" />
														</SelectTrigger>
														<SelectContent>
															{Array.from({ length: 24 }, (_, i) => (
																<SelectItem key={i} value={i.toString()}>
																	{i.toString().padStart(2, "0")}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<span className="text-sm font-medium text-muted-foreground">
														:
													</span>
													<Select
														value={
															scheduleTime
																? (scheduleTime.split(":")[1] ?? "0")
																: "0"
														}
														onValueChange={(value) => {
															const minute = parseInt(value ?? "0");
															const hour = scheduleTime
																? parseInt(scheduleTime.split(":")[0] ?? "12")
																: 12;
															setScheduleTime(
																`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
															);
														}}
													>
														<SelectTrigger className="flex-1">
															<SelectValue placeholder="Min" />
														</SelectTrigger>
														<SelectContent>
															{Array.from({ length: 60 }, (_, i) => (
																<SelectItem key={i} value={i.toString()}>
																	{i.toString().padStart(2, "0")}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
									)}

									<div className="flex gap-2">
										<button
											onClick={() => setShowScheduleModal(false)}
											className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
										>
											Back
										</button>
										<button
											onClick={handleSaveSchedule}
											disabled={isSaving}
											className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
										>
											{isSaving
												? "Saving..."
												: publishNow
													? "Publish Now"
													: selectedPost.status === "draft"
														? "Schedule"
														: "Update Schedule"}
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);

	if (embedded) return gridContent;

	return (
		<div className="mt-8 rounded-lg border border-border bg-card p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Recent Posts</h2>
				<span className="text-xs text-muted-foreground">
					{filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
				</span>
			</div>
			{gridContent}
		</div>
	);
}
