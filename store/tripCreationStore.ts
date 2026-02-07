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

    travelYear: string;
    travelMonth: string;
    travelDay: string;
    travelHour: string;
    travelMinute: string;
    fare: string;
    seats: number;
    description: string;

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

    setTravelYear: (year: string) => void;
    setTravelMonth: (month: string) => void;
    setTravelDay: (day: string) => void;
    setTravelHour: (hour: string) => void;
    setTravelMinute: (minute: string) => void;
    setFare: (fare: string) => void;
    setSeats: (seats: number) => void;
    setDescription: (desc: string) => void;

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

    // Trip details defaults
    travelYear: new Date().getFullYear().toString(),
    travelMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    travelDay: new Date().getDate().toString().padStart(2, '0'),
    travelHour: "12",
    travelMinute: "00",
    fare: "",
    seats: 1,
    description: "",

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

    // Setters for trip details
    setTravelYear: (travelYear) => set({ travelYear }),
    setTravelMonth: (travelMonth) => set({ travelMonth }),
    setTravelDay: (travelDay) => set({ travelDay }),
    setTravelHour: (travelHour) => set({ travelHour }),
    setTravelMinute: (travelMinute) => set({ travelMinute }),
    setFare: (fare) => set({ fare }),
    setSeats: (seats) => set({ seats }),
    setDescription: (description) => set({ description }),

    clear: () => set({
        from: null,
        to: null,
        fromAddress: "",
        toAddress: "",
        stops: [],
        routeGeometry: null,
        activeField: null,
        travelYear: new Date().getFullYear().toString(),
        travelMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
        travelDay: new Date().getDate().toString().padStart(2, '0'),
        travelHour: "12",
        travelMinute: "00",
        fare: "",
        seats: 1,
        description: "",
    }),
}));
