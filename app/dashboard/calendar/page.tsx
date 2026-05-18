"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getPosts, getModels, updatePost } from "@/lib/db";
import type { Post, Model } from "@/types/database";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CalendarIcon,
  Clock,
  Sparkles,
  ImageIcon,
  Camera,
  Video,
  MessageCircle,
  Layout,
  Building2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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



export default function CalendarPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const [scheduleDay, setScheduleDay] = useState<Date | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Post | null>(null);
  const [scheduleTime, setScheduleTime] = useState("");
  const [editableCaption, setEditableCaption] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  const modelMap = useMemo(
    () => new Map(models.map((m) => [m.id, m])),
    [models],
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getPosts(user.id), getModels(user.id)]).then(
      ([postsData, modelsData]) => {
        setPosts(postsData);
        setModels(modelsData);
        setLoading(false);
      },
    );
  }, [user]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const scheduledPosts = posts.filter(
    (p) => p.status === "scheduled" && p.scheduled_at,
  );

  const draftPosts = useMemo(
    () => posts.filter((p) => p.status === "draft"),
    [posts],
  );

  const postsByDay = new Map<string, Post[]>();
  scheduledPosts.forEach((post) => {
    const dateKey = format(parseISO(post.scheduled_at!), "yyyy-MM-dd");
    if (!postsByDay.has(dateKey)) postsByDay.set(dateKey, []);
    postsByDay.get(dateKey)!.push(post);
  });

  function goToPrevMonth() {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }

  function goToNextMonth() {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }

  function goToToday() {
    setCurrentMonth(new Date());
  }

  function openScheduleDialog(day: Date) {
    setScheduleDay(day);
    setSelectedDraft(null);
    setScheduleTime("");
    setEditableCaption("");
  }

  function closeScheduleDialog() {
    setScheduleDay(null);
    setSelectedDraft(null);
    setScheduleTime("");
    setEditableCaption("");
  }

  function selectDraft(post: Post) {
    setSelectedDraft(post);
    setEditableCaption(post.caption || "");
    setScheduleTime("");
  }

  async function handleSchedule() {
    if (!selectedDraft || !scheduleDay || !scheduleTime) return;

    const scheduledAt = `${format(scheduleDay, "yyyy-MM-dd")}T${scheduleTime}:00`;

    setIsSaving(true);
    const result = await updatePost(selectedDraft.id, {
      status: "scheduled",
      scheduled_at: scheduledAt,
      caption: editableCaption || null,
    });
    if (result) {
      setPosts((prev) =>
        prev.map((p) => (p.id === result.id ? result : p)),
      );
      closeScheduleDialog();
    }
    setIsSaving(false);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule and manage your content
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="min-w-[180px] text-center text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={goToNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Today
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="border-r border-border px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
            Loading calendar...
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {allDays.map((day, idx) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayPosts = postsByDay.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDay = isToday(day);
              const isHovered = hoveredDay && isSameDay(day, hoveredDay);

              return (
                <div
                  key={idx}
                  className={cn(
                    "relative min-h-[120px] border-b border-r border-border p-1.5 transition-colors last:border-r-0",
                    !isCurrentMonth && "bg-muted/20",
                    isTodayDay && "bg-primary/[0.03]",
                  )}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                        isTodayDay
                          ? "bg-primary font-semibold text-primary-foreground"
                          : isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {isHovered && isCurrentMonth && (
                      <button
                        onClick={() => openScheduleDialog(day)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map((post) => {
                      const model = post.model_id
                        ? modelMap.get(post.model_id)
                        : null;
                      const time = format(
                        parseISO(post.scheduled_at!),
                        "h:mm a",
                      );
                      const platformIcon = getPlatformConfig(post.platform);
                      const PlatformIcon = platformIcon.icon;
                      return (
                        <button
                          key={post.id}
                          onClick={() => {
                            setEditingPost(post);
                            setEditDate(parseISO(post.scheduled_at!));
                            setEditTime(format(parseISO(post.scheduled_at!), "HH:mm"));
                            setEditCaption(post.caption || "");
                          }}
                          className="flex w-full items-start gap-1.5 rounded-md p-1 text-left transition-colors hover:bg-muted"
                          title={
                            post.caption
                              ? `${platformIcon.label} - ${post.caption}`
                              : platformIcon.label
                          }
                        >
                          <div className="relative size-[22px] shrink-0 overflow-hidden rounded-md bg-muted">
                            {post.image_url ? (
                              <Image
                                src={post.image_url}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImageIcon className="size-2.5 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 leading-tight">
                            <div className="flex items-center gap-1 text-[10px] font-medium text-foreground">
                              <PlatformIcon
                                className={cn(
                                  "size-2.5 shrink-0",
                                  platformIcon.color === "bg-black"
                                    ? "text-foreground"
                                    : platformIcon.color.replace("bg-", "text-"),
                                )}
                              />
                              <span className="shrink-0">{time}</span>
                              <span className="truncate text-muted-foreground">
                                {platformIcon.label}
                              </span>
                            </div>
                            <div className="truncate text-[9px] text-muted-foreground">
                              {model?.name ?? "Unknown"}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {dayPosts.length > 2 && (
                      <div className="px-1 text-[10px] text-muted-foreground">
                        +{dayPosts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {scheduleDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {selectedDraft
                    ? "Schedule Post"
                    : "Select a Draft Post"}
                </h3>
              </div>
              <button
                onClick={closeScheduleDialog}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {!selectedDraft ? (
                <>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Choose a draft to schedule for{" "}
                    <span className="font-medium text-foreground">
                      {format(scheduleDay, "EEEE, MMMM d, yyyy")}
                    </span>
                  </p>

                  {draftPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Sparkles className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <h4 className="text-base font-semibold">
                        No Draft Posts
                      </h4>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Create a post in the Post Generator first, then come
                        back here to schedule it.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {draftPosts.map((post) => {
                        const platform = getPlatformConfig(post.platform);
                        const PlatformIcon = platform.icon;
                        const model = post.model_id
                          ? modelMap.get(post.model_id)
                          : null;
                        return (
                          <button
                            key={post.id}
                            onClick={() => selectDraft(post)}
                            className="group flex flex-col overflow-hidden rounded-xl border border-border text-left transition-all hover:border-primary/50 hover:shadow-md"
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
                            </div>
                            <div className="flex flex-1 flex-col gap-1 p-3">
                              <p className="line-clamp-2 text-xs text-foreground/80">
                                {post.caption || (
                                  <span className="italic text-muted-foreground">
                                    No caption
                                  </span>
                                )}
                              </p>
                              {model && (
                                <p className="text-[10px] text-muted-foreground">
                                  {model.name}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Scheduling for{" "}
                    <span className="font-medium text-foreground">
                      {format(scheduleDay, "EEEE, MMMM d, yyyy")}
                    </span>
                  </p>

                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted sm:w-1/2">
                      {selectedDraft.image_url ? (
                        <Image
                          src={selectedDraft.image_url}
                          alt={selectedDraft.caption ?? "Post image"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                      <div>
                        {(() => {
                          const platform = getPlatformConfig(
                            selectedDraft.platform,
                          );
                          const PlatformIcon = platform.icon;
                          return (
                            <div
                              className={cn(
                                "mb-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-white",
                                platform.color,
                              )}
                            >
                              <PlatformIcon className="size-3.5" />
                              {platform.label}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Caption
                        </label>
                        <textarea
                          value={editableCaption}
                          onChange={(e) => setEditableCaption(e.target.value)}
                          rows={4}
                          className="w-full resize-none rounded-lg border border-border bg-background p-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                          placeholder="Enter post caption..."
                        />
                      </div>

                      {selectedDraft.model_id && (
                        <div>
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Model
                          </p>
                          <p className="text-sm font-medium">
                            {modelMap.get(selectedDraft.model_id)?.name ??
                              "Unknown"}
                          </p>
                        </div>
                      )}

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
                                ? parseInt(
                                    scheduleTime.split(":")[1] ?? "0",
                                  )
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
                                ? parseInt(
                                    scheduleTime.split(":")[0] ?? "12",
                                  )
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

                      <div className="mt-auto flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedDraft(null)}
                          className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSchedule}
                          disabled={isSaving || !scheduleTime}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isSaving ? (
                            "Saving..."
                          ) : (
                            <>
                              <CheckCircle2 className="size-4" />
                              Schedule
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-5 text-primary" />
                <h3 className="text-lg font-semibold">Post Details</h3>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted sm:w-1/2">
                  {editingPost.image_url ? (
                    <Image
                      src={editingPost.image_url}
                      alt={editingPost.caption ?? "Post image"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <div>
                    {(() => {
                      const platform = getPlatformConfig(editingPost.platform);
                      const PlatformIcon = platform.icon;
                      return (
                        <div
                          className={cn(
                            "mb-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-white",
                            platform.color,
                          )}
                        >
                          <PlatformIcon className="size-3.5" />
                          {platform.label}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Caption
                    </label>
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-lg border border-border bg-background p-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                      placeholder="Enter post caption..."
                    />
                  </div>

                  {editingPost.model_id && (
                    <div>
                      <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Model
                      </p>
                      <p className="text-sm font-medium">
                        {modelMap.get(editingPost.model_id)?.name ??
                          "Unknown"}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CalendarIcon className="size-3.5" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={editDate ? format(editDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const d = e.target.value
                          ? parseISO(e.target.value)
                          : null;
                        setEditDate(d);
                      }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="size-3.5" />
                      Select Time
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={
                          editTime ? (editTime.split(":")[0] ?? "12") : "12"
                        }
                        onValueChange={(value) => {
                          const hour = parseInt(value ?? "12");
                          const minute = editTime
                            ? parseInt(editTime.split(":")[1] ?? "0")
                            : 0;
                          setEditTime(
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
                          editTime ? (editTime.split(":")[1] ?? "0") : "0"
                        }
                        onValueChange={(value) => {
                          const minute = parseInt(value ?? "0");
                          const hour = editTime
                            ? parseInt(editTime.split(":")[0] ?? "12")
                            : 12;
                          setEditTime(
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

                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      onClick={() => setEditingPost(null)}
                      className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!editingPost || !editDate || !editTime) return;
                        setIsEditSaving(true);
                        const scheduledAt = `${format(editDate, "yyyy-MM-dd")}T${editTime}:00`;
                        const result = await updatePost(editingPost.id, {
                          status: "scheduled",
                          scheduled_at: scheduledAt,
                          caption: editCaption || null,
                        });
                        if (result) {
                          setPosts((prev) =>
                            prev.map((p) =>
                              p.id === result.id ? result : p,
                            ),
                          );
                          setEditingPost(null);
                        }
                        setIsEditSaving(false);
                      }}
                      disabled={isEditSaving || !editDate || !editTime}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isEditSaving ? (
                        "Saving..."
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          Update Schedule
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
