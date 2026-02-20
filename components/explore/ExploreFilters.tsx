"use client";

import {
    HiClock,
    HiCurrencyRupee,
    HiFilter,
    HiSearch,
    HiUser,
} from "react-icons/hi";

const VEHICLE_TYPES = ["All", "Car", "Bike", "Van", "Bus", "Truck", "Microbus", "Other"];

interface ExploreFiltersProps {
    vehicleFilter: string;
    setVehicleFilter: (value: string) => void;
    maxFare: string;
    setMaxFare: (value: string) => void;
    minSeats: string;
    setMinSeats: (value: string) => void;
    departureFilter: "all" | "today" | "next7";
    setDepartureFilter: (value: "all" | "today" | "next7") => void;
    onClearAll: () => void;
}

export default function ExploreFilters({
    vehicleFilter,
    setVehicleFilter,
    maxFare,
    setMaxFare,
    minSeats,
    setMinSeats,
    departureFilter,
    setDepartureFilter,
    onClearAll,
}: ExploreFiltersProps) {
    const hasActiveFilters = vehicleFilter !== "All" || maxFare !== "" || minSeats !== "1" || departureFilter !== "all";

    return (
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-4 md:p-5 mb-8 space-y-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
                <HiSearch className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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

                <div className="relative">
                    <HiCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={maxFare}
                        onChange={(e) => setMaxFare(e.target.value)}
                        placeholder="Max fare per seat"
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 transition-all"
                    />
                </div>

                <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                    <select
                        value={minSeats}
                        onChange={(e) => setMinSeats(e.target.value)}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/40 transition-all cursor-pointer"
                    >
                        {[1, 2, 3, 4, 5, 6].map((seatCount) => (
                            <option key={seatCount} value={seatCount.toString()}>
                                Min seats: {seatCount}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <HiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
                    <select
                        value={departureFilter}
                        onChange={(e) => setDepartureFilter(e.target.value as "all" | "today" | "next7")}
                        className="w-full bg-slate-800 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-amber-500/40 transition-all cursor-pointer"
                    >
                        <option value="all">Any departure time</option>
                        <option value="today">Departing today</option>
                        <option value="next7">Next 7 days</option>
                    </select>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Active:</span>
                    {vehicleFilter !== "All" && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-[10px] font-bold text-purple-400">{vehicleFilter}</span>
                    )}
                    {maxFare && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-[10px] font-bold text-emerald-400">Max fare: {maxFare}</span>
                    )}
                    {minSeats !== "1" && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-[10px] font-bold text-indigo-400">Min seats: {minSeats}</span>
                    )}
                    {departureFilter !== "all" && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-[10px] font-bold text-amber-400">
                            {departureFilter === "today" ? "Today" : "Next 7 days"}
                        </span>
                    )}
                    <button
                        onClick={onClearAll}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
