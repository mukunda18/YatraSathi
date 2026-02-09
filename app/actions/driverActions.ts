"use server";

import {
    getDriverTripsWithRequests,
    cancelTripById,
    updateRideRequestStatus,
    removeRiderFromTrip,
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

export async function updateRequestStatusAction(requestId: string, status: "accepted" | "rejected") {
    if (!requestId || (status !== "accepted" && status !== "rejected")) {
        return { success: false, message: "Invalid request" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const result = await updateRideRequestStatus(requestId, status, driver!.id);
    if (!result) {
        return { success: false, message: `Failed to ${status} request.` };
    }

    return { success: true, message: `Request ${status} successfully` };
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
