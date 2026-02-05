import { create } from "zustand";
import { TripLocation, StopLocation } from "./types";

interface TripCreationStore {
    from: TripLocation | null;
    to: TripLocation | null;
    fromAddress: string;
    toAddress: string;
    stops: StopLocation[];
    routeGeometry: [number, number][] | null;
    activeField: "from" | "to" | string | null;
    currentPosition: { lat: number; lng: number } | null;

    setFrom: (loc: TripLocation | null) => void;
    setTo: (loc: TripLocation | null) => void;
    setFromAddress: (addr: string) => void;
    setToAddress: (addr: string) => void;
    addStop: () => void;
    removeStop: (id: string) => void;
    updateStop: (id: string, loc: Partial<TripLocation>) => void;
    setRouteGeometry: (geometry: [number, number][] | null) => void;
    setActiveField: (field: "from" | "to" | string | null) => void;
    setCurrentPosition: (pos: { lat: number; lng: number } | null) => void;
    clear: () => void;
}

export const useTripCreationStore = create<TripCreationStore>((set) => ({
    from: null,
    to: null,
    fromAddress: "",
    toAddress: "",
    stops: [],
    routeGeometry: null,
    activeField: null,
    currentPosition: null,

    setFrom: (loc) => set({ from: loc, fromAddress: loc?.address || "" }),
    setTo: (loc) => set({ to: loc, toAddress: loc?.address || "" }),
    setFromAddress: (fromAddress) => set({ fromAddress }),
    setToAddress: (toAddress) => set({ toAddress }),
    addStop: () => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            stops: [...state.stops, { id, lat: 0, lng: 0, address: "" }]
        }));
    },
    removeStop: (id) => set((state) => ({
        stops: state.stops.filter((s) => s.id !== id)
    })),
    updateStop: (id, loc) => set((state) => ({
        stops: state.stops.map((s) => s.id === id ? { ...s, ...loc } : s)
    })),
    setRouteGeometry: (routeGeometry) => set({ routeGeometry }),
    setActiveField: (activeField) => set({ activeField }),
    setCurrentPosition: (currentPosition) => set({ currentPosition }),
    clear: () => set({
        from: null,
        to: null,
        fromAddress: "",
        toAddress: "",
        stops: [],
        routeGeometry: null,
        activeField: null
    }),
}));
