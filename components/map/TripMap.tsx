"use client";

import { useState, useEffect } from "react";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTripSearchStore } from "@/store/tripSearchStore";
import { useTripCreationStore } from "@/store/tripCreationStore";
import { parseWKT } from "@/utils/geo";

import RouteLayer from "./ui/RouteLayer";
import TripMarker from "./ui/TripMarker";
import RiderMarker from "./ui/RiderMarker";
import IndicatorMarker from "./ui/IndicatorMarker";

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

    // Parse pickup and drop points for search mode
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

                {/* Route Rendering */}
                {displayRoute && (
                    <RouteLayer
                        coordinates={displayRoute}
                        color={routeColor}
                        glowColor={routeGlowColor}
                    />
                )}

                {/* Main Trip Markers (A and B) */}
                {from && (
                    <TripMarker
                        longitude={from.lng}
                        latitude={from.lat}
                        label="A"
                        type="start"
                        address={from.address}
                        mode={mode}
                    />
                )}

                {to && (
                    <TripMarker
                        longitude={to.lng}
                        latitude={to.lat}
                        label="B"
                        type="end"
                        address={to.address}
                        mode={mode}
                    />
                )}

                {/* Intermediate Stops (Plan Mode) */}
                {mode === 'plan' && stops.map((stop, index) => (stop.lat && stop.lng) ? (
                    <TripMarker
                        key={stop.id}
                        longitude={stop.lng}
                        latitude={stop.lat}
                        label={index + 1}
                        type="stop"
                    />
                ) : null)}

                {/* Search Mode Specific Markers */}
                {mode === 'search' && selectedTrip && (
                    <>
                        {/* Trip Stops */}
                        {selectedTrip.stops?.map((stop: any, index: number) => (
                            <TripMarker
                                key={`trip-stop-${index}`}
                                longitude={stop.lng}
                                latitude={stop.lat}
                                label={index + 1}
                                type="stop"
                            />
                        ))}

                        {/* Trip Riders */}
                        {selectedTrip.riders?.map((rider: any, index: number) => (
                            <RiderMarker
                                key={`trip-rider-${index}`}
                                longitude={rider.lng}
                                latitude={rider.lat}
                                name={rider.name}
                            />
                        ))}

                        {/* Pickup/Drop Points */}
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
        </div>
    );
}
