"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiClock, HiLocationMarker } from "react-icons/hi";
import TripMap from "@/components/map/TripMap";
import { useLiveTripStore } from "@/store/liveTripStore";
import { TripViewData } from "@/store/types";
import { useLocationStore } from "@/store/locationStore";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { formatDistanceKm } from "@/utils/formatters";
import { getGoApi, postGoApi } from "@/utils/goApiClient";
import { toTripViewData } from "@/utils/tripParsers";

interface LiveTripClientProps {
    tripId: string;
}

export default function LiveTripClient({ tripId }: LiveTripClientProps) {
    const router = useRouter();
    const [baseTrip, setBaseTrip] = useState<TripViewData | null>(null);
    const [loading, setLoading] = useState(true);
    const joinedTripRef = useRef<string | null>(null);
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
    const upsertLiveRiderPosition = useLiveTripStore((state) => state.upsertLiveRiderPosition);
    const liveRiders = useLiveTripStore((state) => state.liveRiders);
    const geoLat = useLocationStore((state) => state.latitude);
    const geoLng = useLocationStore((state) => state.longitude);
    const geoHeading = useLocationStore((state) => state.heading);
    const geoSpeed = useLocationStore((state) => state.speed);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const result = await getGoApi<Record<string, unknown>>(`/api/live/trips/${tripId}`);
            if (!mounted) return;
            if (!result.success || !result.trip) {
                router.replace(`/trips/${tripId}`);
                return;
            }
            const parsed = toTripViewData(result.trip, "LiveTripClient");
            setBaseTrip(parsed);
            initializeFromTrip(parsed);
            setLoading(false);
        };
        void load();
        return () => {
            mounted = false;
            clear();
        };
    }, [tripId, initializeFromTrip, clear, router]);

    const isDriver = useMemo(() => {
        if (!baseTrip) return false;
        return Boolean(baseTrip.is_driver_viewer);
    }, [baseTrip]);

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
            if (message.event === "rider_dropped_off" && typeof message.payload === "object" && message.payload) {
                const payload = message.payload as Record<string, unknown>;
                if (payload.tripId !== baseTrip.trip_id) return;
                if (isDriver) return;
                if (String(payload.requestId || "") !== String(baseTrip.my_request?.id || "")) return;
                toast.success("You are now dropped off.");
                router.replace(`/trips/${baseTrip.trip_id}`);
                return;
            }
            if (message.event === "driver_location_updated" && typeof message.payload === "object" && message.payload) {
                const payload = message.payload as Record<string, unknown>;
                if (payload.tripId !== baseTrip.trip_id) return;
                const lat = Number(payload.lat);
                const lng = Number(payload.lng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
                useLiveTripStore.getState().setDriverPosition({
                    lat,
                    lng,
                    heading: payload.heading == null ? null : Number(payload.heading),
                    speedKmph: payload.speedKmph == null ? null : Number(payload.speedKmph),
                    lastUpdated: typeof payload.updatedAt === "string" ? payload.updatedAt : null,
                });
                return;
            }

            if (message.event === "rider_location_updated" && typeof message.payload === "object" && message.payload) {
                if (!isDriver) return;
                const payload = message.payload as Record<string, unknown>;
                if (payload.tripId !== baseTrip.trip_id) return;
                const requestId = String(payload.requestId || "");
                const lat = Number(payload.lat);
                const lng = Number(payload.lng);
                if (!requestId || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
                upsertLiveRiderPosition({
                    requestId,
                    riderName: String(payload.riderName || "Rider"),
                    lat,
                    lng,
                    status: String(payload.status || "online"),
                });
            }
        }
    });

    useEffect(() => {
        if (!isConnected || !baseTrip) return;
        if (joinedTripRef.current === baseTrip.trip_id) return;

        sendMessage("join_trip", {
            tripId: baseTrip.trip_id,
            role: isDriver ? "driver" : "rider",
        });
        joinedTripRef.current = baseTrip.trip_id;
    }, [isConnected, baseTrip, isDriver, sendMessage]);

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
    const currentTimeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updatedAtLabel = driverPosition?.lastUpdated
        ? new Date(driverPosition.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--:--";
    const speedLabel = driverPosition?.speedKmph != null ? `${driverPosition.speedKmph.toFixed(0)} km/h` : "--";
    const canMarkOnboard = !isDriver && displayTrip?.my_request?.status === "waiting";
    const canMarkDropoff = !isDriver && displayTrip?.my_request?.status === "onboard";

    const handleMarkOnboard = async () => {
        if (!displayTrip?.my_request?.id) return;
        const result = await postGoApi(`/api/requests/${displayTrip.my_request.id}/onboard`);
        if (result.success) {
            toast.success(result.message);
            router.refresh();
            return;
        }
        toast.error(result.message);
    };

    const handleMarkDropoff = async () => {
        if (!displayTrip?.my_request?.id) return;
        const result = await postGoApi(`/api/requests/${displayTrip.my_request.id}/dropoff`);
        if (result.success) {
            toast.success(result.message);
            router.push(result.redirectTo || `/trips/${displayTrip.trip_id}`);
            return;
        }
        toast.error(result.message);
    };

    if (loading || !displayTrip) {
        return <main className="min-h-screen bg-slate-950" />;
    }

    return (
        <div className="relative flex h-dvh w-full flex-col overflow-hidden">
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/5 bg-slate-950/40 p-3 backdrop-blur-xl md:p-4">
                <div className="flex items-center gap-3 md:gap-4">
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
                    liveRiders={liveRiders.map((rider) => ({
                        request_id: rider.requestId,
                        rider_name: rider.riderName,
                        lat: rider.lat,
                        lng: rider.lng,
                        status: rider.status,
                    }))}
                />
            </div>

            <div className="z-10 border-t border-white/5 bg-slate-950 p-3 md:p-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
                    <div className="flex w-full flex-1 items-center gap-3 md:gap-4">
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
                            <p className="text-xs font-bold text-white">{formatDistanceKm(completedDistanceKm)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Remaining</p>
                            <p className="text-xs font-bold text-white">{formatDistanceKm(remainingDistanceKm)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/50 px-3 py-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Speed</p>
                            <p className="text-xs font-bold text-white">{speedLabel}</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 md:justify-end md:gap-4">
                    <span className="inline-flex items-center gap-1">
                        <HiClock className="h-3 w-3 text-slate-400" />
                        Active {currentTimeLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <HiClock className="h-3 w-3 text-slate-400" />
                        Driver Update {updatedAtLabel}
                    </span>
                    <span>Total {formatDistanceKm(totalDistanceKm)}</span>
                </div>

                {!isDriver && (canMarkOnboard || canMarkDropoff) && (
                    <div className="mx-auto mt-3 flex max-w-3xl justify-end">
                        {canMarkOnboard && (
                            <button
                                onClick={handleMarkOnboard}
                                className="w-full md:w-auto rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:bg-indigo-500/20"
                            >
                                I am Onboard
                            </button>
                        )}
                        {canMarkDropoff && (
                            <button
                                onClick={handleMarkDropoff}
                                className="w-full md:w-auto rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/20"
                            >
                                I am Dropped Off
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
