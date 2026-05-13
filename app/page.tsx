import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
	return (
		<>
			<Header />
			<main className="flex-1">
				<Hero />
				<Features />
				<Pricing />
			</main>
			<Footer />
		</>
	);
}
