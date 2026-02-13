"use server";

import {
    cancelTripById,
    getDriverTripsWithRequests,
    hasDriverLiveTrip,
} from "@/db/db";
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

export async function validateDriverLivePageAction() {
    const { driver, error } = await getAuthenticatedDriver();
    if (error || !driver) {
        return false;
    }

    return await hasDriverLiveTrip(driver.id);
}
