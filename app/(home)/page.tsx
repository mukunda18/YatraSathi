import { validateSession } from "@/app/actions/authActions";
import StoreInitializer from "@/components/StoreInitializer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";

export default async function HomePage() {
    const user = await validateSession();

    return (
        <div className="relative min-h-screen bg-bg-dark">
            <StoreInitializer user={user || undefined} />

            {/* Background Decorative Elements */}
            <div className="fixed top-0 right-0 h-[800px] w-full max-w-[1000px] bg-indigo-600/10 blur-[180px] rounded-full -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 h-[600px] w-full max-w-[800px] bg-purple-600/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <Navbar user={user} />

            <main className="pt-32 pb-20">
                <div className="mx-auto max-w-7xl px-6">
                    <Hero user={user} />
                </div>
            </main>
        </div>
    );
}
