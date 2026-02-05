import { Marker } from "react-map-gl/maplibre";

interface RiderMarkerProps {
    longitude: number;
    latitude: number;
    name: string;
}

export default function RiderMarker({ longitude, latitude, name }: RiderMarkerProps) {
    return (
        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
            <div className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-75">
                <div className="w-8 h-8 rounded-full bg-cyan-950 border-2 border-cyan-500 flex items-center justify-center text-cyan-200 text-[10px] font-bold">
                    {name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full flex items-center justify-center text-[6px] font-black text-black border border-white">P</div>
            </div>
        </Marker>
    );
}
