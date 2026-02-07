import { validateSession } from "@/app/actions/authActions";
import StoreInitializer from "@/components/auth/ui/StoreInitializer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import TripsSidebar from "@/components/landing/TripsSidebar";

export default async function HomePage() {
    const user = await validateSession();

    return (
        <div className="relative min-h-screen bg-bg-dark flex flex-col">
            <StoreInitializer user={user || undefined} />

            <div className="fixed top-0 right-0 h-[800px] w-full max-w-[1000px] bg-indigo-600/10 blur-[180px] rounded-full -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 h-[600px] w-full max-w-[800px] bg-purple-600/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <Navbar user={user} />

            <main className="flex-1 pt-28 pb-12">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="flex gap-8">
                        <div className="flex-1 min-w-0">
                            <Hero user={user} />
                            <Features />
                        </div>
                        {user && <TripsSidebar />}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
