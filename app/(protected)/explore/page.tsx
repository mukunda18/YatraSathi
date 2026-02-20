"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllUpcomingTripsAction, ExploreTrip } from "@/app/actions/tripActions";
import ExploreFilters from "@/components/explore/ExploreFilters";
import {
    HiArrowLeft,
    HiArrowNarrowRight,
    HiClock,
    HiCurrencyRupee,
    HiLocationMarker,
    HiRefresh,
    HiSearch,
    HiStar,
    HiUser,
} from "react-icons/hi";
import { HiTruck } from "react-icons/hi2";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function TripCard({ trip }: { trip: ExploreTrip }) {
    return (
        <Link
            href={`/trips/${trip.id}`}
            className="group w-full text-left bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-indigo-500/30 rounded-3xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 active:scale-[0.99] flex flex-col gap-4"
        >
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10" />
                    <div className="w-px h-7 bg-linear-to-b from-indigo-500/50 to-emerald-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">From</p>
                        <p className="text-sm font-bold text-white leading-snug line-clamp-1">{trip.from_address}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">To</p>
                        <p className="text-sm font-bold text-white leading-snug line-clamp-1">{trip.to_address}</p>
                    </div>
                </div>
                <HiArrowNarrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-colors mt-3 shrink-0" />
            </div>

            <div className="border-t border-white/5" />

            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiClock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{formatDate(trip.travel_date)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiCurrencyRupee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-bold text-emerald-400">
                        {trip.fare_per_seat} <span className="text-slate-500 font-medium">/seat</span>
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiUser className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-[11px] font-bold truncate">{trip.driver_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiLocationMarker className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-[11px] font-bold">
                        {trip.available_seats}
                        <span className="text-slate-600">/{trip.total_seats}</span>{" "}
                        <span className="text-slate-600 font-medium">seats</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <HiTruck className="w-3 h-3" />
                    {trip.vehicle_type}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <HiStar className="w-3 h-3 text-amber-400" />
                    {Number(trip.driver_rating ?? 0).toFixed(1)}
                </span>
            </div>
        </Link>
    );
}

export default function ExplorePage() {
    const [trips, setTrips] = useState<ExploreTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [vehicleFilter, setVehicleFilter] = useState("All");
    const [maxFare, setMaxFare] = useState("");
    const [minSeats, setMinSeats] = useState("1");
    const [departureFilter, setDepartureFilter] = useState<"all" | "today" | "next7">("all");

    const fetchTrips = async () => {
        setIsLoading(true);
        setError(null);
        const result = await getAllUpcomingTripsAction();
        if (result.success) {
            setTrips(result.trips);
        } else {
            setError(result.message || "Failed to load trips");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        void fetchTrips();
    }, []);

    const filteredTrips = useMemo(() => {
        const now = new Date();
        const todayYear = now.getFullYear();
        const todayMonth = now.getMonth();
        const todayDate = now.getDate();
        const sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(now.getDate() + 7);

        const parsedMaxFare = Number(maxFare);
        const validMaxFare = Number.isFinite(parsedMaxFare) && parsedMaxFare > 0 ? parsedMaxFare : null;
        const parsedMinSeats = Number(minSeats);
        const validMinSeats = Number.isFinite(parsedMinSeats) && parsedMinSeats > 0 ? parsedMinSeats : 1;

        return trips.filter((trip) => {
            const vehicleMatch = vehicleFilter === "All" || trip.vehicle_type.toLowerCase() === vehicleFilter.toLowerCase();
            const fareMatch = validMaxFare == null || trip.fare_per_seat <= validMaxFare;
            const seatsMatch = trip.available_seats >= validMinSeats;

            const tripDate = new Date(trip.travel_date);
            const isToday =
                tripDate.getFullYear() === todayYear &&
                tripDate.getMonth() === todayMonth &&
                tripDate.getDate() === todayDate;
            const isInNext7Days = tripDate >= now && tripDate <= sevenDaysFromNow;

            const departureMatch =
                departureFilter === "all" ||
                (departureFilter === "today" && isToday) ||
                (departureFilter === "next7" && isInNext7Days);

            return vehicleMatch && fareMatch && seatsMatch && departureMatch;
        });
    }, [trips, vehicleFilter, maxFare, minSeats, departureFilter]);

    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-150 w-full max-w-200 bg-indigo-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-100 w-full max-w-150 bg-purple-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
                <header className="mb-8 md:mb-10">
                    <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                Explore <span className="text-indigo-500 italic">Trips</span>
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
                                Browse all upcoming rides and open any trip to view details.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/trips/join"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                Back
                            </Link>
                            <button
                                onClick={fetchTrips}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                <HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </header>

                <ExploreFilters
                    vehicleFilter={vehicleFilter}
                    setVehicleFilter={setVehicleFilter}
                    maxFare={maxFare}
                    setMaxFare={setMaxFare}
                    minSeats={minSeats}
                    setMinSeats={setMinSeats}
                    departureFilter={departureFilter}
                    setDepartureFilter={setDepartureFilter}
                    onClearAll={() => {
                        setVehicleFilter("All");
                        setMaxFare("");
                        setMinSeats("1");
                        setDepartureFilter("all");
                    }}
                />

                {!isLoading && !error && (
                    <div className="mb-6 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                            {filteredTrips.length} trip{filteredTrips.length !== 1 ? "s" : ""} found
                        </span>
                        {filteredTrips.length !== trips.length && (
                            <span className="text-[10px] font-bold text-slate-700">(of {trips.length} total)</span>
                        )}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-24 bg-slate-900/20 border border-dashed border-white/5 rounded-3xl">
                        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading trips...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-24 bg-slate-900/20 border border-dashed border-red-500/10 rounded-3xl">
                        <p className="text-sm font-bold text-red-400 mb-4">{error}</p>
                        <button onClick={fetchTrips} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all">
                            Try Again
                        </button>
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/20 border border-dashed border-white/5 rounded-3xl">
                        <div className="w-14 h-14 rounded-3xl bg-slate-800/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
                            <HiSearch className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-1">No trips found</p>
                        <p className="text-xs text-slate-600">
                            {trips.length === 0 ? "There are no upcoming trips available right now." : "Try adjusting your search or filters."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
