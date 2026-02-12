import { create } from "zustand";

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number | null;
    error: string | null;
    isTracking: boolean;
    setLocation: (location: Partial<Omit<LocationState, 'setLocation' | 'setError' | 'setTracking'>>) => void;
    setError: (error: string | null) => void;
    setTracking: (isTracking: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    isTracking: false,
    setLocation: (location) => set((state) => ({ ...state, ...location, error: null })),
    setError: (error) => set({ error }),
    setTracking: (isTracking) => set({ isTracking }),
}));
