import { create } from "zustand";
import { getDriverTripsAction } from "@/app/actions/driverActions";

interface RideRequest {
    id: string;
    rider_name: string;
    pickup_address: string;
    drop_address: string;
    seats: number;
    total_fare: number;
    status: string;
}

interface DriverTrip {
    trip_id: string;
    from_address: string;
    to_address: string;
    travel_date: string;
    fare_per_seat: number;
    total_seats: number;
    available_seats: number;
    trip_status: string;
    ride_requests: RideRequest[];
}

interface DriverRidesStore {
    trips: DriverTrip[];
    isLoading: boolean;
    lastFetched: number | null;
    setTrips: (trips: DriverTrip[]) => void;
    setLoading: (loading: boolean) => void;
    fetchTrips: () => Promise<void>;
    clear: () => void;
}

export const useDriverRidesStore = create<DriverRidesStore>((set) => ({
    trips: [],
    isLoading: false,
    lastFetched: null,

    setTrips: (trips) => set({ trips, lastFetched: Date.now() }),
    setLoading: (isLoading) => set({ isLoading }),

    fetchTrips: async () => {
        set({ isLoading: true });
        try {
            const result = await getDriverTripsAction();
            if (result.success) {
                set({ trips: result.trips || [], lastFetched: Date.now() });
            }
        } catch (error) {
            console.error("Failed to fetch driver trips:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    clear: () => set({ trips: [], lastFetched: null }),
}));
