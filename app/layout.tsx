import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "InfluencerAI - AI Influencer Generator & Auto Post Scheduler",
	description:
		"Create, schedule, and publish AI-powered social media content across all major platforms. Generate authentic influencer content with the power of AI.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
		>
			<body className="min-h-screen bg-background font-sans text-foreground antialiased">
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
