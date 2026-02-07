"use server";

import {
    getVerifiedDriver,
    getDriverTripsWithRequests,
    cancelTripById,
    updateRideRequestStatus,
    removeRiderFromTrip
} from "@/db/db";
import { getUserId } from "./authActions";

export async function getDriverTripsAction() {
    const userId = await getUserId();
    if (!userId) {
        return { success: false, message: "Unauthorized", trips: [] };
    }

    const driver = await getVerifiedDriver(userId);
    if (!driver) {
        return { success: false, message: "Not a driver or unauthorized", trips: [] };
    }

    const trips = await getDriverTripsWithRequests(driver.id);
    return { success: true, trips };
}

export async function cancelTripAction(tripId: string, reason?: string) {
    if (!tripId) {
        return { success: false, message: "Trip ID is required" };
    }

    const userId = await getUserId();
    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const driver = await getVerifiedDriver(userId);
    if (!driver) {
        return { success: false, message: "Not a driver" };
    }

    const result = await cancelTripById(tripId, reason, driver.id);
    if (!result) {
        return { success: false, message: "Failed to cancel trip. It may already be cancelled, completed, or you do not own it." };
    }

    return { success: true, message: "Trip cancelled successfully" };
}

export async function updateRequestStatusAction(requestId: string, status: "accepted" | "rejected") {
    if (!requestId || !status) {
        return { success: false, message: "Request ID and status are required" };
    }

    const userId = await getUserId();
    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const driver = await getVerifiedDriver(userId);
    if (!driver) {
        return { success: false, message: "Not a driver" };
    }

    const result = await updateRideRequestStatus(requestId, status, driver.id);
    if (!result) {
        return { success: false, message: `Failed to ${status} request. Not enough seats or unauthorized.` };
    }

    return { success: true, message: `Request ${status} successfully` };
}

export async function removeRiderAction(requestId: string) {
    if (!requestId) {
        return { success: false, message: "Request ID is required" };
    }

    const userId = await getUserId();
    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const driver = await getVerifiedDriver(userId);
    if (!driver) {
        return { success: false, message: "Not a driver" };
    }

    // Pass userId (which checks against driver_user_id or rider_id in DB)
    const result = await removeRiderFromTrip(requestId, userId);
    if (!result) {
        return { success: false, message: "Failed to remove rider. Request may not exist or you are unauthorized." };
    }

    return { success: true, message: "Rider removed successfully" };
}
