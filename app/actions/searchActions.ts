"use server";

import { searchTrips } from "@/db/db";
import { TripSearchResult } from "@/store/types";
import { toTripSearchResult } from "@/utils/tripParsers";
import { getUserId } from "./authActions";

export async function searchTripsAction(data: {
    from_location: { lat: number; lng: number };
    to_location: { lat: number; lng: number };
}) {
    const fromPoint = `POINT(${data.from_location.lng} ${data.from_location.lat})`;
    const toPoint = `POINT(${data.to_location.lng} ${data.to_location.lat})`;

    try {
        const viewerUserId = await getUserId();
        const trips = await searchTrips(fromPoint, toPoint, viewerUserId || undefined);

        const parsedTrips: TripSearchResult[] = trips.map((trip) =>
            toTripSearchResult(trip as Record<string, unknown>, "searchTripsAction")
        );

        return { success: true, trips: parsedTrips };
    } catch (error) {
        console.error("Search error:", error);
        return { success: false, message: "Failed to search trips" };
    }
}
