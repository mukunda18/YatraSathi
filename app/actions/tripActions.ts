"use server";

import {
    canUserAccessLiveTrip,
    createTrip,
    createRideRequest,
    createRideRequestFromTripDefaults,
    getJoinedTripsByRiderId,
    getTripViewById,
    rateDriverByRider,
    rateRiderByDriver,
    removeRiderFromTrip,
    getAllUpcomingTrips
} from "@/db/db";
import { TripViewData } from "@/store/types";
import { splitRouteGeometry } from "@/utils/tripParsers";
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

    if (!data.route || data.route.length < 2) {
        return { success: false, message: "Route is required to create a trip" };
    }
    const routeStart = data.route[0];
    const routeEnd = data.route[data.route.length - 1];
    const fromPoint = `POINT(${routeStart[0]} ${routeStart[1]})`;
    const toPoint = `POINT(${routeEnd[0]} ${routeEnd[1]})`;

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

export async function createRideRequestFromTripAction(data: {
    trip_id: string;
    seats: number;
}) {
    const { userId, error } = await getAuthenticatedUserId();
    if (error) return error;

    if (data.seats < 1) {
        return { success: false, message: "Must book at least 1 seat" };
    }

    const result = await createRideRequestFromTripDefaults({
        rider_id: userId!,
        trip_id: data.trip_id,
        seats: data.seats
    });

    if (!result.success) {
        return { success: false, message: result.message };
    }

    return { success: true, requestId: result.request!.id };
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

    const { route_geometry, rest } = splitRouteGeometry(trip, "getTripViewAction");
    if (!route_geometry || route_geometry.length < 2) {
        return { success: false, message: "Trip route is unavailable", trip: null };
    }

    return {
        success: true,
        trip: {
            ...rest,
            route_geometry
        } as TripViewData
    };
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

export async function validateTripLivePageAction(tripId: string) {
    if (!tripId) return false;

    const { userId, error } = await getAuthenticatedUserId();
    if (error || !userId) {
        return false;
    }

    return await canUserAccessLiveTrip(tripId, userId);
}

export async function rateDriverForCompletedTripAction(requestId: string, rating: number, comment?: string) {
    const { userId, error } = await getAuthenticatedUserId();
    if (error || !userId) return error || { success: false, message: "Unauthorized" };

    const result = await rateDriverByRider(requestId, userId, rating, comment);
    if (!result.success) {
        return { success: false, message: result.message || "Failed to submit rating." };
    }

    return { success: true, message: "Driver rated successfully." };
}

export async function rateRiderForCompletedTripAction(requestId: string, rating: number, comment?: string) {
    const { userId, error } = await getAuthenticatedUserId();
    if (error || !userId) return error || { success: false, message: "Unauthorized" };

    const result = await rateRiderByDriver(requestId, userId, rating, comment);
    if (!result.success) {
        return { success: false, message: result.message || "Failed to submit rating." };
    }

    return { success: true, message: "Rider rated successfully." };
}

export interface ExploreTrip {
    id: string;
    from_address: string;
    to_address: string;
    travel_date: string;
    fare_per_seat: number;
    total_seats: number;
    available_seats: number;
    description: string | null;
    status: string;
    from_lat: number;
    from_lng: number;
    to_lat: number;
    to_lng: number;
    driver_user_id: string;
    driver_name: string;
    driver_rating: number;
    driver_total_ratings: number;
    vehicle_type: string;
    vehicle_number: string;
    vehicle_info: Record<string, unknown> | null;
}

export async function getAllUpcomingTripsAction(): Promise<{ success: boolean; trips: ExploreTrip[]; message?: string }> {
    try {
        const rows = await getAllUpcomingTrips();
        const trips = rows as unknown as ExploreTrip[];
        return { success: true, trips };
    } catch {
        return { success: false, trips: [], message: "Failed to fetch trips" };
    }
}

