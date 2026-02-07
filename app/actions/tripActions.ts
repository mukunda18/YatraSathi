"use server";

import { createTrip, createRideRequest, getJoinedTripsByRiderId, getTripViewById, getVerifiedDriver, getOwnedTrip, cancelTripById, removeRiderFromTrip } from "@/db/db";
import { getUserId } from "./authActions";
import { validateTrip } from "@/utils/validation";

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
    const userId = await getUserId();
    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const driver = await getVerifiedDriver(userId);
    if (!driver) {
        return { success: false, message: "Driver profile not found or not approved. Please register as a driver first." };
    }

    const validation = validateTrip(data);
    if (!validation.success) {
        return { success: false, message: Object.values(validation.errors || {})[0] };
    }

    const fromPoint = `POINT(${data.from_location.lng} ${data.from_location.lat})`;
    const toPoint = `POINT(${data.to_location.lng} ${data.to_location.lat})`;

    const trip = await createTrip({
        driver_id: driver.id,
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
    const userId = await getUserId();
    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    // Prevent driver from joining their own trip
    const tripResult = await getTripViewById(data.trip_id, userId);
    if (tripResult && tripResult.driver_user_id === userId) {
        return { success: false, message: "You cannot join your own trip." };
    }

    const pickupPoint = `POINT(${data.pickup_location.lng} ${data.pickup_location.lat})`;
    const dropPoint = `POINT(${data.drop_location.lng} ${data.drop_location.lat})`;

    if (data.seats < 1) {
        return { success: false, message: "Must book at least 1 seat" };
    }
    if (data.total_fare < 0) {
        return { success: false, message: "Invalid fare amount" };
    }

    const request = await createRideRequest({
        rider_id: userId,
        trip_id: data.trip_id,
        pickup_location: pickupPoint,
        pickup_address: data.pickup_address,
        drop_location: dropPoint,
        drop_address: data.drop_address,
        seats: data.seats,
        total_fare: data.total_fare
    });

    if (!request) {
        return { success: false, message: "Failed to create ride request. You might already have a request for this trip." };
    }

    return { success: true, requestId: request.id };
}

export async function getJoinedTripsAction() {
    const userId = await getUserId();
    if (!userId) {
        return { success: false, message: "Unauthorized", trips: [] };
    }

    const trips = await getJoinedTripsByRiderId(userId);
    return { success: true, trips };
}

export async function getTripViewAction(tripId: string) {
    const userId = await getUserId();

    const trip = await getTripViewById(tripId, userId || undefined);

    if (!trip) {
        return { success: false, message: "Trip not found", trip: null };
    }

    return { success: true, trip };
}

export async function cancelTripAction(tripId: string, reason?: string) {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Unauthorized" };

    const trip = await getOwnedTrip(tripId, userId);
    if (!trip) {
        return { success: false, message: "You are not authorized to cancel this trip or it does not exist." };
    }

    const success = await cancelTripById(tripId, reason, trip.driver_id);

    if (success) {
        return { success: true, message: "Trip cancelled successfully" };
    }

    return { success: false, message: "Failed to cancel trip" };
}

export async function cancelRideRequestAction(requestId: string, tripId: string) {

    const userId = await getUserId();
    if (!userId) return { success: false, message: "Unauthorized" };

    // Pass userId to verify they are the rider
    const success = await removeRiderFromTrip(requestId, userId);

    if (success) {
        return { success: true, message: "Booking cancelled successfully" };
    }

    return { success: false, message: "Failed to cancel booking. You may not be authorized." };
}
