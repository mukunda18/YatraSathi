import { validateSession } from "@/app/actions/authActions";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import DriverTripsList from "@/components/driver/DriverTripsList";
import ChatBotInline from "@/components/ChatBotInline";

export const metadata = {
    title: "Driver Dashboard | YatraSathi",
    description: "Manage your trips, view ride requests, and handle passengers.",
};

export default async function DriverDashboardPage() {
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    if (!user.isDriver) {
        redirect("/driver/register");
    }

    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-[600px] w-full max-w-[800px] bg-purple-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <Link href="/" className="mb-8 inline-flex items-center px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <HiArrowLeft className="mr-2 w-4 h-4" />
                    Back to Home
                </Link>

                <header className="mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Driver <span className="text-purple-400 italic">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Manage your trips, accept requests, and track your earnings.
                    </p>
                </header>

                <Suspense fallback={<div className="text-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-sm text-slate-500">Loading dashboard...</p></div>}>
                    <DriverTripsList />
                </Suspense>

                <div className="mt-10">
                    <ChatBotInline />
                </div>
            </div>
        </main>
    );
}
