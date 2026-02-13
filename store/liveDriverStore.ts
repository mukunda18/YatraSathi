import { create } from "zustand";
import { LiveDriverRider, LiveDriverTripData } from "@/store/types";
import { RoutePoint, splitRouteByDriverPosition } from "@/utils/liveRoute";

interface DriverPosition {
    lat: number;
    lng: number;
    heading: number | null;
    speedKmph: number | null;
    lastUpdated: string | null;
}

interface LiveRiderPosition {
    request_id: string;
    rider_id: string;
    rider_name: string;
    lat: number;
    lng: number;
    status: string;
}

interface LiveDriverState {
    trip: LiveDriverTripData | null;
    route: RoutePoint[];
    driverPosition: DriverPosition | null;
    riders: LiveDriverRider[];
    liveRiders: LiveRiderPosition[];
    completedRoute: RoutePoint[];
    remainingRoute: RoutePoint[];
    progressPercent: number;
    completedDistanceKm: number;
    remainingDistanceKm: number;
    totalDistanceKm: number;
    initializeFromTrip: (trip: LiveDriverTripData) => void;
    setDriverPosition: (position: DriverPosition | null) => void;
    upsertLiveRiderPosition: (data: { riderId: string; lat: number; lng: number; status: string }) => void;
    clear: () => void;
}

const initialState = {
    trip: null,
    route: [],
    driverPosition: null,
    riders: [],
    liveRiders: [],
    completedRoute: [],
    remainingRoute: [],
    progressPercent: 0,
    completedDistanceKm: 0,
    remainingDistanceKm: 0,
    totalDistanceKm: 0,
};

const getDriverPositionFromTrip = (trip: LiveDriverTripData): DriverPosition | null => {
    if (trip.driver_current_lat == null || trip.driver_current_lng == null) {
        return null;
    }

    return {
        lat: trip.driver_current_lat,
        lng: trip.driver_current_lng,
        heading: trip.driver_heading ?? null,
        speedKmph: trip.driver_speed_kmph ?? null,
        lastUpdated: trip.driver_last_updated ?? null,
    };
};

const getLiveRiderPositions = (riders: LiveDriverRider[]): LiveRiderPosition[] =>
    riders
        .filter((rider) => rider.current_lat != null && rider.current_lng != null)
        .map((rider) => ({
            request_id: rider.request_id,
            rider_id: rider.rider_id,
            rider_name: rider.rider_name,
            lat: rider.current_lat!,
            lng: rider.current_lng!,
            status: rider.status,
        }));

export const useLiveDriverStore = create<LiveDriverState>((set) => ({
    ...initialState,

    initializeFromTrip: (trip) => {
        const route = trip.route_geometry || [];
        const driverPosition = getDriverPositionFromTrip(trip);
        const riders = trip.riders || [];
        const liveRiders = getLiveRiderPositions(riders);
        const split = splitRouteByDriverPosition(route, driverPosition);

        set({
            trip,
            route,
            driverPosition,
            riders,
            liveRiders,
            completedRoute: split.completedRoute,
            remainingRoute: split.remainingRoute,
            progressPercent: split.progressPercent,
            completedDistanceKm: split.completedDistanceKm,
            remainingDistanceKm: split.remainingDistanceKm,
            totalDistanceKm: split.totalDistanceKm,
        });
    },

    setDriverPosition: (position) => {
        set((state) => {
            if (!state.trip) {
                return { driverPosition: position };
            }

            const split = splitRouteByDriverPosition(state.route, position);
            return {
                driverPosition: position,
                completedRoute: split.completedRoute,
                remainingRoute: split.remainingRoute,
                progressPercent: split.progressPercent,
                completedDistanceKm: split.completedDistanceKm,
                remainingDistanceKm: split.remainingDistanceKm,
                totalDistanceKm: split.totalDistanceKm,
            };
        });
    },

    upsertLiveRiderPosition: ({ riderId, lat, lng, status }) => {
        set((state) => {
            const riders = state.riders.map((rider) =>
                rider.rider_id === riderId
                    ? { ...rider, current_lat: lat, current_lng: lng, live_status: status }
                    : rider
            );
            const liveRiders = riders
                .filter((rider) => rider.current_lat != null && rider.current_lng != null)
                .map((rider) => ({
                    request_id: rider.request_id,
                    rider_id: rider.rider_id,
                    rider_name: rider.rider_name,
                    lat: rider.current_lat!,
                    lng: rider.current_lng!,
                    status: rider.status,
                }));
            return { riders, liveRiders };
        });
    },

    clear: () => set(initialState),
}));
