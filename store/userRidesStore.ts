import { create } from "zustand";
import { getJoinedTripsAction } from "@/app/actions/tripActions";

interface UserRide {
    request_id: string;
    trip_id: string;
    request_status: string;
    pickup_address: string;
    drop_address: string;
    travel_date: string;
    seats: number;
    total_fare: number;
}

interface UserRidesStore {
    trips: UserRide[];
    isLoading: boolean;
    lastFetched: number | null;
    setTrips: (trips: UserRide[]) => void;
    setLoading: (loading: boolean) => void;
    fetchTrips: () => Promise<void>;
    clear: () => void;
}

export const useUserRidesStore = create<UserRidesStore>((set, get) => ({
    trips: [],
    isLoading: false,
    lastFetched: null,

    setTrips: (trips) => set({ trips, lastFetched: Date.now() }),
    setLoading: (isLoading) => set({ isLoading }),

    fetchTrips: async () => {
        set({ isLoading: true });
        try {
            const result = await getJoinedTripsAction();
            if (result.success) {
                set({ trips: result.trips || [], lastFetched: Date.now() });
            }
        } catch (error) {
            console.error("Failed to fetch user rides:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    clear: () => set({ trips: [], lastFetched: null }),
}));
