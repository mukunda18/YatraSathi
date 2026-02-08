"use client";

import { useState, useEffect } from "react";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import { useRouter } from "next/navigation";
import "maplibre-gl/dist/maplibre-gl.css";
import { parseWKT } from "@/utils/geo";
import { TripLocation, StopLocation, TripSearchResult } from "@/store/types";
import { HiArrowLeft } from "react-icons/hi";

import RouteLayer from "./ui/RouteLayer";
import TripMarker from "./ui/TripMarker";
import RiderMarker from "./ui/RiderMarker";
import IndicatorMarker from "./ui/IndicatorMarker";

interface TripMapProps {
    mode?: "plan" | "search" | "view";
    from?: TripLocation | null;
    to?: TripLocation | null;
    stops?: StopLocation[];
    routeGeometry?: [number, number][] | null;
    selectedTrip?: TripSearchResult | null;
    trip?: any | null;
    activeField?: "from" | "to" | string | null;
    onMapClick?: (lat: number, lng: number) => void;
}

export default function TripMap({
    mode = "plan",
    from,
    to,
    stops = [],
    routeGeometry,
    selectedTrip = null,
    trip = null,
    activeField = null,
    onMapClick
}: TripMapProps) {
    const router = useRouter();
    const [viewState, setViewState] = useState({
        longitude: 85.324,
        latitude: 27.7172,
        zoom: 13
    });

    useEffect(() => {
        let coords: { lat: number, lng: number }[] = [];

        if (mode === 'view' && trip) {
            coords.push({ lat: trip.from_lat, lng: trip.from_lng });
            coords.push({ lat: trip.to_lat, lng: trip.to_lng });
            trip.stops?.forEach((s: any) => coords.push({ lat: s.lat, lng: s.lng }));
            trip.riders?.forEach((r: any) => {
                if (r.pickup_lat && r.pickup_lng) coords.push({ lat: r.pickup_lat, lng: r.pickup_lng });
                if (r.drop_lat && r.drop_lng) coords.push({ lat: r.drop_lat, lng: r.drop_lng });
            });
        } else if (from && to) {
            coords.push({ lat: from.lat, lng: from.lng });
            coords.push({ lat: to.lat, lng: to.lng });
            stops.forEach(s => coords.push({ lat: s.lat, lng: s.lng }));
        }

        if (coords.length > 1) {
            const lats = coords.map(c => c.lat);
            const lngs = coords.map(c => c.lng);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            const newLat = (minLat + maxLat) / 2;
            const newLng = (minLng + maxLng) / 2;

            if (Math.abs(viewState.latitude - newLat) > 0.0001 ||
                Math.abs(viewState.longitude - newLng) > 0.0001) {
                setViewState(prev => ({
                    ...prev,
                    latitude: newLat,
                    longitude: newLng,
                    zoom: 12
                }));
            }
        }
    }, [mode, trip?.id, trip?.from_lat, trip?.from_lng, from?.lat, from?.lng, to?.lat, to?.lng, stops.length]);

    const handleMapClick = (e: any) => {
        if (!activeField || !onMapClick) return;
        const { lng, lat } = e.lngLat;
        onMapClick(lat, lng);
    };

    let displayRoute = routeGeometry;
    let routeColor = "#6366f1";
    let routeGlowColor = "#818cf8";

    if (mode === "search") {
        routeColor = "#3b82f6";
        routeGlowColor = "#60a5fa";
    }

    if (mode === "view" && trip?.route_geojson) {
        try {
            const geojson = JSON.parse(trip.route_geojson);
            displayRoute = geojson.coordinates;
            routeColor = "#10b981";
            routeGlowColor = "#34d399";
        } catch (e) {
            console.error("Failed to parse route geojson", e);
        }
    }

    const pickupPoint = mode === 'search' && selectedTrip ? parseWKT(selectedTrip.pickup_route_point) : null;
    const dropPoint = mode === 'search' && selectedTrip ? parseWKT(selectedTrip.drop_route_point) : null;

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
                    <RouteLayer
                        coordinates={displayRoute}
                        color={routeColor}
                        glowColor={routeGlowColor}
                    />
                )}

                {/* Markers for View View */}
                {mode === 'view' && trip && (
                    <>
                        <TripMarker
                            longitude={trip.from_lng}
                            latitude={trip.from_lat}
                            label="A"
                            type="start"
                            address={trip.from_address}
                        />
                        <TripMarker
                            longitude={trip.to_lng}
                            latitude={trip.to_lat}
                            label="B"
                            type="end"
                            address={trip.to_address}
                        />
                        {trip.stops?.map((stop: any, index: number) => (
                            <TripMarker
                                key={`stop-${stop.id}`}
                                longitude={stop.lng}
                                latitude={stop.lat}
                                label={index + 1}
                                type="stop"
                            />
                        ))}

                        {trip.riders?.map((rider: any, index: number) => (
                            <div key={`rider-${rider.request_id}`}>
                                <RiderMarker
                                    key={`pickup-${rider.request_id}`}
                                    longitude={rider.pickup_lng}
                                    latitude={rider.pickup_lat}
                                    name={`Pickup: ${rider.rider_name}`}
                                />
                                <RiderMarker
                                    key={`drop-${rider.request_id}`}
                                    longitude={rider.drop_lng}
                                    latitude={rider.drop_lat}
                                    name={`Drop: ${rider.rider_name}`}
                                />
                            </div>
                        ))}
                    </>
                )}

                {/* Existing Markers for Plan/Search */}
                {mode !== 'view' && from && (
                    <TripMarker
                        longitude={from.lng}
                        latitude={from.lat}
                        label="A"
                        type="start"
                        address={from.address}
                        mode={mode}
                    />
                )}

                {mode !== 'view' && to && (
                    <TripMarker
                        longitude={to.lng}
                        latitude={to.lat}
                        label="B"
                        type="end"
                        address={to.address}
                        mode={mode}
                    />
                )}

                {mode === 'plan' && stops.map((stop, index) => (stop.lat && stop.lng) ? (
                    <TripMarker
                        key={stop.id}
                        longitude={stop.lng}
                        latitude={stop.lat}
                        label={index + 1}
                        type="stop"
                    />
                ) : null)}

                {mode === 'search' && selectedTrip && (
                    <>
                        {selectedTrip.stops?.map((stop: any, index: number) => (
                            <TripMarker
                                key={`trip-stop-${index}`}
                                longitude={stop.lng}
                                latitude={stop.lat}
                                label={index + 1}
                                type="stop"
                            />
                        ))}

                        {selectedTrip.riders?.map((rider: any, index: number) => (
                            <RiderMarker
                                key={`trip-rider-${index}`}
                                longitude={rider.lng}
                                latitude={rider.lat}
                                name={rider.name}
                            />
                        ))}

                        {pickupPoint && (
                            <IndicatorMarker
                                longitude={pickupPoint.lng}
                                latitude={pickupPoint.lat}
                                label="Route Pickup"
                                type="pickup"
                            />
                        )}
                        {dropPoint && (
                            <IndicatorMarker
                                longitude={dropPoint.lng}
                                latitude={dropPoint.lat}
                                label="Route Dropoff"
                                type="drop"
                            />
                        )}
                    </>
                )}
            </Map>

            {mode === 'view' && (
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
                >
                    <HiArrowLeft className="w-4 h-4" />
                    Back
                </button>
            )}
        </div>
    );
}
