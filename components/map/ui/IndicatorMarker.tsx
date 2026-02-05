import { Marker } from "react-map-gl/maplibre";

interface IndicatorMarkerProps {
    longitude: number;
    latitude: number;
    label: string;
    type: "pickup" | "drop";
}

export default function IndicatorMarker({ longitude, latitude, label, type }: IndicatorMarkerProps) {
    const isPickup = type === "pickup";
    const bgColor = isPickup ? "bg-blue-500" : "bg-emerald-500";
    const borderColor = isPickup ? "border-blue-500/30" : "border-emerald-500/30";
    const textColor = isPickup ? "text-blue-400" : "text-emerald-400";

    return (
        <Marker longitude={longitude} latitude={latitude} anchor="center">
            <div className="flex flex-col items-center group/marker">
                <div className={`w-3 h-3 rounded-full ${bgColor} border-2 border-white shadow-lg animate-pulse`} />
                <div className={`mt-1 px-1 bg-slate-900/80 rounded text-[6px] font-bold ${textColor} border ${borderColor}`}>
                    {label}
                </div>
            </div>
        </Marker>
    );
}
