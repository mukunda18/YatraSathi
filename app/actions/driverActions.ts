"use server";

import {
    cancelTripById,
    completeTripByDriver,
    getCurrentDriverLiveTripByDriverId,
    getDriverTripsWithRequests,
    markRiderDroppedOffByDriver,
    markRiderOnboardByDriver,
    startTripByDriver,
} from "@/db/db";
import { LiveDriverTripData } from "@/store/types";
import { getAuthenticatedDriver } from "./authHelpers";

export async function getDriverTripsAction() {
    const { driver, error } = await getAuthenticatedDriver();
    if (error) {
        return { success: false, message: error.message, trips: [] };
    }

    const trips = await getDriverTripsWithRequests(driver!.id);
    return { success: true, trips };
}

export async function getDriverLiveTripAction() {
    const { driver, error } = await getAuthenticatedDriver();
    if (error) {
        return { success: false, message: error.message, trip: null };
    }

    const trip = await getCurrentDriverLiveTripByDriverId(driver!.id);
    if (!trip) {
        return { success: false, message: "No ongoing trip found", trip: null };
    }

    const { route_geometry, rest } = parseRouteGeometryForDriver(trip);

    return {
        success: true,
        trip: {
            ...rest,
            route_geometry,
        } as LiveDriverTripData,
    };
}

export async function startTripAction(tripId: string) {
    if (!tripId) {
        return { success: false, message: "Trip ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const result = await startTripByDriver(tripId, driver!.id);
    if (!result.success) {
        return { success: false, message: result.message || "Failed to start trip." };
    }

    return { success: true, message: "Trip started successfully", redirectTo: "/driver/live" };
}

export async function completeTripAction(tripId: string) {
    if (!tripId) {
        return { success: false, message: "Trip ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const result = await completeTripByDriver(tripId, driver!.id);
    if (!result.success) {
        return { success: false, message: result.message || "Failed to complete trip." };
    }

    return { success: true, message: "Trip completed successfully" };
}

export async function markRiderOnboardAction(requestId: string) {
    if (!requestId) {
        return { success: false, message: "Request ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const result = await markRiderOnboardByDriver(requestId, driver!.id);
    if (!result) {
        return { success: false, message: "Failed to mark rider as onboard." };
    }

    return { success: true, message: "Rider is now onboard." };
}

export async function markRiderDroppedOffAction(requestId: string) {
    if (!requestId) {
        return { success: false, message: "Request ID is required" };
    }

    const { driver, error } = await getAuthenticatedDriver();
    if (error) return error;

    const result = await markRiderDroppedOffByDriver(requestId, driver!.id);
    if (!result) {
        return { success: false, message: "Failed to mark rider as dropped off." };
    }

    return { success: true, message: "Rider dropped off successfully." };
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

function parseRouteGeometryForDriver(trip: Record<string, unknown>): {
    route_geometry: [number, number][] | null;
    rest: Record<string, unknown>;
} {
    let route_geometry: [number, number][] | null = null;

    if (typeof trip.route_geojson === "string") {
        try {
            const geojson = JSON.parse(trip.route_geojson);
            if (geojson.type === "LineString" && Array.isArray(geojson.coordinates)) {
                route_geometry = geojson.coordinates;
            }
        } catch (e) {
            console.error("Error parsing GeoJSON in getDriverLiveTripAction", e);
        }
    }

    const rest = { ...trip };
    delete rest.route_geojson;
    return { route_geometry, rest };
}
