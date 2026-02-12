export interface TripLocation {
    lat: number;
    lng: number;
    address: string;
}

export interface StopLocation extends TripLocation {
    id: string;
}

export interface TripRider {
    request_id: string;
    rider_id: string;
    rider_name: string;
    rider_phone: string;
    pickup_address: string;
    drop_address: string;
    pickup_lat: number;
    pickup_lng: number;
    drop_lat: number;
    drop_lng: number;
    seats: number;
    total_fare: number;
    status: string;
}

export interface TripSearchResult {
    id: string;
    driver_user_id: string;
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

export interface TripViewData {
    trip_id: string;
    from_address: string;
    to_address: string;
    travel_date: string;
    fare_per_seat: number;
    total_seats: number;
    available_seats: number;
    description: string | null;
    trip_status: string;
    from_lat: number;
    from_lng: number;
    to_lat: number;
    to_lng: number;
    driver_user_id: string;
    driver_name: string;
    driver_phone: string;
    driver_rating: string | number;
    driver_id: string;
    vehicle_type: string;
    vehicle_number: string;
    vehicle_info: any;
    route_geometry: [number, number][] | null;
    stops: {
        id: string;
        stop_address: string;
        stop_order: number;
        lat: number;
        lng: number;
    }[];
    my_request?: {
        id: string;
        status: string;
        seats: number;
        total_fare: number;
        pickup_address: string;
        drop_address: string;
    } | null;
    riders?: TripRider[];
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
