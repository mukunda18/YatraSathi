"use client";

import { useEffect } from "react";
import { useUserRidesStore, UserTrip } from "@/store/userRidesStore";
import UserTripCard from "./UserTripCard";
import Link from "next/link";
import { HiPlusCircle, HiRefresh } from "react-icons/hi";

export default function UserTripsList() {
    const { trips, isLoading, lastFetched, fetchTrips } = useUserRidesStore();

    useEffect(() => {
        if (!lastFetched) {
            fetchTrips();
        }
    }, [lastFetched, fetchTrips]);

    const stats = {
        total: trips.length,
        upcoming: trips.filter((t: UserTrip) => t.trip_status === "scheduled" && t.request_status !== 'cancelled').length,
        completed: trips.filter((t: UserTrip) => t.trip_status === "completed").length,
        cancelled: trips.filter((t: UserTrip) => t.request_status === "cancelled").length
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Total Trips</p>
                    <p className="text-2xl font-black text-white">{stats.total}</p>
                </div>
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Upcoming</p>
                    <p className="text-2xl font-black text-indigo-400">{stats.upcoming}</p>
                </div>
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Completed</p>
                    <p className="text-2xl font-black text-emerald-400">{stats.completed}</p>
                </div>
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Cancelled</p>
                    <p className="text-2xl font-black text-red-400">{stats.cancelled}</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {trips.length} journeys
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchTrips}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <Link
                        href="/explore"
                        prefetch={true}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-colors"
                    >
                        <HiPlusCircle className="w-4 h-4" />
                        Explore
                    </Link>
                </div>
            </div>

            {isLoading && trips.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Loading journeys...</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-white/5 rounded-2xl">
                    <p className="text-sm text-slate-500 mb-4">
                        You haven&apos;t joined any trips yet
                    </p>
                    <Link
                        href="/trips/join"
                        prefetch={true}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-colors"
                    >
                        <HiPlusCircle className="w-4 h-4" />
                        Find Your First Ride
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map((trip: UserTrip) => (
                        <UserTripCard key={trip.request_id} trip={trip} onUpdate={fetchTrips} />
                    ))}
                </div>
            )}
        </div>
    );
}
