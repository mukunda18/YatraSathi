"use client";

import TripMap from "@/components/map/TripMap";
import { TripViewData } from "@/store/types";
import { HiLocationMarker, HiClock, HiArrowLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";

interface LiveTripClientProps {
    trip: TripViewData;
}

export default function LiveTripClient({ trip }: LiveTripClientProps) {
    const router = useRouter();

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col">
            {/* Simple Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            <h1 className="text-sm font-black text-white uppercase tracking-tight">
                                Live <span className="text-indigo-500">Trip</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">
                            {trip.from_address.split(',')[0]} → {trip.to_address.split(',')[0]}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    {trip.trip_status}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <TripMap
                    mode="view"
                    trip={trip}
                />
            </div>

            {/* Basic Status Bar */}
            <div className="p-6 bg-slate-950 border-t border-white/5 z-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
                    <div className="flex-1 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <HiLocationMarker className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Destination</p>
                            <p className="text-sm font-bold text-white truncate">
                                {trip.to_address}
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                        <HiClock className="w-4 h-4 text-slate-400" />
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Active Map</p>
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
