"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HiArrowLeft, HiClock, HiLocationMarker, HiPhone, HiUserGroup } from "react-icons/hi";
import { toast } from "sonner";
import { markRiderDroppedOffAction, markRiderOnboardAction } from "@/app/actions/driverActions";
import TripMap from "@/components/map/TripMap";
import { useLiveDriverStore } from "@/store/liveDriverStore";
import { LiveDriverTripData } from "@/store/types";

interface LiveTripDriverProps {
    trip: LiveDriverTripData;
}

const formatDistance = (value: number) => `${value.toFixed(1)} km`;

const formatCoord = (value: number | null | undefined) =>
    value == null ? "--" : value.toFixed(5);

export default function LiveTripDriver({ trip }: LiveTripDriverProps) {
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const initializeFromTrip = useLiveDriverStore((state) => state.initializeFromTrip);
    const clear = useLiveDriverStore((state) => state.clear);
    const liveTrip = useLiveDriverStore((state) => state.trip);
    const route = useLiveDriverStore((state) => state.route);
    const riders = useLiveDriverStore((state) => state.riders);
    const liveRiders = useLiveDriverStore((state) => state.liveRiders);
    const driverPosition = useLiveDriverStore((state) => state.driverPosition);
    const completedRoute = useLiveDriverStore((state) => state.completedRoute);
    const remainingRoute = useLiveDriverStore((state) => state.remainingRoute);
    const progressPercent = useLiveDriverStore((state) => state.progressPercent);
    const completedDistanceKm = useLiveDriverStore((state) => state.completedDistanceKm);
    const remainingDistanceKm = useLiveDriverStore((state) => state.remainingDistanceKm);

    useEffect(() => {
        initializeFromTrip(trip);
        return () => clear();
    }, [trip, initializeFromTrip, clear]);

    const displayTrip = liveTrip || trip;
    const waitingCount = useMemo(() => riders.filter((r) => r.status === "waiting").length, [riders]);
    const onboardCount = useMemo(() => riders.filter((r) => r.status === "onboard").length, [riders]);
    const updatedAtLabel = driverPosition?.lastUpdated
        ? new Date(driverPosition.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--:--";

    const handleStatusUpdate = async (requestId: string, status: "onboard" | "dropedoff") => {
        setIsUpdating(requestId);
        try {
            const result = status === "onboard"
                ? await markRiderOnboardAction(requestId)
                : await markRiderDroppedOffAction(requestId);
            if (!result.success) {
                toast.error(result.message);
                return;
            }
            toast.success(result.message);
            window.location.reload();
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row">
            <div className="relative flex-1">
                <TripMap
                    mode="live"
                    trip={displayTrip}
                    driverLocation={driverPosition ? { lat: driverPosition.lat, lng: driverPosition.lng } : null}
                    routeGeometry={route}
                    completedRoute={completedRoute}
                    remainingRoute={remainingRoute}
                    liveRiders={liveRiders}
                />
            </div>

            <aside className="w-full overflow-y-auto border-l border-white/5 bg-slate-950 p-6 md:w-105">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/driver/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
                    >
                        <HiArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        {displayTrip.trip_status}
                    </span>
                </div>

                <h1 className="text-xl font-black text-white">
                    Live <span className="text-indigo-500">Driver Trip</span>
                </h1>
                <p className="mt-1 text-xs font-bold text-slate-400">
                    {`${displayTrip.from_address.split(",")[0]} -> ${displayTrip.to_address.split(",")[0]}`}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Progress</p>
                        <p className="text-sm font-bold text-white">{progressPercent.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Driver Speed</p>
                        <p className="text-sm font-bold text-white">
                            {driverPosition?.speedKmph != null ? `${driverPosition.speedKmph.toFixed(0)} km/h` : "--"}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Completed</p>
                        <p className="text-sm font-bold text-white">{formatDistance(completedDistanceKm)}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Remaining</p>
                        <p className="text-sm font-bold text-white">{formatDistance(remainingDistanceKm)}</p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <HiClock className="h-3 w-3 text-slate-400" />
                    Driver update {updatedAtLabel}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <HiLocationMarker className="h-3 w-3 text-slate-400" />
                    Driver {formatCoord(driverPosition?.lat)} , {formatCoord(driverPosition?.lng)}
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                        <HiUserGroup className="h-4 w-4" />
                        Riders
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {waitingCount} waiting / {onboardCount} onboard
                    </span>
                </div>

                <div className="mt-3 space-y-3">
                    {riders.length === 0 && (
                        <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs font-bold text-slate-600">
                            No riders in this live trip.
                        </div>
                    )}

                    {riders.map((rider) => (
                        <div key={rider.request_id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-white">{rider.rider_name}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{rider.status}</p>
                                </div>
                                <a
                                    href={`tel:${rider.rider_phone}`}
                                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400"
                                >
                                    <HiPhone className="h-4 w-4" />
                                </a>
                            </div>

                            <div className="mt-3 space-y-2 text-[11px] text-slate-300">
                                <p className="truncate"><span className="font-bold text-slate-500">Pickup:</span> {rider.pickup_address}</p>
                                <p className="truncate"><span className="font-bold text-slate-500">Drop:</span> {rider.drop_address}</p>
                                <p className="text-[10px] font-bold text-slate-500">
                                    Live {formatCoord(rider.current_lat)} , {formatCoord(rider.current_lng)}
                                </p>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                {rider.status === "waiting" && (
                                    <button
                                        onClick={() => handleStatusUpdate(rider.request_id, "onboard")}
                                        disabled={isUpdating === rider.request_id}
                                        className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-50"
                                    >
                                        Onboard
                                    </button>
                                )}
                                {rider.status === "onboard" && (
                                    <button
                                        onClick={() => handleStatusUpdate(rider.request_id, "dropedoff")}
                                        disabled={isUpdating === rider.request_id}
                                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                                    >
                                        Drop Off
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
