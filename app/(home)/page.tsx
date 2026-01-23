import { validateSession } from "@/app/actions/authActions";
import StoreInitializer from "@/components/StoreInitializer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureCard from "@/components/landing/FeatureCard";

export default async function HomePage() {
    const user = await validateSession();

    const features = [
        {
            title: "Next-Gen Tracking",
            desc: "Proprietary real-time pathfinding and live updates for your peace of mind.",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
            color: "indigo"
        },
        {
            title: "Elite Verification",
            desc: "Advanced vetting process, ensuring only the most reliable individuals join our fleet.",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
            color: "green"
        },
        {
            title: "AI Price Engine",
            desc: "Smart algorithmic pricing that ensures fairness and efficiency for everyone.",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
            color: "amber"
        }
    ];

    return (
        <div className="relative min-h-full">
            <StoreInitializer user={user || undefined} />

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 h-[800px] w-full max-w-[1000px] bg-indigo-600/10 blur-[180px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[600px] w-full max-w-[800px] bg-purple-600/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <Navbar user={user} />

            <main className="py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Hero user={user} />

                    <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
                        {features.map((feature, i) => (
                            <FeatureCard
                                key={i}
                                title={feature.title}
                                desc={feature.desc}
                                icon={feature.icon}
                                color={feature.color}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
