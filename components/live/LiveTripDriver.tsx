"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiClock, HiLocationMarker, HiPhone, HiUserGroup } from "react-icons/hi";
import TripMap from "@/components/map/TripMap";
import { useLiveDriverStore } from "@/store/liveDriverStore";
import { LiveDriverTripData } from "@/store/types";
import { useLocationStore } from "@/store/locationStore";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { formatCoordinate, formatDistanceKm } from "@/utils/formatters";
import { distanceMeters } from "@/utils/geo";
import { getGoApi, postGoApi } from "@/utils/goApiClient";
import { toLiveDriverTripData } from "@/utils/tripParsers";

export default function LiveTripDriver() {
    const router = useRouter();
    const [isCompleting, setIsCompleting] = useState(false);
    const [baseTrip, setBaseTrip] = useState<LiveDriverTripData | null>(null);
    const joinedTripRef = useRef<string | null>(null);
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
    const upsertLiveRiderPosition = useLiveDriverStore((state) => state.upsertLiveRiderPosition);
    const geoLat = useLocationStore((state) => state.latitude);
    const geoLng = useLocationStore((state) => state.longitude);
    const geoHeading = useLocationStore((state) => state.heading);
    const geoSpeed = useLocationStore((state) => state.speed);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const result = await getGoApi<Record<string, unknown>>("/api/live/driver/current");
            if (!mounted) return;
            if (!result.success || !result.trip) {
                router.replace("/driver/dashboard");
                return;
            }
            const parsed = toLiveDriverTripData(result.trip, "LiveTripDriver");
            setBaseTrip(parsed);
            initializeFromTrip(parsed);
        };
        void load();
        return () => {
            mounted = false;
            clear();
        };
    }, [initializeFromTrip, clear, router]);

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
        throw new Error("NEXT_PUBLIC_WS_URL environment variable is required");
    }
    const { isConnected, sendMessage } = useSocket(`${wsUrl}/ws`, {
        onMessage: (message) => {
            if (!baseTrip) return;
            if (message.event === "trip_completed" && typeof message.payload === "object" && message.payload) {
                const payload = message.payload as Record<string, unknown>;
                if (payload.tripId !== baseTrip.trip_id) return;
                toast.success("Trip completed");
                router.replace(`/trips/${baseTrip.trip_id}`);
                return;
            }
            if (message.event === "rider_location_updated" && typeof message.payload === "object" && message.payload) {
                const payload = message.payload as Record<string, unknown>;
                if (payload.tripId !== baseTrip.trip_id) return;
                const riderId = String(payload.userId || "");
                const lat = Number(payload.lat);
                const lng = Number(payload.lng);
                if (!riderId || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
                upsertLiveRiderPosition({
                    riderId,
                    lat,
                    lng,
                    status: String(payload.status || "online"),
                });
            }
        },
    });

    useEffect(() => {
        if (!isConnected || !baseTrip) return;
        if (joinedTripRef.current === baseTrip.trip_id) return;

        sendMessage("join_trip", { tripId: baseTrip.trip_id, role: "driver" });
        joinedTripRef.current = baseTrip.trip_id;
    }, [isConnected, baseTrip, sendMessage]);

    useEffect(() => {
        if (!isConnected) {
            joinedTripRef.current = null;
        }
    }, [isConnected]);

    useEffect(() => {
        if (!isConnected || geoLat == null || geoLng == null || !baseTrip) return;

        const sendCurrent = () => {
            sendMessage("location_update", {
                tripId: baseTrip.trip_id,
                lat: geoLat,
                lng: geoLng,
                heading: geoHeading,
                speedKmph: geoSpeed == null ? null : geoSpeed * 3.6,
            });
        };

        sendCurrent();
        const id = setInterval(sendCurrent, 3000);
        return () => clearInterval(id);
    }, [isConnected, geoLat, geoLng, geoHeading, geoSpeed, baseTrip, sendMessage]);

    const displayTrip = liveTrip || baseTrip;
    const waitingCount = useMemo(() => riders.filter((r) => r.status === "waiting").length, [riders]);
    const onboardCount = useMemo(() => riders.filter((r) => r.status === "onboard").length, [riders]);
    const completionDistanceMeters = useMemo(() => {
        if (!driverPosition || !displayTrip) return null;
        return distanceMeters(driverPosition.lat, driverPosition.lng, displayTrip.to_lat, displayTrip.to_lng);
    }, [driverPosition, displayTrip]);
    const canCompleteTrip = completionDistanceMeters != null && completionDistanceMeters <= 100;
    const updatedAtLabel = driverPosition?.lastUpdated
        ? new Date(driverPosition.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--:--";

    const handleCompleteTrip = async () => {
        if (!displayTrip) return;
        setIsCompleting(true);
        try {
            const result = await postGoApi(`/api/trips/${displayTrip.trip_id}/complete`);
            if (!result.success) {
                toast.error(result.message);
                return;
            }
            toast.success(result.message);
            router.push(result.redirectTo || `/trips/${displayTrip.trip_id}`);
        } finally {
            setIsCompleting(false);
        }
    };

    if (!displayTrip) {
        return <main className="min-h-screen bg-slate-950" />;
    }

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
                        <p className="text-sm font-bold text-white">{formatDistanceKm(completedDistanceKm)}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Remaining</p>
                        <p className="text-sm font-bold text-white">{formatDistanceKm(remainingDistanceKm)}</p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <HiClock className="h-3 w-3 text-slate-400" />
                    Driver update {updatedAtLabel}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <HiLocationMarker className="h-3 w-3 text-slate-400" />
                    Driver {formatCoordinate(driverPosition?.lat)} , {formatCoordinate(driverPosition?.lng)}
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

                <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/40 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Trip Completion</p>
                    <p className="mt-1 text-[11px] text-slate-300">
                        {completionDistanceMeters == null
                            ? "Waiting for driver location."
                            : `${Math.round(completionDistanceMeters)}m from destination`}
                    </p>
                    <button
                        onClick={handleCompleteTrip}
                        disabled={!canCompleteTrip || isCompleting}
                        className="mt-3 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 enabled:hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isCompleting ? "Completing..." : "Complete Trip"}
                    </button>
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
                                    Live {formatCoordinate(rider.current_lat)} , {formatCoordinate(rider.current_lng)}
                                </p>
                            </div>

                            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Status is rider-controlled
                            </p>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
