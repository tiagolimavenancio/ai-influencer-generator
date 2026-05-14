"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
	Home,
	Sparkles,
	Calendar,
	FolderOpen,
	Users,
	Settings,
	Zap,
	LogOut,
} from "lucide-react";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: Home },
	{ href: "/dashboard/models", label: "Models/Studio", icon: Sparkles },
	{
		href: "/dashboard/post-generator",
		label: "Post Generator",
		icon: FolderOpen,
	},
	{ href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
	{ href: "/dashboard/accounts", label: "Social Accounts", icon: Users },
	{ href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
	const pathname = usePathname();
	const { user, signOut } = useAuth();

	const handleSignOut = () => {
		signOut();
		window.location.href = "/";
	};

	return (
		<aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
			<div className="flex items-center gap-3 border-b border-border px-6 py-5">
				<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<Zap className="h-5 w-5" />
				</div>
				<span className="text-lg font-bold">InfluencerAI</span>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-4">
				<ul className="space-y-1">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/dashboard" && pathname.startsWith(item.href));
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground"
									}`}
								>
									<item.icon className="h-5 w-5" />
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="border-t border-border p-4">
				<div className="mb-3 flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
						{user?.email?.charAt(0).toUpperCase() || "U"}
					</div>
					<div className="flex-1 overflow-hidden">
						<p className="truncate text-sm font-medium">
							{user?.user_metadata?.full_name || user?.email || "User"}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							{user?.email}
						</p>
					</div>
				</div>
				<button
					onClick={handleSignOut}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<LogOut className="h-5 w-5" />
					Sign Out
				</button>
			</div>
		</aside>
	);
}
