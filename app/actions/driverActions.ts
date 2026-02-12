"use server";

import {
    getDriverTripsWithRequests,
    cancelTripById,
    updateRideRequestStatus,
    removeRiderFromTrip,
    updateTripStatus,
    getTripViewById,
    hasOngoingTrip,
    TripStatus,
    RideRequestStatus,
} from "@/db/db";
import { getUserId } from "./authActions";
import { getAuthenticatedDriver } from "./authHelpers";

export async function getDriverTripsAction() {
    const { driver, error } = await getAuthenticatedDriver();
    if (error) {
        return { success: false, message: error.message, trips: [] };
    }

    const trips = await getDriverTripsWithRequests(driver!.id);
    return { success: true, trips };
}

export async function cancelTripAction(tripId: string, reason?: string) {
    if (!tripId) {
        return { success: false, message: "Trip ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const result = await cancelTripById(tripId, reason, driver!.id);
    if (!result) {
        return { success: false, message: "Failed to cancel trip. It may already be cancelled, completed, or you do not own it." };
    }

    return { success: true, message: "Trip cancelled successfully" };
}

export async function updateTripStatusAction(tripId: string, status: TripStatus) {
    if (!tripId) {
        return { success: false, message: "Trip ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    if (status === 'ongoing') {
        const ongoingExists = await hasOngoingTrip(driver!.id);
        if (ongoingExists) {
            return { success: false, message: "You already have an ongoing trip. Please complete it before starting a new one." };
        }

        const trip = await getTripViewById(tripId);
        if (!trip) {
            return { success: false, message: "Trip not found" };
        }
        const travelDate = new Date(trip.travel_date);
        const now = new Date();
        if (travelDate > now) {
            return { success: false, message: "You cannot start the trip before the scheduled time." };
        }
    }

    const result = await updateTripStatus(tripId, status as any, driver!.id);
    if (!result) {
        return { success: false, message: `Failed to update trip to ${status}.` };
    }

    return { success: true, message: `Trip ${status} successfully` };
}

export async function updateRequestStatusAction(requestId: string, status: RideRequestStatus) {
    if (!requestId) {
        return { success: false, message: "Request ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const result = await updateRideRequestStatus(requestId, status as any, driver!.id);
    if (!result) {
        return { success: false, message: `Failed to update request to ${status}.` };
    }

    return { success: true, message: `Rider is now ${status === 'onboard' ? 'Onboard' : status === 'dropedoff' ? 'Dropped Off' : status}` };
}

export async function removeRiderAction(requestId: string, reason?: string) {
    if (!requestId) {
        return { success: false, message: "Request ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const userId = await getUserId();
    const result = await removeRiderFromTrip(requestId, userId || undefined, reason);
    if (!result) {
        return { success: false, message: "Failed to cancel ride request. Request may not exist or you are unauthorized." };
    }

    return { success: true, message: "Ride request cancelled successfully" };
}
