"use client";

import { useState } from "react";
import { cancelTripAction, markRiderDroppedOffAction, markRiderOnboardAction, startTripAction } from "@/app/actions/driverActions";
import { cancelBookingAction } from "@/app/actions/tripActions";
import { HiX, HiPhone, HiChevronDown, HiChevronUp, HiLocationMarker, HiClock, HiCurrencyRupee, HiUsers, HiExclamation } from "react-icons/hi";
import { toast } from "sonner";
import Overlay from "../UI/Overlay";
import Card from "../UI/Card";

import Link from "next/link";

interface DriverTripRequest {
    request_id?: string;
    id?: string;
    rider_id?: string;
    rider_name: string;
    rider_phone?: string;
    pickup_address: string;
    drop_address: string;
    seats: number;
    total_fare: number;
    status: string;
}

interface DriverTripCardData {
    trip_id: string;
    from_address: string;
    to_address: string;
    travel_date: string;
    fare_per_seat: number;
    total_seats: number;
    available_seats: number;
    trip_status: string;
    ride_requests: DriverTripRequest[];
}

interface TripCardProps {
    trip: DriverTripCardData;
    onUpdate: () => void;
}

export default function DriverTripCard({ trip, onUpdate }: TripCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [showRemoveRiderModal, setShowRemoveRiderModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [removeReason, setRemoveReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const getRequestId = (request: DriverTripRequest) => request.request_id || request.id || "";

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleCancelTrip = async () => {
        setIsLoading(true);
        try {
            const result = await cancelTripAction(trip.trip_id, cancelReason);
            if (result.success) {
                toast.success(result.message);
                setShowCancelModal(false);
                onUpdate();
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartTrip = async () => {
        setIsLoading(true);
        try {
            const result = await startTripAction(trip.trip_id);
            if (result.success) {
                toast.success(result.message);
                window.location.href = "/driver/live";
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveRider = async () => {
        if (!selectedRequestId) return;
        setIsLoading(true);
        try {
            const result = await cancelBookingAction(selectedRequestId, removeReason);
            if (result.success) {
                toast.success(result.message);
                setShowRemoveRiderModal(false);
                setSelectedRequestId(null);
                setRemoveReason("");
                onUpdate();
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const waitingRequests = trip.ride_requests.filter((r) => r.status === "waiting" || r.status === "onboard");

    return (
        <>
            <div className={`bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <Link href={`/trips/${trip.trip_id}`} className="flex-1 group/link">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`status-badge status-${trip.trip_status}`}>
                                    {trip.trip_status === 'ongoing' ? 'Ongoing' : trip.trip_status}
                                </span>
                                {waitingRequests.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                        {waitingRequests.length} Joined
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <HiLocationMarker className="w-4 h-4 text-indigo-400 shrink-0 group-hover/link:scale-110 transition-transform" />
                                <span className="text-white font-bold truncate group-hover/link:text-indigo-400 transition-colors">{trip.from_address.split(",")[0]}</span>
                                <span className="text-slate-600">→</span>
                                <span className="text-white font-bold truncate group-hover/link:text-indigo-400 transition-colors">{trip.to_address.split(",")[0]}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                                <span className="flex items-center gap-1">
                                    <HiClock className="w-3.5 h-3.5" />
                                    {formatDate(trip.travel_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiCurrencyRupee className="w-3.5 h-3.5" />
                                    {trip.fare_per_seat}/seat
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiUsers className="w-3.5 h-3.5" />
                                    {trip.available_seats}/{trip.total_seats} available
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            {trip.trip_status === 'scheduled' && (
                                <button
                                    onClick={handleStartTrip}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Start Trip
                                </button>
                            )}
                            {trip.trip_status === 'ongoing' && (
                                <>
                                    <Link
                                        href="/driver/live"
                                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all animate-pulse"
                                    >
                                        Live
                                    </Link>
                                </>
                            )}
                            {trip.trip_status === 'scheduled' && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                    title="Cancel Trip"
                                >
                                    <HiX className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        {expanded ? "Hide" : "Show"} Requests ({trip.ride_requests.length})
                        {expanded ? <HiChevronUp className="w-3 h-3" /> : <HiChevronDown className="w-3 h-3" />}
                    </button>
                </div>

                {expanded && trip.ride_requests.length > 0 && (
                    <div className="border-t border-white/5 divide-y divide-white/5">
                        {trip.ride_requests.map((request) => {
                            const requestId = getRequestId(request);
                            return (
                            <div key={requestId} className="p-4 bg-slate-950/30">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-bold text-white">{request.rider_name}</span>
                                        <span className={`status-badge status-${request.status}`}>
                                            {request.status === 'waiting' ? 'Joined' :
                                                request.status === 'onboard' ? 'Onboard' :
                                                    request.status === 'dropedoff' ? 'Dropped Off' : request.status}
                                        </span>
                                        <p className="text-[10px] text-slate-500 truncate">
                                            {request.pickup_address.split(",")[0]} → {request.drop_address.split(",")[0]}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                                            <span>{request.seats} seat{request.seats > 1 ? "s" : ""}</span>
                                            <span className="text-emerald-400 font-bold">₹{request.total_fare}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {request.rider_phone && (
                                            <a
                                                href={`tel:${request.rider_phone}`}
                                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                            >
                                                <HiPhone className="w-3.5 h-3.5" />
                                            </a>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {request.status === "waiting" && trip.trip_status === "ongoing" && (
                                                <button
                                                    onClick={async () => {
                                                        if (!requestId) return;
                                                        const result = await markRiderOnboardAction(requestId);
                                                        if (result.success) {
                                                            toast.success(result.message);
                                                            onUpdate();
                                                            return;
                                                        }
                                                        toast.error(result.message);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Onboard
                                                </button>
                                            )}
                                            {request.status === "onboard" && (
                                                <button
                                                    onClick={async () => {
                                                        if (!requestId) return;
                                                        const result = await markRiderDroppedOffAction(requestId);
                                                        if (result.success) {
                                                            toast.success(result.message);
                                                            onUpdate();
                                                            return;
                                                        }
                                                        toast.error(result.message);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Drop Off
                                                </button>
                                            )}
                                            {request.status === "waiting" && trip.trip_status === "scheduled" && (
                                                <button
                                                    onClick={() => {
                                                        if (!requestId) return;
                                                        setSelectedRequestId(requestId);
                                                        setShowRemoveRiderModal(true);
                                                    }}
                                                    disabled={!requestId}
                                                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                                    title="Cancel Request"
                                                >
                                                    <HiX className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>


                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}

                {expanded && trip.ride_requests.length === 0 && (
                    <div className="border-t border-white/5 p-6 text-center">
                        <p className="text-xs text-slate-600">No ride requests yet</p>
                    </div>
                )}
            </div>

            <Overlay isOpen={showRemoveRiderModal} onClose={() => !isLoading && setShowRemoveRiderModal(false)}>
                <Card className="relative max-w-md w-full border-white/10 p-6 animate-in zoom-in-95 duration-300 shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <HiExclamation className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-black text-white">Cancel Ride Request</h3>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                        Are you sure you want to cancel this rider&apos;s booking?
                    </p>

                    <textarea
                        value={removeReason}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        placeholder="Reason for cancellation (optional)"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none mb-4"
                        rows={2}
                    />

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={() => setShowRemoveRiderModal(false)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                        >
                            Keep Rider
                        </button>
                        <button
                            onClick={handleRemoveRider}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Cancel Request
                        </button>
                    </div>
                </Card>
            </Overlay>

            <Overlay isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
                <Card className="relative max-w-md w-full border-white/10 p-6 animate-in zoom-in-95 duration-300 shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <HiExclamation className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-black text-white">Cancel Trip</h3>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                        Are you sure you want to cancel this trip? All pending requests will be cancelled.
                    </p>

                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation (optional)"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none mb-2"
                        rows={3}
                    />

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={() => setShowCancelModal(false)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                        >
                            Keep Trip
                        </button>
                        <button
                            onClick={handleCancelTrip}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Cancel Trip
                        </button>
                    </div>
                </Card>
            </Overlay>
        </>
    );
}
