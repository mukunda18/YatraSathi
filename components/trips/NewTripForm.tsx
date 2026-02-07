"use client";

import { useState } from "react";
import { createTripAction } from "@/app/actions/tripActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import { HiChatAlt2, HiPaperAirplane, HiPlusCircle } from "react-icons/hi";
import LocationField from "./ui/LocationField";
import DepartureSelector from "./ui/DepartureSelector";
import FareAndSeats from "./ui/FareAndSeats";
import TripMap from "../map/TripMap";
import { TripLocation, StopLocation, CreationFormContext } from "@/store/types";
import { useDriverRidesStore } from "@/store/driverRidesStore";

export default function NewTripForm() {
    const [from, setFrom] = useState<TripLocation | null>(null);
    const [to, setTo] = useState<TripLocation | null>(null);
    const [fromAddress, setFromAddress] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [stops, setStops] = useState<StopLocation[]>([]);
    const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
    const [activeField, setActiveField] = useState<"from" | "to" | string | null>(null);
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

    const [travelYear, setTravelYear] = useState(new Date().getFullYear().toString());
    const [travelMonth, setTravelMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const [travelDay, setTravelDay] = useState(new Date().getDate().toString().padStart(2, '0'));
    const [travelHour, setTravelHour] = useState("12");
    const [travelMinute, setTravelMinute] = useState("00");
    const [fare, setFare] = useState("");
    const [seats, setSeats] = useState(1);
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const addStop = () => {
        const id = Math.random().toString(36).substring(2, 9);
        setStops([...stops, { id, lat: 0, lng: 0, address: "" }]);
    };

    const removeStop = (id: string) => {
        setStops(stops.filter((s) => s.id !== id));
    };

    const updateStop = (id: string, loc: Partial<TripLocation>) => {
        setStops(stops.map((s) => s.id === id ? { ...s, ...loc } : s));
    };

    const clear = () => {
        setFrom(null);
        setTo(null);
        setFromAddress("");
        setToAddress("");
        setStops([]);
        setRouteGeometry(null);
        setActiveField(null);
        setTravelYear(new Date().getFullYear().toString());
        setTravelMonth((new Date().getMonth() + 1).toString().padStart(2, '0'));
        setTravelDay(new Date().getDate().toString().padStart(2, '0'));
        setTravelHour("12");
        setTravelMinute("00");
        setFare("");
        setSeats(1);
        setDescription("");
    };

    const context: CreationFormContext = {
        from, to, fromAddress, toAddress, stops, routeGeometry, activeField, currentPosition,
        travelYear, travelMonth, travelDay, travelHour, travelMinute, fare, seats, description,
        setFrom, setTo, setFromAddress, setToAddress, addStop, removeStop, updateStop,
        setRouteGeometry, setActiveField, setCurrentPosition,
        setTravelYear, setTravelMonth, setTravelDay, setTravelHour, setTravelMinute,
        setFare, setSeats, setDescription
    };

    const handleMapClick = async (lat: number, lng: number) => {
        if (!activeField) return;

        const tempAddress = "Locating...";
        if (activeField === "from") {
            setFrom({ lat, lng, address: tempAddress });
        } else if (activeField === "to") {
            setTo({ lat, lng, address: tempAddress });
        } else {
            updateStop(activeField, { lat, lng, address: tempAddress });
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
            } else {
                updateStop(fieldToUpdate, { lat, lng, address });
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
            } else {
                updateStop(fieldToUpdate, { lat, lng, address: fallbackAddress });
            }
        }
    };

    const isFromVerified = !!(from && fromAddress && from.address.trim() === fromAddress.trim());
    const isToVerified = !!(to && toAddress && to.address.trim() === toAddress.trim());
    const areStopsVerified = stops.every(stop => stop.lat !== 0 && stop.lng !== 0 && stop.address);
    const isReady = isFromVerified && isToVerified && areStopsVerified && fare && seats;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isReady) {
            toast.error("Please verify all locations and fill all required fields.");
            return;
        }

        const travelDate = `${travelYear}-${travelMonth}-${travelDay}T${travelHour}:${travelMinute}:00`;
        setLoading(true);

        try {
            const result = await createTripAction({
                from_location: { lat: from!.lat, lng: from!.lng },
                from_address: from!.address,
                to_location: { lat: to!.lat, lng: to!.lng },
                to_address: to!.address,
                travel_date: travelDate,
                fare_per_seat: Number(fare),
                total_seats: Number(seats),
                description,
                stops: stops.filter(s => s.lat && s.lng).map(s => ({
                    location: { lat: s.lat, lng: s.lng },
                    address: s.address
                })),
                route: routeGeometry || undefined
            });

            if (result.success) {
                toast.success("Trip created successfully!");
                useDriverRidesStore.getState().fetchTrips();
                clear();
                router.push("/driver/dashboard");
            } else {
                toast.error(result.message || "Failed to create trip");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            <TripMap
                mode="plan"
                from={from}
                to={to}
                stops={stops}
                routeGeometry={routeGeometry}
                activeField={activeField}
                onMapClick={handleMapClick}
                setRouteGeometry={setRouteGeometry}
            />

            <div className="absolute top-8 left-8 w-full max-w-sm z-10 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
                <form onSubmit={handleSubmit} className="space-y-3 pb-8">
                    <Card className="p-5 border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group/card transition-all duration-500 hover:border-indigo-500/20">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full transition-all duration-700 group-hover/card:bg-indigo-500/20" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full transition-all duration-700 group-hover/card:bg-emerald-500/10" />

                        <div className="mb-5 relative">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                                    <HiPaperAirplane className="text-indigo-500 rotate-45 w-5 h-5 shadow-indigo-500/20" />
                                    <span>Plan <span className="text-indigo-500 font-black italic">Trip</span></span>
                                </h2>
                                <div className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest">Driver Mode</div>
                            </div>
                        </div>

                        <div className="space-y-2.5 relative">
                            <LocationField
                                mode="plan"
                                type="from"
                                label="From"
                                placeholder="Pickup location..."
                                colorClass="indigo"
                                iconColor="text-indigo-400"
                                context={context}
                            />

                            {stops.map((stop, index) => (
                                <div key={stop.id} className={`relative group/stop animate-slide-down ${activeField === stop.id ? 'z-50' : 'z-0'}`}>
                                    <LocationField
                                        mode="plan"
                                        type={stop.id}
                                        label={`Stop ${index + 1}`}
                                        placeholder="Add waypoint..."
                                        colorClass="purple"
                                        iconColor="text-purple-400"
                                        onRemove={() => removeStop(stop.id)}
                                        context={context}
                                    />
                                </div>
                            ))}

                            <div className="flex justify-center py-1">
                                <button
                                    type="button"
                                    onClick={addStop}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 active:scale-95 group/add"
                                >
                                    <HiPlusCircle className="w-4 h-4 text-slate-500 group-hover/add:text-indigo-500 transition-colors" />
                                    Add Waypoint
                                </button>
                            </div>

                            <LocationField
                                mode="plan"
                                type="to"
                                label="To"
                                placeholder="Destination..."
                                colorClass="emerald"
                                iconColor="text-emerald-400"
                                context={context}
                            />

                            <div className="grid grid-cols-1 gap-3 pt-1">
                                <DepartureSelector
                                    travelYear={travelYear}
                                    travelMonth={travelMonth}
                                    travelDay={travelDay}
                                    travelHour={travelHour}
                                    travelMinute={travelMinute}
                                    setTravelYear={setTravelYear}
                                    setTravelMonth={setTravelMonth}
                                    setTravelDay={setTravelDay}
                                    setTravelHour={setTravelHour}
                                    setTravelMinute={setTravelMinute}
                                />
                                <FareAndSeats
                                    fare={fare}
                                    seats={seats}
                                    setFare={setFare}
                                    setSeats={setSeats}
                                />
                            </div>

                            <div className="pt-1">
                                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">Notes</label>
                                <div className="relative group/notes">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-hover/notes:text-indigo-400"><HiChatAlt2 className="w-4 h-4" /></span>
                                    <input
                                        className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-9 text-[10px] text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 focus:bg-slate-900/80"
                                        placeholder="Extra details about your trip..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                            disabled={!isReady}
                            className={`mt-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] ${isReady ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20" : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5"}`}
                        >
                            {loading ? "Publishing..." : isReady ? "Publish Journey" : "Fill all fields"}
                        </Button>
                    </Card>
                </form>
            </div>
        </div>
    );
}
