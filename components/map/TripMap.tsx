"use client";

import { useState } from "react";
import Map, { NavigationControl, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { useRouter } from "next/navigation";
import "maplibre-gl/dist/maplibre-gl.css";
import { parseWKT } from "@/utils/geo";
import { TripLocation, StopLocation, TripRider, TripSearchResult } from "@/store/types";
import { HiArrowLeft } from "react-icons/hi";

import RouteLayer from "./ui/RouteLayer";
import TripMarker from "./ui/TripMarker";
import RiderMarker from "./ui/RiderMarker";
import IndicatorMarker from "./ui/IndicatorMarker";
import { useLocationStore } from "@/store/locationStore";

interface LiveRiderMapMarker {
    request_id: string;
    rider_name: string;
    lat: number;
    lng: number;
    status: string;
}

interface TripMapProps {
    mode?: "plan" | "search" | "view" | "live";
    from?: TripLocation | null;
    to?: TripLocation | null;
    stops?: StopLocation[];
    routeGeometry?: [number, number][] | null;
    selectedTrip?: TripSearchResult | null;
    trip?: TripMapViewTrip | null;
    driverLocation?: { lat: number, lng: number } | null;
    completedRoute?: [number, number][] | null;
    remainingRoute?: [number, number][] | null;
    liveRiders?: LiveRiderMapMarker[];
    activeField?: "from" | "to" | string | null;
    onMapClick?: (lat: number, lng: number) => void;
}

interface TripMapStop {
    id: string;
    stop_address?: string;
    lat: number;
    lng: number;
}

interface TripMapRider extends TripRider {
    name?: string;
    lat?: number;
    lng?: number;
}

interface TripMapViewTrip {
    from_lat: number;
    from_lng: number;
    to_lat: number;
    to_lng: number;
    from_address: string;
    to_address: string;
    route_geometry?: [number, number][] | null;
    stops?: TripMapStop[];
    riders?: TripMapRider[];
}

export default function TripMap({
    mode = "plan",
    from,
    to,
    stops = [],
    routeGeometry,
    selectedTrip = null,
    trip = null,
    driverLocation = null,
    completedRoute = null,
    remainingRoute = null,
    liveRiders = [],
    activeField = null,
    onMapClick
}: TripMapProps) {
    const router = useRouter();
    const { latitude, longitude } = useLocationStore();
    const [manualViewState, setManualViewState] = useState({
        longitude: 85.324,
        latitude: 27.7172,
        zoom: 13
    });

    const effectiveViewState = manualViewState;

    const handleMapClick = (e: { lngLat: { lng: number; lat: number } }) => {
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

    if (mode === "view" || mode === "live") {
        displayRoute = routeGeometry ?? trip?.route_geometry ?? null;
        routeColor = "#10b981";
        routeGlowColor = "#34d399";
    }

    const hasSegmentedLiveRoute = mode === "live"
        && !!completedRoute
        && completedRoute.length > 1
        && !!remainingRoute
        && remainingRoute.length > 1;

    const pickupPoint = mode === 'search' && selectedTrip ? parseWKT(selectedTrip.pickup_route_point) : null;
    const dropPoint = mode === 'search' && selectedTrip ? parseWKT(selectedTrip.drop_route_point) : null;

    return (
        <div className={`absolute inset-0 w-full h-full contrast-[1.1] transition-all duration-700 ${activeField ? 'grayscale-0' : 'grayscale-[0.4]'}`}>
            <Map
                {...effectiveViewState}
                onMove={(evt: ViewStateChangeEvent) => setManualViewState(evt.viewState)}
                onClick={handleMapClick}
                mapStyle="https://tiles.openfreemap.org/styles/dark"
                style={{ width: "100%", height: "100%", cursor: activeField ? 'crosshair' : 'default' }}
            >
                <NavigationControl position="bottom-right" />

                {hasSegmentedLiveRoute ? (
                    <>
                        <RouteLayer
                            idPrefix="route-completed"
                            coordinates={completedRoute!}
                            color="#475569"
                            glowColor="#64748b"
                        />
                        <RouteLayer
                            idPrefix="route-remaining"
                            coordinates={remainingRoute!}
                            color="#10b981"
                            glowColor="#34d399"
                        />
                    </>
                ) : (
                    displayRoute && (
                        <RouteLayer
                            idPrefix="route-main"
                            coordinates={displayRoute}
                            color={routeColor}
                            glowColor={routeGlowColor}
                        />
                    )
                )}

                {/* Markers for View View */}
                {(mode === 'view' || mode === "live") && trip && (
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
                        {trip.stops?.map((stop, index: number) => (
                            <TripMarker
                                key={`stop-${stop.id}`}
                                longitude={stop.lng}
                                latitude={stop.lat}
                                label={index + 1}
                                type="stop"
                            />
                        ))}

                        {trip.riders?.map((rider) => (
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

                        {(driverLocation || (latitude && longitude)) && (
                            <IndicatorMarker
                                longitude={driverLocation?.lng || longitude!}
                                latitude={driverLocation?.lat || latitude!}
                                label={driverLocation ? "Driver" : "You"}
                                type="pickup"
                            />
                        )}

                        {mode === "live" && liveRiders.map((rider) => (
                            <IndicatorMarker
                                key={`live-rider-${rider.request_id}`}
                                longitude={rider.lng}
                                latitude={rider.lat}
                                label={rider.rider_name.split(" ")[0]}
                                type={rider.status === "onboard" ? "drop" : "pickup"}
                            />
                        ))}
                    </>
                )}

                {/* Existing Markers for Plan/Search */}
                {mode !== 'view' && mode !== "live" && from && (
                    <TripMarker
                        longitude={from.lng}
                        latitude={from.lat}
                        label="A"
                        type="start"
                        address={from.address}
                        mode={mode}
                    />
                )}

                {mode !== 'view' && mode !== "live" && to && (
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
                        {selectedTrip.stops?.map((stop, index: number) => (
                            <TripMarker
                                key={`trip-stop-${index}`}
                                longitude={stop.lng}
                                latitude={stop.lat}
                                label={index + 1}
                                type="stop"
                            />
                        ))}

                        {selectedTrip.riders?.map((rider, index: number) => (
                            <RiderMarker
                                key={`trip-rider-${index}`}
                                longitude={rider.pickup_lng}
                                latitude={rider.pickup_lat}
                                name={rider.rider_name}
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
                    className="absolute top-3 right-3 md:top-6 md:right-6 z-20 flex items-center gap-2 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
                >
                    <HiArrowLeft className="w-4 h-4" />
                    Back
                </button>
            )}
        </div>
    );
}
