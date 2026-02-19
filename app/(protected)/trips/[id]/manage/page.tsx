import { getTripDetailsAction } from "@/app/actions/tripActions";
import { validateSession } from "@/app/actions/authActions";
import { redirect } from "next/navigation";
import TripManagement from "@/components/trips/TripManagement";
import Link from "next/link";
import { HiArrowLeft, HiDotsVertical } from "react-icons/hi";

export default async function TripManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    const result = await getTripDetailsAction(id);

    if (!result.success) {
        return (
            <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-black text-white mb-4">Access Denied</h1>
                <p className="text-slate-400 font-bold mb-8">{result.message || "You don't have permission to manage this trip."}</p>
                <Link
                    href="/driver/dashboard"
                    className="px-8 py-3 rounded-2xl bg-indigo-500 text-white font-black hover:bg-indigo-600 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24 md:pt-32">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-12">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/driver/dashboard"
                            className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all group"
                        >
                            <HiArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Manage Trip</h1>
                            <p className="text-slate-500 font-bold text-sm">Control your journey and riders</p>
                        </div>
                    </div>

                    <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">
                        <HiDotsVertical className="w-6 h-6" />
                    </button>
                </div>

                <TripManagement trip={result.trip} />
            </div>
        </main>
    );
}
