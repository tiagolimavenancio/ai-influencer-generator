"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export default function SignInPage() {
	const router = useRouter();
	const { user, isLoading: authLoading } = useAuth();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const supabase = useMemo(() => {
		if (typeof window === "undefined") return null;
		return createClient();
	}, []);

	useEffect(() => {
		if (!authLoading && user) {
			router.push("/dashboard");
		}
	}, [user, authLoading, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!supabase) return;

		setError(null);
		setMessage(null);
		setLoading(true);

		try {
			if (isSignUp) {
				const { data, error: signUpError } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							full_name: fullName,
						},
					},
				});

				if (signUpError) throw signUpError;

				if (data.user) {
					const { error: profileError } = await supabase
						.from("profiles")
						.insert({
							id: data.user.id,
							email: data.user.email,
							full_name: fullName,
						});

					if (profileError) {
						console.error("Profile creation error:", profileError);
					}
				}

				setMessage("Check your email for the confirmation link!");
			} else {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email,
					password,
				});

				if (signInError) throw signInError;

				router.push("/dashboard");
				router.refresh();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthSignIn = async (provider: "google" | "github") => {
		if (!supabase) return;

		setError(null);
		setLoading(true);

		try {
			await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (authLoading || !supabase) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold">
						{isSignUp ? "Create your account" : "Welcome back"}
					</h1>
					<p className="mt-2 text-muted-foreground">
						{isSignUp
							? "Start creating AI-powered content"
							: "Sign in to continue creating"}
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
					<div className="space-y-4">
						<button
							onClick={() => handleOAuthSignIn("google")}
							disabled={loading}
							className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continue with Google
						</button>

						<button
							onClick={() => handleOAuthSignIn("github")}
							disabled={loading}
							className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
						>
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							Continue with GitHub
						</button>
					</div>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Or continue with email
							</span>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{isSignUp && (
							<div>
								<label htmlFor="fullName" className="block text-sm font-medium">
									Full Name
								</label>
								<div className="relative mt-1">
									<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<input
										id="fullName"
										type="text"
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										required={isSignUp}
										className="block w-full rounded-lg border border-border bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										placeholder="John Doe"
									/>
								</div>
							</div>
						)}

						<div>
							<label htmlFor="email" className="block text-sm font-medium">
								Email
							</label>
							<div className="relative mt-1">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="block w-full rounded-lg border border-border bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									placeholder="you@example.com"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium">
								Password
							</label>
							<div className="relative mt-1">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={6}
									className="block w-full rounded-lg border border-border bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									placeholder="••••••••"
								/>
							</div>
						</div>

						{error && (
							<p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</p>
						)}

						{message && (
							<p className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
								{message}
							</p>
						)}

						<button
							type="submit"
							disabled={loading}
							className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{loading && <Loader2 className="h-4 w-4 animate-spin" />}
							{isSignUp ? "Create Account" : "Sign In"}
						</button>
					</form>

					<div className="mt-4 text-center text-sm">
						{isSignUp ? (
							<>
								Already have an account?{" "}
								<button
									onClick={() => {
										setIsSignUp(false);
										setError(null);
										setMessage(null);
									}}
									className="font-medium text-primary hover:underline"
								>
									Sign in
								</button>
							</>
						) : (
							<>
								Don&apos;t have an account?{" "}
								<button
									onClick={() => {
										setIsSignUp(true);
										setError(null);
										setMessage(null);
									}}
									className="font-medium text-primary hover:underline"
								>
									Sign up
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
