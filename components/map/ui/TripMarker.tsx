import { Marker } from "react-map-gl/maplibre";
import { HiLocationMarker } from "react-icons/hi";

interface TripMarkerProps {
    longitude: number;
    latitude: number;
    label?: string | number;
    type: "start" | "end" | "stop";
    address?: string;
    mode?: "plan" | "search";
}

export default function TripMarker({ longitude, latitude, label, type, address, mode = "plan" }: TripMarkerProps) {
    const isStart = type === "start";
    const isEnd = type === "end";
    const isStop = type === "stop";

    const getColorClass = () => {
        if (isStart) return mode === 'search' ? 'text-blue-500' : 'text-indigo-500';
        if (isEnd) return 'text-emerald-500';
        return 'text-purple-500'; // stop
    };

    const getLabelColorClass = () => {
        if (isStart) return mode === 'search' ? 'text-blue-600 border-blue-600' : 'text-indigo-600 border-indigo-600';
        if (isEnd) return 'text-emerald-600 border-emerald-600';
        return 'text-purple-600 border-purple-600';
    };

    return (
        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
            <div className={`relative flex flex-col items-center group/marker cursor-pointer ${isStop ? 'z-10 transition-transform hover:scale-110' : 'z-20'} active:scale-95`}>
                {address && (
                    <div className="absolute -top-10 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[8px] font-black text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
                        {address}
                    </div>
                )}
                <div className={`${getColorClass()} filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-transform`}>
                    <HiLocationMarker className={isStop ? "w-10 h-10" : "w-12 h-12"} />
                </div>
                {label && (
                    <div className={`absolute top-0 right-1 ${isStop ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px]'} bg-white rounded-full flex items-center justify-center font-black shadow-lg ${getLabelColorClass()} border-2`}>
                        {label}
                    </div>
                )}
            </div>
        </Marker>
    );
}
