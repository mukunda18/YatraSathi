"use client";

import { HiUserGroup, HiClock } from "react-icons/hi";
import { TripSearchResult } from "@/store/types";
import { toast } from "sonner";
import { useState } from "react";
import { createRideRequestAction } from "@/app/actions/tripActions";
import { useTripSearchStore } from "@/store/tripSearchStore";
import { useRouter } from "next/navigation";
import { parseWKT } from "@/utils/geo";

interface TripResultCardProps {
    trip: TripSearchResult;
    isSelected: boolean;
    onClick: () => void;
}

export default function TripResultCard({ trip, isSelected, onClick }: TripResultCardProps) {
    const [loading, setLoading] = useState(false);
    const { from, to } = useTripSearchStore();
    const router = useRouter();

    const handleBook = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!from || !to) {
            toast.error("Pickup and destination locations are required");
            return;
        }

        setLoading(true);
        try {
            const pickupPoint = parseWKT(trip.pickup_route_point);
            const dropPoint = parseWKT(trip.drop_route_point);

            const result = await createRideRequestAction({
                trip_id: trip.id,
                pickup_location: pickupPoint || { lat: from.lat, lng: from.lng },
                pickup_address: from.address,
                drop_location: dropPoint || { lat: to.lat, lng: to.lng },
                drop_address: to.address,
                seats: 1,
                total_fare: trip.fare_per_seat
            });

            if (result.success) {
                toast.success("Ride request sent successfully!");
                router.push("/dashboard");
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
        <div
            onClick={onClick}
            className={`w-full text-left cursor-pointer transition-all duration-300 group/item ${isSelected ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
        >
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-blue-950/40 border-blue-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xs font-black text-white group-hover/item:text-blue-400 transition-colors uppercase tracking-tight">{trip.driver_name}</h3>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">{trip.vehicle_type} • {trip.vehicle_number}</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-[14px] font-black text-blue-400 leading-none">RS {trip.fare_per_seat}</span>
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">per seat</span>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <HiClock className="text-blue-500 w-3 h-3 shrink-0" />
                        <span className="font-medium">
                            {new Date(trip.travel_date).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400">
                        <HiUserGroup className="text-blue-500 w-3 h-3 shrink-0" />
                        <span className="font-bold uppercase tracking-wider">{trip.available_seats} Seats Available</span>
                    </div>
                </div>

                <div className="flex gap-2 relative z-10">
                    <button
                        onClick={handleBook}
                        disabled={loading || trip.available_seats === 0}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : 'Book Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
