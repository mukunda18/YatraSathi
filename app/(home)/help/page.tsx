import FaqAccordion from "@/components/support/FaqAccordion";
import SupportForm from "@/components/support/SupportForm";
import { HiChatAlt2, HiSearch, HiMail, HiChevronRight, HiArrowLeft } from "react-icons/hi";
import Link from "next/link";

export const metadata = {
    title: "Help Center | YatraSathi",
    description: "Find answers to frequently asked questions and get support.",
};

const CATEGORIES = [
    {
        title: "Getting Started",
        description: "New to YatraSathi? Learn the basics of ride-sharing.",
        faqs: [
            { q: "How does YatraSathi work?", a: "YatraSathi connects drivers with empty seats to passengers traveling in the same direction. It's a cost-effective and social way to travel." },
            { q: "Is it free to use?", a: "Joining the community is free. Riders contribute a share of the fuel and travel costs, which are clearly displayed before booking." },
            { q: "How do I offer a ride?", a: "Register as a driver, complete your binary KYC verification, and then use the 'Offer a Ride' button to list your journey." }
        ]
    },
    {
        title: "Safety & KYC",
        description: "Your safety is our priority. Learn about verification.",
        faqs: [
            { q: "What is the verification process?", a: "All drivers must upload a valid government ID and driving license. Our team reviews these documents to ensure community safety." },
            { q: "Can I choose who I travel with?", a: "Yes, both riders and drivers can view profiles and ratings before accepting a booking request." },
            { q: "How do I report a problem?", a: "Use the 'Report' button on a trip card or contact support immediately via our dedicated support form." }
        ]
    },
    {
        title: "Payments & Pricing",
        description: "How payments work and how we calculate fares.",
        faqs: [
            { q: "How is the fare calculated?", a: "Fares are suggested based on distance and vehicle type to ensure fair cost-sharing among all participants." },
            { q: "When do I pay?", a: "Payments are currently handled directly between the rider and driver, usually at the start or completion of the trip." },
            { q: "What is your refund policy?", a: "If a trip is cancelled, we recommend communicating with your co-travelers. Frequent cancellations may lead to account review." }
        ]
    }
];

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden pb-20">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 h-150 w-full max-w-200 bg-indigo-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-150 w-full max-w-200 bg-emerald-600/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                <Link href="/" className="mb-8 md:mb-12 inline-flex items-center px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <HiArrowLeft className="mr-2 w-4 h-4" />
                    Back to Home
                </Link>

                <section className="text-center mb-24">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600">Help Center</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Your questions, answered.
                    </p>
                </section>

                <div>
                    {CATEGORIES.map((cat, idx) => (
                        <FaqAccordion key={idx} category={cat} />
                    ))}
                </div>

                <div className="mt-24">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-white tracking-tight mb-4">
                            Contact <span className="text-indigo-500 italic">Us</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-8">
                            Fill out the form below and we will get back to you as soon as possible.
                        </p>
                        <div className="max-w-xl mx-auto">
                            <SupportForm />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
