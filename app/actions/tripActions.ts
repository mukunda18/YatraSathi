"use server";

import { createTrip, createRideRequest, getJoinedTripsByRiderId, getLiveTripViewById, getTripViewById, getOwnedTrip, cancelTripById, removeRiderFromTrip } from "@/db/db";
import { TripViewData } from "@/store/types";
import { validateTrip } from "@/utils/validation";
import { getAuthenticatedUserId, getAuthenticatedDriver } from "./authHelpers";

export async function createTripAction(data: {
    from_location: { lat: number; lng: number };
    from_address: string;
    to_location: { lat: number; lng: number };
    to_address: string;
    travel_date: string;
    fare_per_seat: number;
    total_seats: number;
    description?: string;
    stops?: { location: { lat: number; lng: number }; address: string }[];
    route?: [number, number][];
}) {
    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const validation = validateTrip(data);
    if (!validation.success) {
        return { success: false, message: Object.values(validation.errors || {})[0] };
    }

    const fromPoint = `POINT(${data.from_location.lng} ${data.from_location.lat})`;
    const toPoint = `POINT(${data.to_location.lng} ${data.to_location.lat})`;

    const trip = await createTrip({
        driver_id: driver!.id,
        from_location: fromPoint,
        from_address: data.from_address,
        to_location: toPoint,
        to_address: data.to_address,
        travel_date: new Date(data.travel_date),
        fare_per_seat: Number(data.fare_per_seat),
        total_seats: Number(data.total_seats),
        description: data.description,
        stops: data.stops?.map((stop, index) => ({
            location: `POINT(${stop.location.lng} ${stop.location.lat})`,
            address: stop.address,
            order: index + 1
        })),
        route: data.route ? `LINESTRING(${data.route.map(p => `${p[0]} ${p[1]}`).join(',')})` : undefined
    });

    if (!trip) {
        return { success: false, message: "Failed to create trip" };
    }

    return { success: true, tripId: trip.id };
}

export async function createRideRequestAction(data: {
    trip_id: string;
    pickup_location: { lat: number; lng: number };
    pickup_address: string;
    drop_location: { lat: number; lng: number };
    drop_address: string;
    seats: number;
    total_fare: number;
}) {
    const { userId, error } = await getAuthenticatedUserId();
    if (error) return error;


    const pickupPoint = `POINT(${data.pickup_location.lng} ${data.pickup_location.lat})`;
    const dropPoint = `POINT(${data.drop_location.lng} ${data.drop_location.lat})`;

    if (data.seats < 1) {
        return { success: false, message: "Must book at least 1 seat" };
    }
    if (data.total_fare < 0) {
        return { success: false, message: "Invalid fare amount" };
    }

    const result = await createRideRequest({
        rider_id: userId!,
        trip_id: data.trip_id,
        pickup_location: pickupPoint,
        pickup_address: data.pickup_address,
        drop_location: dropPoint,
        drop_address: data.drop_address,
        seats: data.seats,
        total_fare: data.total_fare
    });

    if (!result.success) {
        return { success: false, message: result.message };
    }

    return { success: true, requestId: result.request!.id };
}

export async function getJoinedTripsAction() {
    const { userId, error } = await getAuthenticatedUserId();
    if (error) {
        return { success: false, message: error.message, trips: [] };
    }

    const trips = await getJoinedTripsByRiderId(userId!);
    return { success: true, trips };
}

export async function getTripViewAction(tripId: string) {
    const { userId } = await getAuthenticatedUserId();

    const trip = await getTripViewById(tripId, userId || undefined);

    if (!trip) {
        return { success: false, message: "Trip not found", trip: null };
    }

    const { route_geometry, rest } = parseTripRouteGeometry(trip, "getTripViewAction");

    return {
        success: true,
        trip: {
            ...rest,
            route_geometry
        } as TripViewData
    };
}

export async function getLiveTripViewAction(tripId: string) {
    const { userId } = await getAuthenticatedUserId();

    const trip = await getLiveTripViewById(tripId, userId || undefined);

    if (!trip) {
        return { success: false, message: "Trip not found", trip: null };
    }

    const { route_geometry, rest } = parseTripRouteGeometry(trip, "getLiveTripViewAction");

    return {
        success: true,
        trip: {
            ...rest,
            route_geometry
        } as TripViewData
    };
}

function parseTripRouteGeometry(
    trip: Record<string, unknown>,
    source: string
): { route_geometry: [number, number][] | null; rest: Record<string, unknown> } {
    let route_geometry: [number, number][] | null = null;
    if (typeof trip.route_geojson === "string") {
        try {
            const geojson = JSON.parse(trip.route_geojson);
            if (geojson.type === "LineString" && Array.isArray(geojson.coordinates)) {
                route_geometry = geojson.coordinates;
            }
        } catch (e) {
            console.error(`Error parsing GeoJSON in ${source}`, e);
        }
    }

    const { route_geojson, ...rest } = trip;
    return { route_geometry, rest };
}


export async function cancelBookingAction(requestId: string, reason?: string) {
    const { userId, error } = await getAuthenticatedUserId();
    if (error) return error;

    const success = await removeRiderFromTrip(requestId, userId || undefined, reason);

    if (success) {
        return { success: true, message: "Booking cancelled successfully" };
    }

    return { success: false, message: "Failed to cancel booking. You may not be authorized." };
}
