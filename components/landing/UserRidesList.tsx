"use client";

import { useUserRidesStore } from "@/store/userRidesStore";
import Link from "next/link";
import { HiClock, HiLocationMarker, HiArrowRight, HiRefresh } from "react-icons/hi";

export default function UserRidesList() {
    const { trips, isLoading, fetchTrips } = useUserRidesStore();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "waiting": return "bg-amber-500";
            case "accepted": return "bg-emerald-500";
            case "completed": return "bg-blue-500";
            case "cancelled": return "bg-red-500";
            default: return "bg-slate-500";
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-600">My Trips (Passenger)</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchTrips()}
                        disabled={isLoading}
                        className="p-1 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
                        title="Refresh passenger trips"
                    >
                        <HiRefresh className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <Link href="/trips" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                        View All
                    </Link>
                </div>
            </div>

            {trips.length === 0 ? (
                <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 text-center">
                    <HiLocationMarker className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 mb-3">No joined trips</p>
                    <Link href="/trips/join" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300">
                        Find a ride <HiArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {trips.slice(0, 3).map((trip: any) => (
                        <Link
                            key={trip.request_id}
                            href={`/trips/${trip.trip_id}`}
                            className="block bg-slate-900/30 border border-white/5 rounded-xl p-4 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(trip.request_status)}`} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{trip.request_status}</span>
                                </div>
                                <HiArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <p className="text-xs font-bold text-white truncate mb-1">{trip.pickup_address.split(",")[0]}</p>
                            <p className="text-[10px] text-slate-500 truncate mb-2">→ {trip.drop_address.split(",")[0]}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                <HiClock className="w-3 h-3" />
                                {formatDate(trip.travel_date)}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
