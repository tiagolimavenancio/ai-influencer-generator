import Link from 'next/link'
import {
  Package,
  Calendar,
  Users,
  Eye,
  Bot,
  Sparkles,
  Clock,
} from 'lucide-react'

export default function DashboardPage() {
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
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground">
                Start creating content to see your activity here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}