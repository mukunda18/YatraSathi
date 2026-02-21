import { create } from "zustand";
import { TripViewData } from "@/store/types";
import { RoutePoint, splitRouteByDriverPosition } from "@/utils/liveRoute";

interface DriverPosition {
    lat: number;
    lng: number;
    heading: number | null;
    speedKmph: number | null;
    lastUpdated: string | null;
}

interface LiveRiderPosition {
    requestId: string;
    riderName: string;
    lat: number;
    lng: number;
    status: string;
}

interface LiveTripState {
    trip: TripViewData | null;
    route: RoutePoint[];
    driverPosition: DriverPosition | null;
    liveRiders: LiveRiderPosition[];
    completedRoute: RoutePoint[];
    remainingRoute: RoutePoint[];
    progressPercent: number;
    completedDistanceKm: number;
    remainingDistanceKm: number;
    totalDistanceKm: number;
    hasLiveData: boolean;
    initializeFromTrip: (trip: TripViewData) => void;
    setDriverPosition: (position: DriverPosition | null) => void;
    upsertLiveRiderPosition: (rider: LiveRiderPosition) => void;
    clear: () => void;
}

const getDriverPositionFromTrip = (trip: TripViewData): DriverPosition | null => {
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

const calculateState = (trip: TripViewData, driverPosition: DriverPosition | null) => {
    const route = trip.route_geometry || [];
    const split = splitRouteByDriverPosition(route, driverPosition);

    return {
        route,
        driverPosition,
        completedRoute: split.completedRoute,
        remainingRoute: split.remainingRoute,
        progressPercent: split.progressPercent,
        completedDistanceKm: split.completedDistanceKm,
        remainingDistanceKm: split.remainingDistanceKm,
        totalDistanceKm: split.totalDistanceKm,
        hasLiveData: route.length > 1 && !!driverPosition,
    };
};

const initialState = {
    trip: null,
    route: [],
    driverPosition: null,
    liveRiders: [],
    completedRoute: [],
    remainingRoute: [],
    progressPercent: 0,
    completedDistanceKm: 0,
    remainingDistanceKm: 0,
    totalDistanceKm: 0,
    hasLiveData: false,
};

export const useLiveTripStore = create<LiveTripState>((set, get) => ({
    ...initialState,

    initializeFromTrip: (trip) => {
        const driverPosition = getDriverPositionFromTrip(trip);
        set({
            trip,
            ...calculateState(trip, driverPosition),
        });
    },

    setDriverPosition: (position) => {
        const { trip } = get();
        if (!trip) {
            set({ driverPosition: position, hasLiveData: false });
            return;
        }

        set(calculateState(trip, position));
    },

    upsertLiveRiderPosition: (rider) => {
        set((state) => {
            const next = state.liveRiders.some((r) => r.requestId === rider.requestId)
                ? state.liveRiders.map((r) => (r.requestId === rider.requestId ? rider : r))
                : [...state.liveRiders, rider];
            return { liveRiders: next };
        });
    },

    clear: () => set(initialState),
}));
