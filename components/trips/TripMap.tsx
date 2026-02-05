"use client";

import { useState, useEffect } from "react";
import Map, { NavigationControl, Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { HiLocationMarker } from "react-icons/hi";
import { useTripSearchStore } from "@/store/tripSearchStore";
import { useTripCreationStore } from "@/store/tripCreationStore";
import { parseWKT } from "@/utils/geo";

interface TripMapProps {
    mode?: "plan" | "search";
}

export default function TripMap({ mode = "plan" }: TripMapProps) {
    const searchStore = useTripSearchStore();
    const creationStore = useTripCreationStore();

    const currentStore = mode === "search" ? searchStore : creationStore;

    const {
        from, to, activeField, routeGeometry,
        setFrom, setTo, setActiveField, setRouteGeometry
    } = currentStore;

    const stops = mode === "plan" ? creationStore.stops : [];
    const updateStop = creationStore.updateStop;
    const selectedTrip = mode === "search" ? searchStore.selectedTrip : null;

    const [viewState, setViewState] = useState({
        longitude: 85.324, // Kathmandu
        latitude: 27.7172,
        zoom: 13
    });


    useEffect(() => {
        if (mode !== "plan") return;

        const fetchRoute = async () => {
            if (!from || !to) {
                setRouteGeometry(null);
                return;
            }
            const coords = [
                `${from.lng},${from.lat}`,
                ...stops.filter(s => s.lat && s.lng).map(s => `${s.lng},${s.lat}`),
                `${to.lng},${to.lat}`
            ].join(';');

            try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
                const data = await res.json();

                if (data.code === 'Ok' && data.routes?.length > 0) {
                    setRouteGeometry(data.routes[0].geometry.coordinates);
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            }
        };

        fetchRoute();
    }, [from, to, stops, mode, setRouteGeometry]);

    const handleMapClick = async (e: any) => {
        if (!activeField) return;

        const { lng, lat } = e.lngLat;
        const tempAddress = "Locating...";

        if (activeField === "from") {
            setFrom({ lat, lng, address: tempAddress });
        } else if (activeField === "to") {
            setTo({ lat, lng, address: tempAddress });
        } else if (typeof activeField === "string") {
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
            } else if (fieldToUpdate === "to") {
                setTo({ lat, lng, address });
            } else if (typeof fieldToUpdate === "string") {
                updateStop(fieldToUpdate, { lat, lng, address });
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            const fallbackAddress = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            if (fieldToUpdate === "from") {
                setFrom({ lat, lng, address: fallbackAddress });
            } else if (fieldToUpdate === "to") {
                setTo({ lat, lng, address: fallbackAddress });
            } else if (typeof fieldToUpdate === "string") {
                updateStop(fieldToUpdate, { lat, lng, address: fallbackAddress });
            }
        }
    };

    const displayRoute = mode === "search" && selectedTrip ? selectedTrip.route_geometry : routeGeometry;
    const routeColor = mode === "search" ? "#3b82f6" : "#6366f1";
    const routeGlowColor = mode === "search" ? "#60a5fa" : "#818cf8";

    return (
        <div className={`absolute inset-0 w-full h-full contrast-[1.1] transition-all duration-700 ${activeField ? 'grayscale-0' : 'grayscale-[0.4]'}`}>
            <Map
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onClick={handleMapClick}
                mapStyle="https://tiles.openfreemap.org/styles/dark"
                style={{ width: "100%", height: "100%", cursor: activeField ? 'crosshair' : 'default' }}
            >
                <NavigationControl position="bottom-right" />

                {displayRoute && (
                    <Source
                        id="route"
                        type="geojson"
                        data={{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: displayRoute
                            }
                        }}
                    >
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                'line-color': routeColor,
                                'line-width': 5,
                                'line-opacity': 0.8,
                                'line-blur': 1,
                            }}
                            layout={{
                                'line-join': 'round',
                                'line-cap': 'round'
                            }}
                        />
                        <Layer
                            id="route-glow"
                            type="line"
                            paint={{
                                'line-color': routeGlowColor,
                                'line-width': 10,
                                'line-opacity': 0.2,
                                'line-blur': 5,
                            }}
                            layout={{
                                'line-join': 'round',
                                'line-cap': 'round'
                            }}
                        />
                    </Source>
                )}

                {from && (
                    <Marker longitude={from.lng} latitude={from.lat} anchor="bottom">
                        <div className="relative flex flex-col items-center group/marker cursor-pointer z-20">
                            <div className="absolute -top-10 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[8px] font-black text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
                                {from.address}
                            </div>
                            <div className={`${mode === 'search' ? 'text-blue-500' : 'text-indigo-500'} filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] active:scale-95 transition-transform`}>
                                <HiLocationMarker className="w-12 h-12" />
                            </div>
                            <div className={`absolute top-0 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${mode === 'search' ? 'text-blue-600 border-blue-600' : 'text-indigo-600 border-indigo-600'} border-2`}>A</div>
                        </div>
                    </Marker>
                )}

                {mode === 'plan' && stops.map((stop, index) => (stop.lat && stop.lng) ? (
                    <Marker key={stop.id} longitude={stop.lng} latitude={stop.lat} anchor="bottom">
                        <div className="relative flex flex-col items-center group/marker cursor-pointer z-10 transition-transform hover:scale-110 active:scale-95">
                            <div className="text-purple-500 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                                <HiLocationMarker className="w-10 h-10" />
                            </div>
                            <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] font-black text-purple-600 border-2 border-purple-600 shadow-sm">{index + 1}</div>
                        </div>
                    </Marker>
                ) : null)}

                {to && (
                    <Marker longitude={to.lng} latitude={to.lat} anchor="bottom">
                        <div className="relative flex flex-col items-center group/marker cursor-pointer z-20">
                            <div className="absolute -top-10 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[8px] font-black text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
                                {to.address}
                            </div>
                            <div className="text-emerald-500 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] active:scale-95 transition-transform">
                                <HiLocationMarker className="w-12 h-12" />
                            </div>
                            <div className="absolute top-0 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg text-emerald-600 border-2 border-emerald-600">B</div>
                        </div>
                    </Marker>
                )}
                {/* Selected Trip Stops */}
                {mode === 'search' && selectedTrip?.stops?.map((stop: any, index: number) => (
                    <Marker key={`trip-stop-${index}`} longitude={stop.lng} latitude={stop.lat} anchor="bottom">
                        <div className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] scale-75">
                            <HiLocationMarker className="w-8 h-8" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full flex items-center justify-center text-[6px] font-black text-purple-600 border border-purple-600">{index + 1}</div>
                        </div>
                    </Marker>
                ))}

                {/* Selected Trip Riders */}
                {mode === 'search' && selectedTrip?.riders?.map((rider: any, index: number) => (
                    <Marker key={`trip-rider-${index}`} longitude={rider.lng} latitude={rider.lat} anchor="bottom">
                        <div className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-75">
                            <div className="w-8 h-8 rounded-full bg-cyan-950 border-2 border-cyan-500 flex items-center justify-center text-cyan-200 text-[10px] font-bold">
                                {rider.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full flex items-center justify-center text-[6px] font-black text-black border border-white">P</div>
                        </div>
                    </Marker>
                ))}

                {mode === 'search' && selectedTrip && (
                    <>
                        {(() => {
                            const pickupPoint = parseWKT(selectedTrip.pickup_route_point);
                            return pickupPoint && (
                                <Marker longitude={pickupPoint.lng} latitude={pickupPoint.lat} anchor="center">
                                    <div className="flex flex-col items-center group/marker">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
                                        <div className="mt-1 px-1 bg-slate-900/80 rounded text-[6px] font-bold text-blue-400 border border-blue-500/30">Route Pickup</div>
                                    </div>
                                </Marker>
                            );
                        })()}
                        {(() => {
                            const dropPoint = parseWKT(selectedTrip.drop_route_point);
                            return dropPoint && (
                                <Marker longitude={dropPoint.lng} latitude={dropPoint.lat} anchor="center">
                                    <div className="flex flex-col items-center group/marker">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-lg animate-pulse" />
                                        <div className="mt-1 px-1 bg-slate-900/80 rounded text-[6px] font-bold text-emerald-400 border border-emerald-500/30">Route Dropoff</div>
                                    </div>
                                </Marker>
                            );
                        })()}
                    </>
                )}
            </Map>
        </div>
    );
}
