"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllUpcomingTripsAction, ExploreTrip, createRideRequestAction } from "@/app/actions/tripActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserRidesStore } from "@/store/userRidesStore";
import { useAuthStore } from "@/store/authStore";
import {
    HiSearch,
    HiRefresh,
    HiStar,
    HiCurrencyRupee,
    HiLocationMarker,
    HiClock,
    HiUser,
    HiFilter,
    HiArrowNarrowRight,
    HiX,
    HiChevronRight,
} from "react-icons/hi";
import { HiTruck } from "react-icons/hi2";

const VEHICLE_TYPES = ["All", "Car", "Bike", "Van", "Bus", "Truck", "Microbus", "Other"];

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Trip Card ──────────────────────────────────────────────────────────────────
function TripCard({ trip, onClick }: { trip: ExploreTrip; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group w-full text-left bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-indigo-500/30 rounded-3xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 active:scale-[0.99] flex flex-col gap-4"
        >
            {/* Route */}
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10" />
                    <div className="w-px h-7 bg-gradient-to-b from-indigo-500/50 to-emerald-500/50" />
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
                <HiArrowNarrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-colors mt-3 flex-shrink-0" />
            </div>

            <div className="border-t border-white/5" />

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiClock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{formatDate(trip.travel_date)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiCurrencyRupee className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-emerald-400">
                        {trip.fare_per_seat} <span className="text-slate-500 font-medium">/seat</span>
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiUser className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">{trip.driver_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                    <HiLocationMarker className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-[11px] font-bold">
                        {trip.available_seats}
                        <span className="text-slate-600">/{trip.total_seats}</span>{" "}
                        <span className="text-slate-600 font-medium">seats</span>
                    </span>
                </div>
            </div>

            {/* Tags */}
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
        </button>
    );
}

// ── Join Modal ─────────────────────────────────────────────────────────────────
function JoinModal({ trip, onClose }: { trip: ExploreTrip; onClose: () => void }) {
    const [seats, setSeats] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { userId } = useAuthStore();

    const isOwnTrip = trip.driver_user_id === userId;
    const totalFare = trip.fare_per_seat * seats;

    const handleJoin = async () => {
        setLoading(true);
        try {
            const result = await createRideRequestAction({
                trip_id: trip.id,
                pickup_location: { lat: trip.from_lat, lng: trip.from_lng },
                pickup_address: trip.from_address,
                drop_location: { lat: trip.to_lat, lng: trip.to_lng },
                drop_address: trip.to_address,
                seats,
                total_fare: totalFare,
            });

            if (result.success) {
                toast.success("Ride request sent successfully!");
                useUserRidesStore.getState().fetchTrips();
                onClose();
                router.push("/trips");
            } else {
                toast.error(result.message || "Failed to send ride request");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl shadow-2xl shadow-black/60 animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <HiX className="w-5 h-5" />
                    </button>

                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 flex-shrink-0">
                        {trip.driver_name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white">{trip.driver_name}</h2>
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                            <HiStar className="w-3.5 h-3.5" />
                            <span>{Number(trip.driver_rating ?? 0).toFixed(1)}</span>
                            <span className="text-slate-500 font-medium ml-1">({trip.driver_total_ratings || 0} rides)</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Vehicle */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Vehicle</p>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-white capitalize">
                                    {trip.vehicle_info?.color ? `${String(trip.vehicle_info.color)} ` : ""}
                                    {trip.vehicle_info?.model ? String(trip.vehicle_info.model) : trip.vehicle_type}
                                </p>
                                <p className="text-xs text-indigo-400 font-mono mt-0.5">{trip.vehicle_number}</p>
                            </div>
                            <HiTruck className="w-6 h-6 text-slate-700" />
                        </div>
                    </div>

                    {/* Route */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Trip Route</p>
                        <div className="relative pl-4 space-y-4">
                            <div className="absolute left-[21px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/50 to-emerald-500/50" />
                            <div className="relative flex gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10 shrink-0 mt-1 z-10" />
                                <div>
                                    <p className="text-xs font-bold text-white leading-snug">{trip.from_address}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Pickup</p>
                                </div>
                            </div>
                            <div className="relative flex gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 shrink-0 mt-1 z-10" />
                                <div>
                                    <p className="text-xs font-bold text-white leading-snug">{trip.to_address}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Dropoff</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seats & Fare */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Seats to Book</p>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-1">
                                    <button
                                        onClick={() => setSeats(Math.max(1, seats - 1))}
                                        className="w-8 h-8 rounded-lg hover:bg-white/10 text-white font-black transition-all active:scale-95"
                                    >
                                        −
                                    </button>
                                    <span className="text-sm font-black text-white w-4 text-center">{seats}</span>
                                    <button
                                        onClick={() => setSeats(Math.min(trip.available_seats, seats + 1))}
                                        className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">{trip.available_seats} Available</p>
                                <p className="text-[10px] text-slate-500">Instant Booking</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Fare</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">RS {totalFare}</span>
                                <span className="text-[10px] text-slate-500 font-bold">
                                    ({seats}× RS {trip.fare_per_seat})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Join Button */}
                    <button
                        onClick={handleJoin}
                        disabled={loading || trip.available_seats === 0 || isOwnTrip}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : isOwnTrip ? (
                            "You are the driver"
                        ) : (
                            <>
                                Request to Join
                                <HiChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExplorePage() {
    const [trips, setTrips] = useState<ExploreTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrip, setSelectedTrip] = useState<ExploreTrip | null>(null);

    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("All");

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
        fetchTrips();
    }, []);

    const filteredTrips = useMemo(() => {
        return trips.filter((trip) => {
            const fromMatch = searchFrom.trim() === "" ||
                trip.from_address.toLowerCase().includes(searchFrom.toLowerCase());
            const toMatch = searchTo.trim() === "" ||
                trip.to_address.toLowerCase().includes(searchTo.toLowerCase());
            const vehicleMatch = vehicleFilter === "All" ||
                trip.vehicle_type.toLowerCase() === vehicleFilter.toLowerCase();
            return fromMatch && toMatch && vehicleMatch;
        });
    }, [trips, searchFrom, searchTo, vehicleFilter]);

    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-[600px] w-full max-w-[800px] bg-indigo-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[400px] w-full max-w-[600px] bg-purple-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

            {/* Join Modal */}
            {selectedTrip && (
                <JoinModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
            )}

            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-end justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                Explore{" "}
                                <span className="text-indigo-500 italic">Trips</span>
                            </h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">
                                Browse all upcoming rides and find your perfect journey.
                            </p>
                        </div>
                        <button
                            onClick={fetchTrips}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            <HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </header>

                {/* Search & Filter */}
                <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 mb-8 space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <HiSearch className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Search & Filter</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchFrom}
                                onChange={(e) => setSearchFrom(e.target.value)}
                                placeholder="From location..."
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                placeholder="To location..."
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <HiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                            <select
                                value={vehicleFilter}
                                onChange={(e) => setVehicleFilter(e.target.value)}
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-purple-500/40 transition-all cursor-pointer"
                            >
                                {VEHICLE_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type === "All" ? "All Vehicle Types" : type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(searchFrom || searchTo || vehicleFilter !== "All") && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Active:</span>
                            {searchFrom && (
                                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-[10px] font-bold text-indigo-400">From: {searchFrom}</span>
                            )}
                            {searchTo && (
                                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-400">To: {searchTo}</span>
                            )}
                            {vehicleFilter !== "All" && (
                                <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-[10px] font-bold text-purple-400">{vehicleFilter}</span>
                            )}
                            <button
                                onClick={() => { setSearchFrom(""); setSearchTo(""); setVehicleFilter("All"); }}
                                className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Count */}
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

                {/* Grid */}
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
                            {trips.length === 0
                                ? "There are no upcoming trips available right now."
                                : "Try adjusting your search or filters."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                trip={trip}
                                onClick={() => setSelectedTrip(trip)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
