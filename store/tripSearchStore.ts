import { create } from "zustand";
import { TripLocation, TripSearchResult } from "./types";

interface TripSearchStore {
    from: TripLocation | null;
    to: TripLocation | null;
    fromAddress: string;
    toAddress: string;
    searchResults: TripSearchResult[];
    selectedTrip: TripSearchResult | null;
    routeGeometry: [number, number][] | null;
    activeField: "from" | "to" | null;
    currentPosition: { lat: number; lng: number } | null;

    setFrom: (loc: TripLocation | null) => void;
    setTo: (loc: TripLocation | null) => void;
    setFromAddress: (addr: string) => void;
    setToAddress: (addr: string) => void;
    setSearchResults: (results: TripSearchResult[]) => void;
    setSelectedTrip: (trip: TripSearchResult | null) => void;
    setRouteGeometry: (geometry: [number, number][] | null) => void;
    setActiveField: (field: "from" | "to" | null) => void;
    setCurrentPosition: (pos: { lat: number; lng: number } | null) => void;
    clear: () => void;
}

export const useTripSearchStore = create<TripSearchStore>((set) => ({
    from: null,
    to: null,
    fromAddress: "",
    toAddress: "",
    searchResults: [],
    selectedTrip: null,
    routeGeometry: null,
    activeField: null,
    currentPosition: null,

    setFrom: (loc) => set({ from: loc, fromAddress: loc?.address || "" }),
    setTo: (loc) => set({ to: loc, toAddress: loc?.address || "" }),
    setFromAddress: (fromAddress) => set({ fromAddress }),
    setToAddress: (toAddress) => set({ toAddress }),
    setSearchResults: (searchResults) => set({ searchResults }),
    setSelectedTrip: (selectedTrip) => set({ selectedTrip }),
    setRouteGeometry: (routeGeometry) => set({ routeGeometry }),
    setActiveField: (activeField) => set({ activeField }),
    setCurrentPosition: (currentPosition) => set({ currentPosition }),
    clear: () => set({
        from: null,
        to: null,
        fromAddress: "",
        toAddress: "",
        searchResults: [],
        selectedTrip: null,
        activeField: null
    }),
}));
