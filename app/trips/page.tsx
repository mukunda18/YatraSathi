import { validateSession } from "@/app/actions/authActions";
import { getJoinedTripsAction } from "@/app/actions/tripActions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HiLocationMarker, HiClock, HiUser, HiCurrencyRupee, HiArrowRight, HiSearch } from "react-icons/hi";

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

            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                            My <span className="text-indigo-500 italic">Trips</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            {trips.length} {trips.length === 1 ? "trip" : "trips"} joined
                        </p>
                    </div>
                    <Link
                        href="/trips/join"
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <HiSearch className="w-4 h-4" />
                        Find Rides
                    </Link>
                </div>

                {trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                            <HiLocationMarker className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">No Trips Yet</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6 text-center max-w-sm">
                            You haven't joined any trips yet. Start exploring and find your perfect ride.
                        </p>
                        <Link
                            href="/trips/join"
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                        >
                            Find a Ride
                            <HiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trips.map((trip: any) => (
                            <Link
                                key={trip.request_id}
                                href={`/trips/${trip.trip_id}`}
                                className="group block bg-slate-900/50 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/20 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <HiUser className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{trip.driver_name}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                <span>{trip.vehicle_type}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span>{trip.vehicle_number}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusColor(trip.request_status)}`}>
                                        {trip.request_status}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">Pickup</p>
                                            <p className="text-sm text-white font-medium">{trip.pickup_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">Drop</p>
                                            <p className="text-sm text-white font-medium">{trip.drop_address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <HiClock className="w-4 h-4" />
                                            <span className="text-xs font-bold">{formatDate(trip.travel_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-400">
                                            <HiCurrencyRupee className="w-4 h-4" />
                                            <span className="text-xs font-black">{trip.total_fare}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500">
                                            {trip.requested_seats} {trip.requested_seats === 1 ? "seat" : "seats"}
                                        </span>
                                        <HiArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
