"use client";

import { useState, useEffect } from "react";
import TripMap from "../map/TripMap";
import { searchTripsAction } from "@/app/actions/searchActions";
import { toast } from "sonner";
import Card from "@/components/UI/Card";
import { HiSearch, HiLocationMarker } from "react-icons/hi";
import LocationField from "./ui/LocationField";
import TripResultCard from "./ui/TripResultCard";
import TripInfo from "./ui/TripInfo";
import TripResultSkeleton from "../skeletons/TripResultSkeleton";
import { TripLocation, TripSearchResult, SearchFormContext } from "@/store/types";

export default function TripSearchForm() {
    const [from, setFrom] = useState<TripLocation | null>(null);
    const [to, setTo] = useState<TripLocation | null>(null);
    const [fromAddress, setFromAddress] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [searchResults, setSearchResults] = useState<TripSearchResult[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<TripSearchResult | null>(null);
    const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
    const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProposedRoute = async () => {
            if (!from || !to || selectedTrip) {
                if (!selectedTrip) setRouteGeometry(null);
                return;
            }

            const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
            try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
                const data = await res.json();

                if (data.code === 'Ok' && data.routes?.length > 0) {
                    setRouteGeometry(data.routes[0].geometry.coordinates);
                }
            } catch (error) {
                console.error("Error fetching proposed route:", error);
            }
        };

        fetchProposedRoute();
    }, [from, to, selectedTrip]);

    const context: SearchFormContext = {
        from, to, fromAddress, toAddress, searchResults, selectedTrip, routeGeometry, activeField, currentPosition,
        setFrom, setTo, setFromAddress, setToAddress, setSearchResults, setSelectedTrip, setRouteGeometry, setActiveField, setCurrentPosition
    };

    const handleMapClick = async (lat: number, lng: number) => {
        if (!activeField) return;

        const tempAddress = "Locating...";
        if (activeField === "from") {
            setFrom({ lat, lng, address: tempAddress });
        } else if (activeField === "to") {
            setTo({ lat, lng, address: tempAddress });
        }

        const fieldToUpdate = activeField;
        setActiveField(null);

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const address = data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

            if (fieldToUpdate === "from") {
                setFrom({ lat, lng, address });
                setFromAddress(address);
            } else if (fieldToUpdate === "to") {
                setTo({ lat, lng, address });
                setToAddress(address);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            const fallbackAddress = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            if (fieldToUpdate === "from") {
                setFrom({ lat, lng, address: fallbackAddress });
                setFromAddress(fallbackAddress);
            } else if (fieldToUpdate === "to") {
                setTo({ lat, lng, address: fallbackAddress });
                setToAddress(fallbackAddress);
            }
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const isFromVerified = from && from.address.trim() === fromAddress.trim();
        const isToVerified = to && to.address.trim() === toAddress.trim();

        if (!isFromVerified || !isToVerified) {
            toast.error("Please select locations from suggestions or map to verify them.");
            return;
        }

        setLoading(true);

        try {
            const result = await searchTripsAction({
                from_location: { lat: from.lat, lng: from.lng },
                to_location: { lat: to.lat, lng: to.lng }
            });

            if (result.success) {
                setSearchResults(result.trips || []);
                if (result.trips?.length === 0) {
                    toast.info("No trips found for this route.");
                }
            } else {
                toast.error(result.message || "Search failed");
            }
        } catch (error) {
            toast.error("An unexpected error occurred during search.");
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (trip: TripSearchResult) => {
        setSelectedTrip(selectedTrip?.id === trip.id ? null : trip);
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            <TripMap
                mode="search"
                from={from}
                to={to}
                routeGeometry={(selectedTrip ? selectedTrip.route_geometry : routeGeometry) || null}
                selectedTrip={selectedTrip}
                activeField={activeField}
                onMapClick={handleMapClick}
            />

            <div className="absolute top-8 left-8 w-full max-w-sm z-10 bottom-8">
                <Card className="h-full border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group/card transition-all duration-500 hover:border-blue-500/20 flex flex-col p-0">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full transition-all duration-700 group-hover/card:bg-blue-500/20" />

                    <div className="p-5 pb-3 relative shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                                <HiSearch className="text-blue-500 w-5 h-5" />
                                <span>Find <span className="text-blue-500 font-black italic">Ride</span></span>
                            </h2>
                            <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase tracking-widest">Passenger Mode</div>
                        </div>
                    </div>

                    <div className="px-5 pb-5 space-y-3 relative shrink-0">
                        <LocationField
                            mode="search"
                            type="from"
                            label="Pickup"
                            placeholder="Where are you?"
                            colorClass="blue"
                            iconColor="text-blue-400"
                            context={context}
                        />

                        <LocationField
                            mode="search"
                            type="to"
                            label="Destination"
                            placeholder="Where to?"
                            colorClass="indigo"
                            iconColor="text-indigo-400"
                            context={context}
                        />

                        <button
                            onClick={(e) => handleSearch(e)}
                            disabled={loading}
                            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : <HiSearch className="w-3.5 h-3.5" />}
                            {loading ? 'Searching...' : 'Find Match'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 pb-5 modern-scrollbar space-y-3 border-t border-white/5 pt-4 bg-slate-950/20">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <TripResultSkeleton key={i} />
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            <>
                                <div className="px-1 flex items-center justify-between sticky top-0 py-1 bg-transparent z-10 text-white">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{searchResults.length} Matches Found</span>
                                    <button onClick={() => setSearchResults([])} className="text-[8px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">Clear</button>
                                </div>
                                {searchResults.map((trip) => (
                                    <TripResultCard
                                        key={trip.id}
                                        trip={trip}
                                        isSelected={selectedTrip?.id === trip.id}
                                        onClick={() => handleResultClick(trip)}
                                        from={from}
                                        to={to}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 border border-white/5 rounded-3xl border-dashed opacity-50">
                                <HiLocationMarker className="w-8 h-8 text-slate-800" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 text-center px-8 leading-loose">Enter points to find rides</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
            <TripInfo
                selectedTrip={selectedTrip}
                setSelectedTrip={setSelectedTrip}
                from={from}
                to={to}
            />
        </div>
    );
}
