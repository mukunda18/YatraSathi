export interface TripLocation {
    lat: number;
    lng: number;
    address: string;
}

export interface StopLocation extends TripLocation {
    id: string;
}

export interface TripRider {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

export interface TripSearchResult {
    id: string;
    driver_name: string;
    driver_rating?: number;
    driver_total_ratings?: number;
    vehicle_type: string;
    vehicle_number: string;
    vehicle_info?: {
        model?: string;
        color?: string;
    };
    fare_per_seat: number;
    available_seats: number;
    travel_date: string;
    from_address: string;
    to_address: string;
    route_geometry?: [number, number][];
    stops?: TripLocation[];
    riders?: TripRider[];
    pickup_route_point?: string;
    drop_route_point?: string;
}

export interface SearchFormContext {
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
}

export interface CreationFormContext {
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
}

