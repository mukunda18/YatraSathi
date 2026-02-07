"use client";

import { useState, useEffect, useRef } from "react";
import { HiSearch, HiLocationMarker } from "react-icons/hi";
import { toast } from "sonner";
import { useTripSearchStore } from "@/store/tripSearchStore";
import { useTripCreationStore } from "@/store/tripCreationStore";

interface LocationFieldProps {
    mode: "search" | "plan";
    type: "from" | "to" | string;
    label: string;
    placeholder: string;
    colorClass: string;
    iconColor: string;
    onRemove?: () => void;
}

export default function LocationField({
    mode,
    type,
    label,
    placeholder,
    colorClass,
    iconColor,
    onRemove
}: LocationFieldProps) {
    const searchStore = useTripSearchStore();
    const creationStore = useTripCreationStore();

    const currentStore = mode === "search" ? searchStore : creationStore;

    const {
        from, to, currentPosition, activeField,
        setFrom, setTo, setFromAddress, setToAddress,
        setCurrentPosition, setActiveField, fromAddress, toAddress
    } = currentStore;

    const stops = mode === "plan" ? creationStore.stops : [];
    const updateStop = creationStore.updateStop;

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const storeDraft = type === "from" ? fromAddress : type === "to" ? toAddress : stops.find(s => s.id === type)?.address || "";
    const [inputValue, setInputValue] = useState(storeDraft);

    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout>(null);

    const isStop = type !== "from" && type !== "to";
    const stop = isStop ? stops.find(s => s.id === type) : null;
    const storeAddress = type === "from" ? from?.address : type === "to" ? to?.address : stop?.address;
    const isActive = activeField === type;

    useEffect(() => {
        if (storeAddress !== undefined) {
            setInputValue(storeAddress || "");
        }
    }, [storeAddress]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            const isMapClick = target.closest('.maplibregl-map') ||
                target.closest('.maplibregl-canvas') ||
                target.closest('.absolute.inset-0.w-full.h-full');

            if (containerRef.current && !containerRef.current.contains(target)) {
                setShowDropdown(false);
                if (isActive && !isMapClick) {
                    setActiveField(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [isActive, setActiveField]);

    const fetchSuggestions = async (query: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (query.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                const biasLat = currentPosition?.lat || 27.7172;
                const biasLon = currentPosition?.lng || 85.3240;
                const viewbox = `${biasLon - 0.5},${biasLat + 0.5},${biasLon + 0.5},${biasLat - 0.5}`;

                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&viewbox=${viewbox}&bounded=0&countrycodes=np`
                );
                const data = await res.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Geocoding error:", error);
            }
        }, 500);
    };

    const handleSelectSuggestion = (suggestion: any) => {
        const loc = {
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
            address: suggestion.display_name
        };
        if (type === "from") setFrom(loc);
        else if (type === "to") setTo(loc);
        else updateStop(type, loc);
        setInputValue(suggestion.display_name);
        setShowDropdown(false);
        setActiveField(null);
    };

    const handleUseCurrentLocation = () => {
        if (!window.isSecureContext) {
            toast.error("Location requires a secure connection (HTTPS or localhost). Check your URL.");
            return;
        }

        if ("geolocation" in navigator) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setCurrentPosition(loc);

                    const tempLoc = { ...loc, address: "Locating..." };
                    if (type === "from") setFrom(tempLoc);
                    else if (type === "to") setTo(tempLoc);
                    else updateStop(type, tempLoc);
                    setInputValue("Locating...");

                    setShowDropdown(false);
                    setActiveField(null);
                    setIsLocating(false);

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`);
                        const data = await res.json();
                        const address = data.display_name || "Current Location";
                        const tripLoc = { ...loc, address };
                        if (type === "from") setFrom(tripLoc);
                        else if (type === "to") setTo(tripLoc);
                        else updateStop(type, tripLoc);
                        setInputValue(address);
                    } catch (error) {
                        const address = `Location (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`;
                        const tripLoc = { ...loc, address };
                        if (type === "from") setFrom(tripLoc);
                        else if (type === "to") setTo(tripLoc);
                        else updateStop(type, tripLoc);
                        setInputValue(address);
                    }
                },
                (error) => {
                    setIsLocating(false);
                    console.error("Geo error:", error);
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            );
        }
    };

    const handleFocus = () => {
        setShowDropdown(true);
        setActiveField(type as any);
        if (!currentPosition && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                null,
                { timeout: 5000 }
            );
        }
    };

    const handleInputChange = (val: string) => {
        setInputValue(val);
        if (type === "from") setFromAddress(val);
        else if (type === "to") setToAddress(val);
        else updateStop(type, { address: val, lat: 0, lng: 0 });

        fetchSuggestions(val);
        setShowDropdown(true);
    };

    const isVerified = isStop
        ? !!(stop && stop.lat !== 0 && stop.lng !== 0)
        : !!(currentStore[type as "from" | "to"] && (currentStore[type as "from" | "to"] as any).lat !== 0 && (currentStore[type as "from" | "to"] as any).lng !== 0);

    return (
        <div className={`relative group/field ${(showDropdown && suggestions.length > 0) || isActive ? 'z-50' : 'z-0'}`} ref={containerRef}>
            <div className="flex items-center justify-between mb-1.5 px-1">
                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ${iconColor} opacity-80`}>{label}</label>
                {!isVerified && inputValue.length > 0 && (
                    <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Unverified</span>
                )}
                <div className="flex items-center gap-1.5">
                    {onRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-[8px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-all bg-red-400/5 hover:bg-red-400/10 py-1 px-2 rounded-lg"
                        >
                            Remove
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setActiveField(type as any)}
                        className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest transition-all py-1 px-2 rounded-lg ${isActive ? `bg-${colorClass}-500 text-white shadow-lg shadow-${colorClass}-500/20` : `bg-white/5 ${iconColor} opacity-60 hover:opacity-100 hover:bg-white/10`}`}
                    >
                        <HiSearch className="w-2.5 h-2.5" /> {isActive ? 'Picking...' : 'Map'}
                    </button>
                    <button
                        type="button"
                        disabled={isLocating}
                        onClick={handleUseCurrentLocation}
                        className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${iconColor} opacity-60 hover:opacity-100 transition-all bg-white/5 py-1 px-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-wait`}
                    >
                        {isLocating ? (
                            <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <HiLocationMarker className="w-2.5 h-2.5" />
                        )}
                        {isLocating ? 'Locating...' : 'Current'}
                    </button>
                </div>
            </div>

            <div className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-300 ${isActive ? `border-${colorClass}-500/50 bg-${colorClass}-500/10 ring-2 ring-${colorClass}-500/10` : !isVerified && inputValue.length > 2 ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 bg-slate-900/40 hover:border-white/10'}`}>
                <HiSearch className={`w-3.5 h-3.5 transition-colors ${isActive ? `text-${colorClass}-400` : !isVerified && inputValue.length > 2 ? 'text-amber-500' : 'text-slate-600'}`} />
                <input
                    className="bg-transparent border-none text-white w-full focus:ring-0 p-0 text-[11px] font-medium placeholder:text-slate-700 outline-none truncate"
                    placeholder={placeholder}
                    value={inputValue}
                    onFocus={handleFocus}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
                {inputValue && isActive && (
                    <div className={`w-1.5 h-1.5 rounded-full bg-${colorClass}-500 animate-pulse shadow-lg shadow-${colorClass}-500/50`} />
                )}
            </div>

            {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl overflow-hidden z-50 shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-slide-down">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full text-left px-3 py-2 text-[9px] text-slate-400 hover:bg-white/5 hover:text-white transition-all border-b border-white/5 last:border-none leading-relaxed"
                        >
                            {s.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
