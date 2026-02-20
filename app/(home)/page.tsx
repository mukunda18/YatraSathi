import { validateSession } from "@/app/actions/authActions";
import StoreInitializer from "@/components/auth/ui/StoreInitializer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import TripsSidebar from "@/components/landing/TripsSidebar";
import ChatBot from "@/components/ChatBot";

export default async function HomePage() {
    const user = await validateSession();

    return (
        <div className="relative min-h-screen bg-bg-dark flex flex-col">
            <StoreInitializer user={user || undefined} />

            <div className="fixed top-0 right-0 h-200 w-full max-w-250 bg-indigo-600/10 blur-[180px] rounded-full -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 h-150 w-full max-w-200 bg-purple-600/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <Navbar user={user} />

            <main className="flex-1 pt-24 md:pt-28 pb-12">
                <div className="mx-auto max-w-6xl px-4 md:px-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 min-w-0 flex flex-col">
                            <Hero user={user} />

                            {/* In mobile, show trips right after hero */}
                            {user && (
                                <div className="block md:hidden mt-10 mb-2">
                                    <TripsSidebar />
                                </div>
                            )}

                            <Features />
                        </div>

                        {/* In desktop, show trips as a sidebar */}
                        {user && (
                            <div className="hidden md:block w-80 shrink-0 sticky top-28 h-fit">
                                <TripsSidebar />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
            <ChatBot />
        </div>
    );
}
