"use client";

import { useState } from "react";
import { cancelRideRequestAction } from "@/app/actions/tripActions";
import { HiX, HiLocationMarker, HiClock, HiCurrencyRupee, HiUser, HiExclamation, HiStar, HiStatusOnline } from "react-icons/hi";
import { toast } from "sonner";
import Overlay from "../UI/Overlay";
import Card from "../UI/Card";
import Link from "next/link";
import { UserTrip } from "@/store/userRidesStore";

interface UserTripCardProps {
    trip: UserTrip;
    onUpdate: () => void;
}

export default function UserTripCard({ trip, onUpdate }: UserTripCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };



    const handleCancelBooking = async () => {
        setIsLoading(true);
        try {
            const result = await cancelRideRequestAction(trip.request_id, cancelReason);
            if (result.success) {
                toast.success(result.message);
                setShowCancelModal(false);
                setCancelReason("");
                onUpdate();
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const canCancel = trip.request_status !== 'cancelled' && trip.trip_status === 'scheduled';

    return (
        <>
            <div className={`bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <Link href={`/trips/${trip.trip_id}`} prefetch={true} className="flex-1 group/link min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`status-badge status-${trip.request_status}`}>
                                    {trip.request_status === 'waiting' ? 'Joined' :
                                        trip.request_status === 'onboard' ? 'Onboard' :
                                            trip.request_status === 'dropedoff' ? 'Dropped Off' : trip.request_status}
                                </span>
                                {trip.trip_status === 'cancelled' && (
                                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-400">
                                        Trip Cancelled
                                    </span>
                                )}
                                {trip.trip_status === 'ongoing' && (
                                    <Link
                                        href={`/live/${trip.trip_id}`}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                                    >
                                        <HiStatusOnline className="w-3 h-3" />
                                        Live
                                    </Link>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <HiLocationMarker className="w-4 h-4 text-indigo-400 shrink-0 group-hover/link:scale-110 transition-transform" />
                                <span className="text-white font-bold truncate group-hover/link:text-indigo-400 transition-colors">{trip.pickup_address.split(",")[0]}</span>
                                <span className="text-slate-600">→</span>
                                <span className="text-white font-bold truncate group-hover/link:text-indigo-400 transition-colors">{trip.drop_address.split(",")[0]}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                                <span className="flex items-center gap-1">
                                    <HiClock className="w-3.5 h-3.5" />
                                    {formatDate(trip.travel_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiCurrencyRupee className="w-3.5 h-3.5" />
                                    {trip.total_fare}
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiUser className="w-3.5 h-3.5" />
                                    {trip.requested_seats}/{trip.requested_seats} seats
                                </span>
                            </div>
                        </Link>

                        {canCancel && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowCancelModal(true);
                                }}
                                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Cancel Booking"
                            >
                                <HiX className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <HiUser className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-tight truncate">{trip.driver_name}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <HiStar className="w-2.5 h-2.5" />
                                    <span className="text-[9px] font-black">{trip.driver_rating || "4.8"}</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider truncate">{trip.vehicle_type} • {trip.vehicle_number}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Overlay isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
                <Card className="relative max-w-md w-full border-white/10 p-6 animate-in zoom-in-95 duration-300 shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <HiExclamation className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-black text-white">Cancel Booking</h3>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                        Are you sure you want to cancel your booking?
                    </p>

                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation (optional)"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none mb-4"
                        rows={2}
                    />

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={() => setShowCancelModal(false)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleCancelBooking}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Cancel Booking
                        </button>
                    </div>
                </Card>
            </Overlay>
        </>
    );
}
