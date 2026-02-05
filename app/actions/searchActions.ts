"use server";

import { searchTrips } from "@/db/db";

export async function searchTripsAction(data: {
    from_location: { lat: number; lng: number };
    to_location: { lat: number; lng: number };
}) {
    const fromPoint = `POINT(${data.from_location.lng} ${data.from_location.lat})`;
    const toPoint = `POINT(${data.to_location.lng} ${data.to_location.lat})`;

    try {
        const trips = await searchTrips(fromPoint, toPoint);

        const parsedTrips = trips.map(trip => {
            let coordinates: [number, number][] = [];

            if (trip.route_geojson) {
                try {
                    const geojson = JSON.parse(trip.route_geojson);
                    if (geojson.type === 'LineString') {
                        coordinates = geojson.coordinates;
                    }
                } catch (e) {
                    console.error("Error parsing GeoJSON route", e);
                }
            }

            return {
                ...trip,
                route_geometry: coordinates
            };
        });

        return { success: true, trips: parsedTrips };
    } catch (error) {
        console.error("Search error:", error);
        return { success: false, message: "Failed to search trips" };
    }
}
