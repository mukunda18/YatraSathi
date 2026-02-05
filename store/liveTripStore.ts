import { create } from "zustand";

interface LiveTripStore {
    driverLocation: { lat: number; lng: number } | null;
    etaMinutes: number | null;
    status: "idle" | "boarding" | "on-way" | "completed";
    setDriverLocation: (loc: { lat: number; lng: number } | null) => void;
    setEta: (minutes: number | null) => void;
    setStatus: (status: "idle" | "boarding" | "on-way" | "completed") => void;
    clear: () => void;
}

export const useLiveTripStore = create<LiveTripStore>((set) => ({
    driverLocation: null,
    etaMinutes: null,
    status: "idle",
    setDriverLocation: (driverLocation) => set({ driverLocation }),
    setEta: (etaMinutes) => set({ etaMinutes }),
    setStatus: (status) => set({ status }),
    clear: () => set({ driverLocation: null, etaMinutes: null, status: "idle" }),
}));
