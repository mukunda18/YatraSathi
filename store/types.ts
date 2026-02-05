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
