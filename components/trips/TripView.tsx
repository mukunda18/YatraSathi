"use client";

import TripMap from "@/components/map/TripMap";
import { HiClock, HiUser, HiCurrencyRupee, HiPhone, HiStar, HiTruck, HiArrowLeft, HiXCircle, HiUserGroup, HiLocationMarker } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cancelTripAction, cancelRideRequestAction } from "@/app/actions/tripActions";
import { toast } from "sonner";
import { HiTrash } from "react-icons/hi2";
import ConfirmationModal from "@/components/UI/ConfirmationModal";
import { TripViewData } from "@/store/types";

interface TripViewClientProps {
    initialTrip: TripViewData;
    isDriver?: boolean;
}

export default function TripViewClient({ initialTrip, isDriver = false }: TripViewClientProps) {
    const currentTrip = initialTrip;
    const router = useRouter();
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelMode, setCancelMode] = useState<"trip" | "booking" | null>(null);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "waiting": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "accepted": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "completed": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            case "cancelled": return "text-red-400 bg-red-500/10 border-red-500/20";
            case "scheduled": return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
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
            const result = await cancelRideRequestAction(currentTrip.my_request.id, currentTrip.trip_id);
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

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row">
            {/* Map Area */}
            <div className="flex-1 relative order-2 md:order-1 h-1/2 md:h-full">
                <TripMap mode="view" trip={currentTrip} />

                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
                >
                    <HiArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* Info Sidebar Area */}
            <div className="w-full md:w-[400px] bg-slate-950 border-l border-white/5 z-10 overflow-y-auto modern-scrollbar order-1 md:order-2 h-1/2 md:h-full">
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusColor(currentTrip.trip_status)}`}>
                                {currentTrip.trip_status}
                            </span>
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
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0 -ml-[21px] ring-4 ring-purple-500/10" />
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
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${getStatusColor(currentTrip.my_request.status)}`}>
                                        {currentTrip.my_request.status}
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

            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => !cancelling && setShowCancelModal(false)}
                onConfirm={cancelMode === 'trip' ? confirmCancelTrip : confirmCancelBooking}
                title={cancelMode === 'trip' ? "Cancel Entire Trip?" : "Cancel Your Booking?"}
                message={cancelMode === 'trip'
                    ? "This will cancel the trip for all riders and cannot be undone. Are you sure?"
                    : "Are you sure you want to cancel your booking for this trip?"}
                confirmLabel={cancelMode === 'trip' ? "Yes, Cancel Trip" : "Yes, Cancel Booking"}
                cancelLabel="Keep it"
                variant="danger"
                isLoading={cancelling}
            />
        </div>
    );
}
