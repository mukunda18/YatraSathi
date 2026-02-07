import { create } from "zustand";
import { getJoinedTripsAction } from "@/app/actions/tripActions";

export interface UserTrip {
    request_id: string;
    request_status: string;
    requested_seats: number;
    pickup_address: string;
    drop_address: string;
    total_fare: number;
    trip_id: string;
    from_address: string;
    to_address: string;
    travel_date: string;
    trip_status: string;
    driver_name: string;
    driver_rating: number;
    vehicle_type: string;
    vehicle_number: string;
}

interface UserRidesStore {
    trips: UserTrip[];
    isLoading: boolean;
    lastFetched: number | null;
    fetchTrips: () => Promise<void>;
    clear: () => void;
}

export const useUserRidesStore = create<UserRidesStore>((set) => ({
    trips: [],
    isLoading: false,
    lastFetched: null,

    fetchTrips: async () => {
        set({ isLoading: true });
        try {
            const result = await getJoinedTripsAction();
            if (result.success) {
                set({ trips: result.trips || [], lastFetched: Date.now() });
            }
        } catch (error) {
            console.error("Failed to fetch user trips:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    clear: () => set({ trips: [], lastFetched: null }),
}));
