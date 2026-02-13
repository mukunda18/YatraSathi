"use client";

import TripMap from "@/components/map/TripMap";
import { HiClock, HiUser, HiCurrencyRupee, HiPhone, HiStar, HiTruck, HiXCircle, HiUserGroup, HiLocationMarker, HiExclamation, HiStatusOnline } from "react-icons/hi";
import { useState } from "react";
import Link from "next/link";
import { cancelBookingAction } from "@/app/actions/tripActions";
import { startTripAction, cancelTripAction } from "@/app/actions/driverActions";
import { toast } from "sonner";
import { HiTrash } from "react-icons/hi2";
import Card from "@/components/UI/Card";
import Overlay from "@/components/UI/Overlay";
import { TripViewData } from "@/store/types";

interface TripViewClientProps {
    initialTrip: TripViewData;
    isDriver?: boolean;
}

export default function TripViewClient({ initialTrip, isDriver = false }: TripViewClientProps) {
    const currentTrip = initialTrip;
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelMode, setCancelMode] = useState<"trip" | "booking" | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isStatusLoading, setIsStatusLoading] = useState(false);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };


    const handleCancelTrip = () => {
        setCancelMode("trip");
        setShowCancelModal(true);
    };

    const confirmCancelTrip = async () => {
        setCancelling(true);
        try {
            const result = await cancelTripAction(currentTrip.trip_id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setCancelling(false);
            setShowCancelModal(false);
        }
    };

    const handleCancelBooking = () => {
        if (!currentTrip.my_request) return;
        setCancelMode("booking");
        setShowCancelModal(true);
    };

    const confirmCancelBooking = async () => {
        if (!currentTrip.my_request) return;

        setCancelling(true);
        try {
            const result = await cancelBookingAction(currentTrip.my_request.id, cancelReason);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setCancelling(false);
            setShowCancelModal(false);
            setCancelReason("");
        }
    };

    const handleStartTrip = async () => {
        setIsStatusLoading(true);
        try {
            const result = await startTripAction(currentTrip.trip_id);
            if (result.success) {
                toast.success(result.message);
                window.location.href = "/driver/live";
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to start trip");
        } finally {
            setIsStatusLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row">
            {/* Map Area */}
            <div className="flex-1 relative order-2 md:order-2 h-1/2 md:h-full">
                <TripMap mode="view" trip={currentTrip} />
            </div>

            {/* Info Sidebar Area */}
            <div className="w-full md:w-100 bg-slate-950 border-l border-white/5 z-10 overflow-y-auto modern-scrollbar order-1 md:order-1 h-1/2 md:h-full">
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className={`status-badge status-${currentTrip.trip_status}`}>
                                {currentTrip.trip_status}
                            </span>
                            {currentTrip.trip_status === 'ongoing' && (
                                <Link
                                    href={isDriver ? "/driver/live" : `/live/${currentTrip.trip_id}`}
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse transition-all hover:bg-red-500/20"
                                >
                                    <HiStatusOnline className="w-4 h-4 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Live Tracking</span>
                                </Link>
                            )}
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <HiClock className="w-4 h-4" />
                                <span className="text-[11px] font-bold">{formatDate(currentTrip.travel_date)}</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                            Trip <span className="text-indigo-500">View</span>
                        </h1>
                    </div>

                    {/* Route Info */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 ring-4 ring-indigo-500/10" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Pickup</p>
                                <p className="text-sm text-white font-bold leading-relaxed">{currentTrip.from_address}</p>
                            </div>
                        </div>

                        {currentTrip.stops && currentTrip.stops.length > 0 && (
                            <div className="ml-1 pl-4 border-l border-dashed border-slate-800 space-y-6">
                                {currentTrip.stops.map((stop, index) => (
                                    <div key={stop.id} className="flex items-start gap-4 relative">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0 -ml-5.25 ring-4 ring-purple-500/10" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Stop {index + 1}</p>
                                            <p className="text-sm text-slate-300 font-medium">{stop.stop_address}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 ring-4 ring-emerald-500/10" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Destination</p>
                                <p className="text-sm text-white font-bold leading-relaxed">{currentTrip.to_address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">Fare/Seat</p>
                            <p className="text-sm font-black text-emerald-400 flex items-center gap-0.5">
                                <HiCurrencyRupee className="w-3.5 h-3.5" />
                                {currentTrip.fare_per_seat}
                            </p>
                        </div>
                        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">Available</p>
                            <p className="text-sm font-black text-white">{currentTrip.available_seats}/{currentTrip.total_seats}</p>
                        </div>
                        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1">Seats</p>
                            <p className="text-sm font-black text-white">{currentTrip.total_seats}</p>
                        </div>
                    </div>

                    {/* Driver Card (Only for non-drivers) */}
                    {!isDriver && (
                        <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />

                            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4 relative">Driver Info</h3>
                            <div className="flex items-center gap-4 relative">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                    <HiUser className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-black text-white truncate">{currentTrip.driver_name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                        <span className="flex items-center gap-1 font-bold">
                                            <HiStar className="w-3 h-3 text-amber-400 shadow-amber-500/20" />
                                            {Number(currentTrip.driver_rating).toFixed(1)}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 truncate uppercase tracking-tighter">
                                            <HiTruck className="w-3 h-3" />
                                            {currentTrip.vehicle_type}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${currentTrip.driver_phone}`}
                                    className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all shrink-0 active:scale-90"
                                >
                                    <HiPhone className="w-4 h-4 text-emerald-400" />
                                </a>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 mb-1">Vehicle</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentTrip.vehicle_number}</p>
                            </div>
                        </div>
                    )}

                    {/* Passenger List (Only for drivers) */}
                    {isDriver && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                                <HiUserGroup className="w-4 h-4" />
                                Passenger List ({currentTrip.riders?.length || 0})
                            </h3>

                            <div className="space-y-3">
                                {currentTrip.riders && currentTrip.riders.length > 0 ? (
                                    currentTrip.riders.map((rider) => (
                                        <div key={rider.request_id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/10">
                                                        {rider.rider_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white">{rider.rider_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-500">{rider.seats} Seat{rider.seats > 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`tel:${rider.rider_phone}`}
                                                    className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/10 transition-all text-emerald-400 active:scale-90"
                                                >
                                                    <HiPhone className="w-3.5 h-3.5" />
                                                </a>
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-white/5">
                                                <div className="flex items-start gap-2">
                                                    <HiLocationMarker className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate">{rider.pickup_address}</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <HiLocationMarker className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate">{rider.drop_address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl text-center">
                                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No passengers yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* My Request Info (Only for non-drivers) */}
                    {!isDriver && currentTrip.my_request && (
                        <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-4">Your Booking</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Status</span>
                                    <span className={`status-badge status-${currentTrip.my_request.status}`}>
                                        {currentTrip.my_request.status === 'waiting' ? 'Joined' :
                                            currentTrip.my_request.status === 'onboard' ? 'Onboard' :
                                                currentTrip.my_request.status === 'dropedoff' ? 'Dropped Off' : currentTrip.my_request.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">Capacity</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentTrip.my_request.seats} Seats</span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-indigo-500/10">
                                    <span className="text-[10px] font-bold text-slate-500">Total Fare</span>
                                    <span className="text-lg font-black text-emerald-400 flex items-center gap-0.5">
                                        <HiCurrencyRupee className="w-4 h-4" />
                                        {currentTrip.my_request.total_fare}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {currentTrip.description && (
                        <div className="pt-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 ml-1">Notes from Driver</p>
                            <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl italic">
                                <p className="text-xs text-slate-400 leading-relaxed text-center">{currentTrip.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 space-y-3">
                        {isDriver && currentTrip.trip_status === 'scheduled' && (
                            <button
                                onClick={handleStartTrip}
                                disabled={isStatusLoading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isStatusLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Start Trip"
                                )}
                            </button>
                        )}

                        {isDriver && currentTrip.trip_status === 'ongoing' && (
                            <Link
                                href="/driver/live"
                                className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all animate-pulse text-center block"
                            >
                                Live Tracking
                            </Link>
                        )}

                        {isDriver && currentTrip.trip_status !== 'cancelled' && currentTrip.trip_status !== 'completed' && (
                            <button
                                onClick={handleCancelTrip}
                                disabled={cancelling}
                                className="w-full py-4 bg-slate-900 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group/cancel"
                            >
                                {cancelling ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <HiXCircle className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
                                        Cancel Entire Trip
                                    </>
                                )}
                            </button>
                        )}

                        {!isDriver && currentTrip.my_request && currentTrip.my_request.status !== 'cancelled' && (
                            <button
                                onClick={handleCancelBooking}
                                disabled={cancelling}
                                className="w-full py-4 bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <HiTrash className="w-4 h-4" />
                                        Cancel My Booking
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Overlay isOpen={showCancelModal} onClose={() => !cancelling && setShowCancelModal(false)}>
                <Card className="relative max-w-md w-full border-white/10 p-6 animate-in zoom-in-95 duration-300 shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <HiExclamation className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-black text-white">
                            {cancelMode === 'trip' ? "Cancel Entire Trip?" : "Cancel Your Booking?"}
                        </h3>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                        {cancelMode === 'trip'
                            ? "This will cancel the trip for all riders and cannot be undone. Are you sure?"
                            : "Are you sure you want to cancel your booking for this trip?"}
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
                            onClick={() => {
                                setShowCancelModal(false);
                                setCancelReason("");
                            }}
                            disabled={cancelling}
                            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                        >
                            Keep it
                        </button>
                        <button
                            onClick={cancelMode === 'trip' ? confirmCancelTrip : confirmCancelBooking}
                            disabled={cancelling}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {cancelling && (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {cancelMode === 'trip' ? "Yes, Cancel Trip" : "Yes, Cancel Booking"}
                        </button>
                    </div>
                </Card>
            </Overlay>
        </div>
    );
}
