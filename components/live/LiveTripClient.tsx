"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiClock, HiLocationMarker } from "react-icons/hi";
import TripMap from "@/components/map/TripMap";
import { useLiveTripStore } from "@/store/liveTripStore";
import { TripViewData } from "@/store/types";

interface LiveTripClientProps {
    trip: TripViewData;
}

const formatDistance = (value: number) => `${value.toFixed(1)} km`;

export default function LiveTripClient({ trip }: LiveTripClientProps) {
    const router = useRouter();
    const initializeFromTrip = useLiveTripStore((state) => state.initializeFromTrip);
    const clear = useLiveTripStore((state) => state.clear);
    const liveTrip = useLiveTripStore((state) => state.trip);
    const driverPosition = useLiveTripStore((state) => state.driverPosition);
    const route = useLiveTripStore((state) => state.route);
    const completedRoute = useLiveTripStore((state) => state.completedRoute);
    const remainingRoute = useLiveTripStore((state) => state.remainingRoute);
    const progressPercent = useLiveTripStore((state) => state.progressPercent);
    const completedDistanceKm = useLiveTripStore((state) => state.completedDistanceKm);
    const remainingDistanceKm = useLiveTripStore((state) => state.remainingDistanceKm);
    const totalDistanceKm = useLiveTripStore((state) => state.totalDistanceKm);

    useEffect(() => {
        initializeFromTrip(trip);
        return () => clear();
    }, [trip, initializeFromTrip, clear]);

    const displayTrip = liveTrip || trip;
    const currentTimeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedAtLabel = driverPosition?.lastUpdated
        ? new Date(driverPosition.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--:--";
    const speedLabel = driverPosition?.speedKmph != null ? `${driverPosition.speedKmph.toFixed(0)} km/h` : "--";

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden">
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/5 bg-slate-950/40 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-all hover:bg-white/10"
                    >
                        <HiArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            <h1 className="text-sm font-black uppercase tracking-tight text-white">
                                Live <span className="text-indigo-500">Trip</span>
                            </h1>
                        </div>
                        <p className="max-w-55 truncate text-[10px] font-bold text-slate-400">
                            {`${displayTrip.from_address.split(",")[0]} -> ${displayTrip.to_address.split(",")[0]}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    {displayTrip.trip_status}
                </div>
            </div>

            <div className="relative flex-1">
                <TripMap
                    mode="live"
                    trip={displayTrip}
                    driverLocation={driverPosition ? { lat: driverPosition.lat, lng: driverPosition.lng } : null}
                    routeGeometry={route}
                    completedRoute={completedRoute}
                    remainingRoute={remainingRoute}
                />
            </div>

            <div className="z-10 border-t border-white/5 bg-slate-950 p-6">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-6">
                    <div className="flex flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                            <HiLocationMarker className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Destination</p>
                            <p className="truncate text-sm font-bold text-white">{displayTrip.to_address}</p>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-4">
                        <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Progress</p>
                            <p className="text-xs font-bold text-white">{progressPercent.toFixed(1)}%</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Completed</p>
                            <p className="text-xs font-bold text-white">{formatDistance(completedDistanceKm)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Remaining</p>
                            <p className="text-xs font-bold text-white">{formatDistance(remainingDistanceKm)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Speed</p>
                            <p className="text-xs font-bold text-white">{speedLabel}</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-3 flex max-w-3xl items-center justify-end gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="inline-flex items-center gap-1">
                        <HiClock className="h-3 w-3 text-slate-400" />
                        Active {currentTimeLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <HiClock className="h-3 w-3 text-slate-400" />
                        Driver Update {updatedAtLabel}
                    </span>
                    <span>Total {formatDistance(totalDistanceKm)}</span>
                </div>
            </div>
        </div>
    );
}
