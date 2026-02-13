"use client";

import { useEffect } from "react";
import { useDriverRidesStore } from "@/store/driverRidesStore";
import DriverTripCard from "./DriverTripCard";
import Link from "next/link";
import { HiPlusCircle, HiRefresh } from "react-icons/hi";

export default function DriverTripsList() {
    const { trips, isLoading, lastFetched, fetchTrips } = useDriverRidesStore();

    useEffect(() => {
        if (!lastFetched) {
            fetchTrips();
        }
    }, [lastFetched, fetchTrips]);

    const filteredTrips = trips;

    const stats = {
        total: trips.length,
        scheduled: trips.filter(t => t.trip_status === "scheduled").length,
        completed: trips.filter(t => t.trip_status === "completed").length,
        cancelled: trips.filter(t => t.trip_status === "cancelled").length,
        pendingRequests: trips.reduce((acc, t) => acc + t.ride_requests.filter((r) => r.status === "waiting").length, 0)
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Total Trips</p>
                    <p className="text-2xl font-black text-white">{stats.total}</p>
                </div>
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Scheduled</p>
                    <p className="text-2xl font-black text-indigo-400">{stats.scheduled}</p>
                </div>
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Completed</p>
                    <p className="text-2xl font-black text-emerald-400">{stats.completed}</p>
                </div>
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Pending Requests</p>
                    <p className="text-2xl font-black text-amber-400">{stats.pendingRequests}</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {trips.length} trips
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
                        href="/trips/new"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-colors"
                    >
                        <HiPlusCircle className="w-4 h-4" />
                        New Trip
                    </Link>
                </div>
            </div>

            {isLoading && trips.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Loading trips...</p>
                </div>
            ) : filteredTrips.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/30 border border-white/5 rounded-2xl">
                    <p className="text-sm text-slate-500 mb-4">
                        You haven&apos;t created any trips yet
                    </p>
                    <Link
                        href="/trips/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-colors"
                    >
                        <HiPlusCircle className="w-4 h-4" />
                        Create Your First Trip
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTrips.map((trip) => (
                        <DriverTripCard key={trip.trip_id} trip={trip} onUpdate={fetchTrips} />
                    ))}
                </div>
            )}
        </div>
    );
}
