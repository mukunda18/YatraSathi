import { validateSession } from "@/app/actions/authActions";
import { getJoinedTripsAction } from "@/app/actions/tripActions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import UserTripsList from "@/components/passenger/UserTripsList";
import BackButton from "@/components/UI/BackButton";

export const metadata = {
    title: "My Trips | YatraSathi",
    description: "View all your joined trips and ride requests.",
};

export default async function MyTripsPage() {
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    const result = await getJoinedTripsAction();
    const trips = result.trips || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "waiting": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "accepted": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "completed": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            case "cancelled": return "text-red-400 bg-red-500/10 border-red-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-[600px] w-full max-w-[800px] bg-indigo-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[400px] w-full max-w-[600px] bg-purple-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 py-16">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        My <span className="text-indigo-500 italic">Trips</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Manage your joined rides and track your journey history.
                    </p>
                </header>

                <Suspense fallback={
                    <div className="text-center py-20 bg-slate-900/20 border border-dashed border-white/5 rounded-3xl">
                        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading journeys...</p>
                    </div>
                }>
                    <UserTripsList />
                </Suspense>

                <div className="mt-12 flex justify-center">
                    <BackButton label="Back to Home" />
                </div>
            </div>
        </main>
    );
}
