"use client";

import Card from "@/components/UI/Card";
import { HiX, HiStar, HiChevronRight } from "react-icons/hi";
import { useState } from "react";
import { createRideRequestAction } from "@/app/actions/tripActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { parseWKT } from "@/utils/geo";
import { TripSearchResult, TripLocation } from "@/store/types";
import { useUserRidesStore } from "@/store/userRidesStore";

interface TripInfoProps {
    selectedTrip: TripSearchResult | null;
    setSelectedTrip: (trip: TripSearchResult | null) => void;
    from: TripLocation | null;
    to: TripLocation | null;
}

export default function TripInfo({ selectedTrip, setSelectedTrip, from, to }: TripInfoProps) {
    const [loading, setLoading] = useState(false);
    const [seats, setSeats] = useState(1);
    const router = useRouter();

    if (!selectedTrip) return null;

    const {
        driver_name,
        driver_rating,
        vehicle_type,
        vehicle_number,
        vehicle_info,
        fare_per_seat,
        available_seats,
        from_address,
        to_address,
        stops = [],
        riders = []
    } = selectedTrip;

    const vehicleModel = vehicle_info?.model || vehicle_type;
    const vehicleColor = vehicle_info?.color || "";

    const handleJoin = async () => {
        if (!selectedTrip || !from || !to) {
            toast.error("Pickup and destination locations are required");
            return;
        }

        setLoading(true);
        try {
            const pickupPoint = parseWKT(selectedTrip.pickup_route_point);
            const dropPoint = parseWKT(selectedTrip.drop_route_point);

            const result = await createRideRequestAction({
                trip_id: selectedTrip.id,
                pickup_location: pickupPoint || { lat: from.lat, lng: from.lng },
                pickup_address: from.address,
                drop_location: dropPoint || { lat: to.lat, lng: to.lng },
                drop_address: to.address,
                seats: seats,
                total_fare: selectedTrip.fare_per_seat * seats
            });

            if (result.success) {
                toast.success("Ride request sent successfully!");
                useUserRidesStore.getState().fetchTrips();
                setSelectedTrip(null);
                router.push("/trips");
            } else {
                toast.error(result.message || "Failed to send ride request");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute top-8 left-104 w-full max-w-sm z-10 bottom-8 transition-all duration-500 animate-in slide-in-from-left-4 fade-in">
            <Card className="h-full border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group/card flex flex-col p-0">

                <div className="p-5 pb-3 relative shrink-0 border-b border-white/5 bg-white/5">
                    <button
                        onClick={() => setSelectedTrip(null)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <HiX className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
                            {driver_name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">{driver_name}</h2>
                            <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                                <HiStar className="w-3.5 h-3.5" />
                                <span>{driver_rating || "New"}</span>
                                <span className="text-slate-500 font-medium ml-1">({selectedTrip.driver_total_ratings || 0} rides)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Vehicle Details</h3>
                        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                            <div>
                                <p className="text-sm font-bold text-white capitalize">{vehicleColor} {vehicleModel}</p>
                                <p className="text-xs text-blue-400 font-mono mt-0.5">{vehicle_number}</p>
                            </div>
                            <div className="text-2xl opacity-20 transform scale-150 grayscale">
                                🚗
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-b border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Trip Route</h3>
                        <div className="relative pl-4 space-y-6">
                            <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-linear-to-b from-blue-500 via-indigo-500 to-emerald-500 opacity-30" />

                            <div className="relative flex gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shrink-0 mt-1.5 z-10" />
                                <div>
                                    <p className="text-xs font-bold text-white">{from_address}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Pickup</p>
                                </div>
                            </div>

                            {stops && stops.map((stop: any, idx: number) => (
                                <div key={idx} className="relative flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 ring-4 ring-slate-900 shrink-0 mt-1.5 ml-0.5 z-10" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-300">{stop.address}</p>
                                        <p className="text-[10px] text-slate-600 mt-0.5">Stop {idx + 1}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="relative flex gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0 mt-1.5 z-10" />
                                <div>
                                    <p className="text-xs font-bold text-white">{to_address}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Dropoff</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {riders && riders.length > 0 && (
                        <div className="p-5 border-b border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">On Board ({riders.length})</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {riders.map((rider: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-2.5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                            {rider.name.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-slate-200 truncate">{rider.name}</p>
                                            <p className="text-[9px] text-slate-500">Passenger</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-5 bg-slate-950/80 backdrop-blur-md border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Seats to Book</p>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-1">
                                <button
                                    onClick={() => setSeats(Math.max(1, seats - 1))}
                                    className="w-8 h-8 rounded-lg hover:bg-white/10 text-white font-black transition-all active:scale-95"
                                >
                                    -
                                </button>
                                <span className="text-sm font-black text-white w-4 text-center">{seats}</span>
                                <button
                                    onClick={() => setSeats(Math.min(available_seats, seats + 1))}
                                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black transition-all active:scale-95 shadow-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{available_seats} Seats Available</p>
                            <p className="text-[10px] text-slate-500">Instant Booking</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Fare</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">RS {fare_per_seat * seats}</span>
                                <span className="text-[10px] text-slate-500 font-bold">({seats}x RS {fare_per_seat})</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={loading || available_seats === 0}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Request to Join
                                <HiChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>

            </Card>
        </div>
    );
}
