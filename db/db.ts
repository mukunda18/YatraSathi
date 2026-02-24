import { pool } from "./index";
import type { PoolClient } from "pg";

export type TripStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type RideRequestStatus = 'waiting' | 'onboard' | 'dropedoff' | 'cancelled';
export type TripRatingRole = "rider_to_driver" | "driver_to_rider";

export interface User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    phone: string;
    avg_rating: number;
    total_ratings: number;
    is_driver: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Driver {
    id: string;
    user_id: string;
    vehicle_number: string;
    vehicle_type: string;
    vehicle_info: Record<string, unknown> | null;
    license_number: string;
    avg_rating: number;
    total_ratings: number;
    status: string;
    created_at: Date;
    updated_at: Date;
}


export interface Trip {
    id: string;
    driver_id: string;
    from_location: string;
    from_address: string;
    to_location: string;
    to_address: string;
    route_id: string | null;
    travel_date: Date;
    fare_per_seat: number;
    total_seats: number;
    available_seats: number;
    description: string | null;
    status: TripStatus;
    cancelled_at: Date | null;
    cancelled_reason: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface TripStop {
    id: string;
    trip_id: string;
    stop_location: string;
    stop_address: string;
    stop_order: number;
    created_at: Date;
}

export interface RideRequest {
    id: string;
    rider_id: string;
    trip_id: string;
    pickup_location: string;
    pickup_address: string;
    drop_location: string;
    drop_address: string;
    seats: number;
    total_fare: number;
    status: RideRequestStatus;
    cancelled_at: Date | null;
    cancelled_reason: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface LiveTrip {
    trip_id: string;
    driver_id: string;
    current_location: string;
    heading: number | null;
    speed_kmph: number | null;
    last_updated: Date;
}

export interface LiveUser {
    user_id: string;
    current_location: string;
    status: string;
    last_updated: Date;
}

export interface Route {
    id: string;
    geom: string;
    buffer_100: string;
    bbox: string;
    start_point: string;
    end_point: string;
    length_m: number;
    created_at: Date;
}


const query = (text: string, params?: unknown[]) => {
    if (params) {
        return pool.query(text, params);
    }
    return pool.query(text);
};

export const createUser = async (data: {
    name: string;
    email: string;
    password_hash: string;
    phone: string;
    is_driver?: boolean;
}): Promise<User | undefined> => {
    const sql = `
        INSERT INTO users (name, email, password_hash, phone, is_driver)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    try {
        const res = await query(sql, [
            data.name,
            data.email,
            data.password_hash,
            data.phone,
            data.is_driver ?? false
        ]);
        return res.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        return;
    }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    const sql = `SELECT * FROM users WHERE id = $1;`;
    try {
        const res = await query(sql, [id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error getting user by id:', error);
        return;
    }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
    const sql = `SELECT * FROM users WHERE email = $1;`;
    try {
        const res = await query(sql, [email]);
        return res.rows[0];
    } catch (error) {
        console.error('Error getting user by email:', error);
        return;
    }
};


export const updateUserById = async (id: string, data: {
    name?: string;
    email?: string;
    password_hash?: string;
    phone?: string;
    is_driver?: boolean;
}): Promise<User | undefined> => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
    }
    if (data.email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(data.email);
    }
    if (data.password_hash !== undefined) {
        updates.push(`password_hash = $${paramIndex++}`);
        values.push(data.password_hash);
    }
    if (data.phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(data.phone);
    }
    if (data.is_driver !== undefined) {
        updates.push(`is_driver = $${paramIndex++}`);
        values.push(data.is_driver);
    }

    if (updates.length === 0) return;

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;

    try {
        const res = await query(sql, values);
        return res.rows[0];
    } catch (error) {
        console.error('Error updating user:', error);
        return;
    }
};

export const createDriverAndMarkUser = async (data: {
    user_id: string;
    vehicle_number: string;
    vehicle_type: string;
    license_number: string;
    vehicle_info?: Record<string, unknown> | null;
}): Promise<Driver | undefined> => {
    const sql = `
        WITH inserted_driver AS (
            INSERT INTO drivers (user_id, vehicle_number, vehicle_type, license_number, vehicle_info)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        ),
        updated_user AS (
            UPDATE users
            SET is_driver = true, updated_at = now()
            WHERE id = $1
            RETURNING id
        )
        SELECT inserted_driver.*
        FROM inserted_driver
        JOIN updated_user ON true;
    `;
    try {
        const res = await query(sql, [
            data.user_id,
            data.vehicle_number,
            data.vehicle_type,
            data.license_number,
            data.vehicle_info ?? null
        ]);
        return res.rows[0];
    } catch (error) {
        console.error('Error creating driver and updating user:', error);
        return;
    }
};

export const createTrip = async (data: {
    driver_id: string;
    from_location: string;
    from_address: string;
    to_location: string;
    to_address: string;
    travel_date: Date;
    fare_per_seat: number;
    total_seats: number;
    route?: string | null;
    route_id?: string | null;
    description?: string | null;
    stops?: { location: string; address: string; order: number }[];
}): Promise<Trip | undefined> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let routeId = data.route_id;

        if (data.route) {
            const routeSql = `
                INSERT INTO routes (geom, buffer_100, bbox, start_point, end_point, length_m)
                VALUES (
                    ST_GeogFromText($1),
                    ST_Buffer(ST_GeogFromText($1), 100),
                    ST_Envelope(ST_GeogFromText($1)::geometry)::geography,
                    ST_StartPoint(ST_GeogFromText($1)::geometry)::geography,
                    ST_EndPoint(ST_GeogFromText($1)::geometry)::geography,
                    ST_Length(ST_GeogFromText($1))
                )
                RETURNING id;
            `;
            const routeRes = await client.query(routeSql, [data.route]);
            routeId = routeRes.rows[0].id;
        }

        if (!routeId) {
            await client.query('ROLLBACK');
            console.error('Trip route is required to create a trip');
            return;
        }

        const tripSql = `
            INSERT INTO trips (
                driver_id, from_location, from_address, to_location, to_address,
                travel_date, fare_per_seat, total_seats, available_seats, route_id, description
            )
            VALUES ($1, ST_GeogFromText($2), $3, ST_GeogFromText($4), $5, $6, $7, $8, $8, $9, $10)
            RETURNING 
                id, driver_id, 
                ST_AsText(from_location) as from_location, from_address,
                ST_AsText(to_location) as to_location, to_address,
                route_id,
                travel_date, fare_per_seat, total_seats, available_seats,
                description, status, cancelled_at, cancelled_reason,
                created_at, updated_at;
        `;

        const tripRes = await client.query(tripSql, [
            data.driver_id,
            data.from_location,
            data.from_address,
            data.to_location,
            data.to_address,
            data.travel_date,
            data.fare_per_seat,
            data.total_seats,
            routeId ?? null,
            data.description ?? null
        ]);

        const trip = tripRes.rows[0];

        if (data.stops && data.stops.length > 0) {
            const stopLocations = data.stops.map((stop) => stop.location);
            const stopAddresses = data.stops.map((stop) => stop.address);
            const stopOrders = data.stops.map((stop) => stop.order);
            const stopSql = `
                INSERT INTO trip_stops (trip_id, stop_location, stop_address, stop_order)
                SELECT
                    $1,
                    ST_GeogFromText(stops.stop_location),
                    stops.stop_address,
                    stops.stop_order
                FROM unnest($2::text[], $3::text[], $4::int[]) AS stops(stop_location, stop_address, stop_order);
            `;
            await client.query(stopSql, [trip.id, stopLocations, stopAddresses, stopOrders]);
        }

        await client.query('COMMIT');
        return trip;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating trip with stops:', error);
        return;
    } finally {
        client.release();
    }
};

export const searchTrips = async (from_location: string, to_location: string, viewer_user_id?: string): Promise<Record<string, unknown>[]> => {
    const sql = `
        SELECT 
            t.id, t.from_address, t.to_address, t.travel_date, t.fare_per_seat, 
            t.total_seats, t.available_seats, t.description, t.status,
            u.name as driver_name, d.avg_rating as driver_rating, d.total_ratings as driver_total_ratings,
            COALESCE($3::uuid = u.id, false) as is_own_trip,
            d.vehicle_type, d.vehicle_number, d.vehicle_info,
            ST_AsText(t.from_location) as from_loc,
            ST_AsText(t.to_location) as to_loc,
            ST_AsText(ST_ClosestPoint(r.geom::geometry, ST_GeomFromText($1, 4326))) as pickup_route_point,
            ST_AsText(ST_ClosestPoint(r.geom::geometry, ST_GeomFromText($2, 4326))) as drop_route_point,
            ST_AsGeoJSON(r.geom) as route_geojson,
            COALESCE(
                (SELECT json_agg(json_build_object(
                    'id', ts.id,
                    'address', ts.stop_address, 
                    'lat', ST_Y(ts.stop_location::geometry),
                    'lng', ST_X(ts.stop_location::geometry),
                    'order', ts.stop_order
                ) ORDER BY ts.stop_order)
                 FROM trip_stops ts WHERE ts.trip_id = t.id
                ), '[]'::json
            ) as stops,
            '[]'::json as riders
        FROM trips t
        JOIN drivers d ON t.driver_id = d.id
        JOIN users u ON d.user_id = u.id
        JOIN routes r ON t.route_id = r.id
        WHERE ST_Intersects(r.buffer_100, ST_GeogFromText($1))
          AND ST_Intersects(r.buffer_100, ST_GeogFromText($2))
          AND ST_LineLocatePoint(r.geom::geometry, ST_GeomFromText($1, 4326)) < ST_LineLocatePoint(r.geom::geometry, ST_GeomFromText($2, 4326))
          AND t.status = 'scheduled'
          AND t.available_seats > 0
          AND t.travel_date > now()
        ORDER BY t.travel_date ASC;
    `;
    try {
        const res = await query(sql, [from_location, to_location, viewer_user_id ?? null]);
        return res.rows;
    } catch (error) {
        console.error('Error searching trips:', error);
        return [];
    }
};

type RideRequestFailureCode =
    | "trip_not_found"
    | "trip_not_scheduled"
    | "trip_departed"
    | "own_trip"
    | "not_enough_seats"
    | "route_mismatch"
    | "duplicate_request";

const toRideRequestErrorMessage = (code?: RideRequestFailureCode | null): string => {
    switch (code) {
        case "trip_not_found":
            return "Trip not found";
        case "trip_not_scheduled":
            return "Only scheduled trips can be joined";
        case "trip_departed":
            return "This trip has already reached its departure time.";
        case "own_trip":
            return "You cannot join your own trip.";
        case "not_enough_seats":
            return "Not enough seats available";
        case "route_mismatch":
            return "Pickup and dropoff locations must be on the trip route";
        case "duplicate_request":
            return "You already have a request for this trip.";
        default:
            return "Failed to create ride request.";
    }
};

const createRideRequestAtomic = async (data: {
    rider_id: string;
    trip_id: string;
    seats: number;
    pickup_location?: string | null;
    pickup_address?: string | null;
    drop_location?: string | null;
    drop_address?: string | null;
}): Promise<{ success: boolean; message?: string; request?: RideRequest }> => {
    const sql = `
        WITH trip_data AS (
            SELECT
                t.id AS trip_id,
                t.route_id,
                t.status AS trip_status,
                t.travel_date AS trip_travel_date,
                t.available_seats,
                t.fare_per_seat,
                t.from_location,
                t.from_address,
                t.to_location,
                t.to_address,
                d.user_id AS driver_user_id
            FROM trips t
            JOIN drivers d ON t.driver_id = d.id
            WHERE t.id = $2
            FOR UPDATE OF t
        ),
        ride_input AS (
            SELECT
                td.trip_id,
                td.route_id,
                td.trip_status,
                td.trip_travel_date,
                td.available_seats,
                td.driver_user_id,
                COALESCE(ST_GeogFromText($4), td.from_location) AS requested_pickup_location,
                COALESCE(NULLIF($5, ''), td.from_address) AS pickup_address,
                COALESCE(ST_GeogFromText($6), td.to_location) AS requested_drop_location,
                COALESCE(NULLIF($7, ''), td.to_address) AS drop_address,
                td.fare_per_seat * $3::numeric AS total_fare
            FROM trip_data td
        ),
        snapped_input AS (
            SELECT
                ri.trip_id,
                ri.route_id,
                ri.trip_status,
                ri.trip_travel_date,
                ri.available_seats,
                ri.driver_user_id,
                ri.requested_pickup_location,
                ri.pickup_address,
                ri.requested_drop_location,
                ri.drop_address,
                COALESCE(
                    ST_ClosestPoint(r.geom::geometry, ri.requested_pickup_location::geometry)::geography,
                    ri.requested_pickup_location
                ) AS pickup_location,
                COALESCE(
                    ST_ClosestPoint(r.geom::geometry, ri.requested_drop_location::geometry)::geography,
                    ri.requested_drop_location
                ) AS drop_location,
                ri.total_fare
            FROM ride_input ri
            LEFT JOIN routes r ON r.id = ri.route_id
        ),
        decision AS (
            SELECT
                CASE
                    WHEN NOT EXISTS (SELECT 1 FROM trip_data) THEN 'trip_not_found'
                    WHEN EXISTS (SELECT 1 FROM snapped_input si WHERE si.trip_status <> 'scheduled') THEN 'trip_not_scheduled'
                    WHEN EXISTS (SELECT 1 FROM snapped_input si WHERE si.trip_travel_date <= now()) THEN 'trip_departed'
                    WHEN EXISTS (SELECT 1 FROM snapped_input si WHERE si.driver_user_id = $1) THEN 'own_trip'
                    WHEN EXISTS (SELECT 1 FROM snapped_input si WHERE si.available_seats < $3) THEN 'not_enough_seats'
                    WHEN EXISTS (
                        SELECT 1
                        FROM snapped_input si
                        WHERE NOT EXISTS (
                            SELECT 1
                            FROM routes r
                            WHERE r.id = si.route_id
                              AND ST_Intersects(r.buffer_100, si.requested_pickup_location)
                              AND ST_Intersects(r.buffer_100, si.requested_drop_location)
                              AND ST_LineLocatePoint(r.geom::geometry, si.requested_pickup_location::geometry) <
                                  ST_LineLocatePoint(r.geom::geometry, si.requested_drop_location::geometry)
                        )
                    ) THEN 'route_mismatch'
                    ELSE NULL
                END AS failure
        ),
        inserted AS (
            INSERT INTO ride_requests (
                rider_id, trip_id, pickup_location, pickup_address,
                drop_location, drop_address, seats, total_fare, status
            )
            SELECT
                $1,
                si.trip_id,
                si.pickup_location,
                si.pickup_address,
                si.drop_location,
                si.drop_address,
                $3,
                si.total_fare,
                'waiting'
            FROM snapped_input si
            CROSS JOIN decision d
            WHERE d.failure IS NULL
            ON CONFLICT (rider_id, trip_id) DO NOTHING
            RETURNING
                id, rider_id, trip_id,
                ST_AsText(pickup_location) AS pickup_location, pickup_address,
                ST_AsText(drop_location) AS drop_location, drop_address,
                seats, total_fare, status, created_at, updated_at
        ),
        updated_trip AS (
            UPDATE trips t
            SET available_seats = t.available_seats - $3,
                updated_at = now()
            FROM inserted i
            WHERE t.id = i.trip_id
            RETURNING t.id
        ),
        update_guard AS (
            SELECT COUNT(*) AS updated_rows
            FROM updated_trip
        )
        SELECT
            COALESCE(
                (SELECT d.failure FROM decision d),
                CASE WHEN EXISTS (SELECT 1 FROM inserted) THEN NULL ELSE 'duplicate_request' END
            ) AS failure,
            i.*
        FROM (SELECT 1) AS anchor
        CROSS JOIN update_guard
        LEFT JOIN inserted i ON true;
    `;

    try {
        const res = await query(sql, [
            data.rider_id,
            data.trip_id,
            data.seats,
            data.pickup_location ?? null,
            data.pickup_address ?? null,
            data.drop_location ?? null,
            data.drop_address ?? null
        ]);
        const row = res.rows[0] as (RideRequest & { failure?: RideRequestFailureCode | null }) | undefined;
        if (!row || row.failure || !row.id) {
            return { success: false, message: toRideRequestErrorMessage(row?.failure) };
        }
        return { success: true, request: row };
    } catch (error) {
        console.error("Error creating ride request:", error);
        return { success: false, message: "Failed to create ride request." };
    }
};

export const createRideRequest = async (data: {
    rider_id: string;
    trip_id: string;
    pickup_location: string;
    pickup_address: string;
    drop_location: string;
    drop_address: string;
    seats: number;
}): Promise<{ success: boolean; message?: string; request?: RideRequest }> => {
    return createRideRequestAtomic(data);
};

export const createRideRequestFromTripDefaults = async (data: {
    rider_id: string;
    trip_id: string;
    seats: number;
}): Promise<{ success: boolean; message?: string; request?: RideRequest }> => {
    return createRideRequestAtomic({
        rider_id: data.rider_id,
        trip_id: data.trip_id,
        seats: data.seats
    });
};

export const getJoinedTripsByRiderId = async (rider_id: string): Promise<Record<string, unknown>[]> => {
    const sql = `
        SELECT 
            rr.id as request_id, 
            rr.status as request_status, 
            rr.seats as requested_seats,
            rr.pickup_address, rr.drop_address, rr.total_fare,
            t.id as trip_id, t.from_address, t.to_address, t.travel_date, t.status as trip_status,
            u.name as driver_name, u.avg_rating as driver_rating,
            d.vehicle_type, d.vehicle_number
        FROM ride_requests rr
        JOIN trips t ON rr.trip_id = t.id
        JOIN drivers d ON t.driver_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE rr.rider_id = $1
        ORDER BY t.travel_date DESC;
    `;
    try {
        const res = await query(sql, [rider_id]);
        return res.rows;
    } catch (error) {
        console.error('Error getting joined trips by rider_id:', error);
        return [];
    }
};

export const isDriverViewerForTrip = async (trip_id: string, viewer_user_id: string): Promise<boolean> => {
    const sql = `
        SELECT 1
        FROM trips t
        JOIN drivers d ON t.driver_id = d.id
        WHERE t.id = $1
          AND d.user_id = $2
        LIMIT 1;
    `;
    try {
        const res = await query(sql, [trip_id, viewer_user_id]);
        return (res.rowCount ?? 0) > 0;
    } catch (error) {
        console.error("Error checking trip driver viewer:", error);
        return false;
    }
};

const getTripViewByIdInternal = async (
    trip_id: string,
    viewer_user_id: string | undefined,
    includeRiders: boolean
): Promise<Record<string, unknown> | null> => {
    const ridersSelect = includeRiders
        ? `(
                SELECT COALESCE(json_agg(rd), '[]')
                FROM (
                    SELECT rr.id as request_id, ru.name as rider_name,
                           rr.pickup_address, rr.drop_address, rr.seats, rr.total_fare, rr.status,
                           ST_Y(rr.pickup_location::geometry) as pickup_lat, ST_X(rr.pickup_location::geometry) as pickup_lng,
                           ST_Y(rr.drop_location::geometry) as drop_lat, ST_X(rr.drop_location::geometry) as drop_lng,
                           EXISTS (
                               SELECT 1
                               FROM trip_ratings tr
                               WHERE tr.request_id = rr.id
                                 AND tr.role = 'driver_to_rider'
                           ) as rated_by_driver
                    FROM ride_requests rr
                    JOIN users ru ON rr.rider_id = ru.id
                    WHERE rr.trip_id = t.id AND rr.status IN ('waiting', 'onboard', 'dropedoff')
                ) rd
            ) as riders,`
        : `'[]'::json as riders,`;

    const sql = `
        SELECT 
            t.id as trip_id, t.from_address, t.to_address, t.travel_date, 
            t.fare_per_seat, t.total_seats, t.available_seats, t.description, t.status as trip_status,
            ST_Y(t.from_location::geometry) as from_lat, ST_X(t.from_location::geometry) as from_lng,
            ST_Y(t.to_location::geometry) as to_lat, ST_X(t.to_location::geometry) as to_lng,
            u.name as driver_name, d.avg_rating as driver_rating,
            COALESCE($2::uuid = u.id, false) as is_driver_viewer,
            d.vehicle_type, d.vehicle_number, d.vehicle_info,
            ST_AsGeoJSON(r.geom) as route_geojson,
            (
                SELECT COALESCE(json_agg(ts), '[]')
                FROM (
                    SELECT id, stop_address, stop_order,
                           ST_Y(stop_location::geometry) as lat, ST_X(stop_location::geometry) as lng
                    FROM trip_stops 
                    WHERE trip_id = t.id 
                    ORDER BY stop_order
                ) ts
            ) as stops,
            ${ridersSelect}
            (
                SELECT json_build_object(
                    'id', my_rr.id,
                    'status', my_rr.status,
                    'seats', my_rr.seats,
                    'total_fare', my_rr.total_fare,
                    'pickup_address', my_rr.pickup_address,
                    'drop_address', my_rr.drop_address,
                    'rated_driver', EXISTS (
                        SELECT 1
                        FROM trip_ratings tr
                        WHERE tr.request_id = my_rr.id
                          AND tr.role = 'rider_to_driver'
                    )
                )
                FROM ride_requests my_rr 
                WHERE my_rr.trip_id = t.id AND my_rr.rider_id = $2 AND my_rr.status NOT IN ('cancelled')
                LIMIT 1
            ) as my_request
        FROM trips t
        JOIN drivers d ON t.driver_id = d.id
        JOIN users u ON d.user_id = u.id
        LEFT JOIN routes r ON t.route_id = r.id
        WHERE t.id = $1;
    `;
    try {
        const res = await query(sql, [trip_id, viewer_user_id || null]);
        if (res.rows.length === 0) return null;

        const trip = res.rows[0] as Record<string, unknown> & {
            my_request?: { id?: string } | null;
        };

        if (trip.my_request && !trip.my_request.id) {
            trip.my_request = null;
        }

        return trip;
    } catch (error) {
        console.error('Error getting trip view:', error);
        return null;
    }
};

export const getTripViewForDriverById = async (trip_id: string, viewer_user_id?: string): Promise<Record<string, unknown> | null> =>
    getTripViewByIdInternal(trip_id, viewer_user_id, true);

export const getTripViewForRiderById = async (trip_id: string, viewer_user_id?: string): Promise<Record<string, unknown> | null> =>
    getTripViewByIdInternal(trip_id, viewer_user_id, false);

export const getDriverByUserId = async (user_id: string): Promise<Driver | undefined> => {
    const sql = `SELECT * FROM drivers WHERE user_id = $1;`;
    try {
        const res = await query(sql, [user_id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error getting driver by user_id:', error);
        return;
    }
};

export const hasDriverLiveTrip = async (driver_id: string): Promise<boolean> => {
    const sql = `
        SELECT 1
        FROM trips t
        JOIN live_trips lt ON lt.trip_id = t.id
        WHERE t.driver_id = $1
          AND t.status = 'ongoing'
        LIMIT 1;
    `;
    try {
        const res = await query(sql, [driver_id]);
        return (res.rowCount ?? 0) > 0;
    } catch (error) {
        console.error("Error checking driver live trip:", error);
        return false;
    }
};

export const canUserAccessLiveTrip = async (trip_id: string, user_id: string): Promise<boolean> => {
    const sql = `
        SELECT 1
        FROM trips t
        JOIN drivers d ON d.id = t.driver_id
        JOIN live_trips lt ON lt.trip_id = t.id
        WHERE t.id = $1
          AND t.status = 'ongoing'
          AND (
              d.user_id = $2
              OR EXISTS (
                  SELECT 1
                  FROM ride_requests rr
                  WHERE rr.trip_id = t.id
                    AND rr.rider_id = $2
                    AND rr.status IN ('waiting', 'onboard', 'dropedoff')
              )
          )
        LIMIT 1;
    `;
    try {
        const res = await query(sql, [trip_id, user_id]);
        return (res.rowCount ?? 0) > 0;
    } catch (error) {
        console.error("Error checking live trip access:", error);
        return false;
    }
};

export const getDriverTripsWithRequests = async (driver_id: string): Promise<Record<string, unknown>[]> => {
    const sql = `
SELECT
t.id as trip_id, t.from_address, t.to_address, t.travel_date,
    t.fare_per_seat, t.total_seats, t.available_seats, t.status as trip_status,
    t.description, t.created_at,
    COALESCE(
        json_agg(
            json_build_object(
                'request_id', rr.id,
                'rider_name', u.name,
                'pickup_address', rr.pickup_address,
                'drop_address', rr.drop_address,
                'seats', rr.seats,
                'total_fare', rr.total_fare,
                'status', rr.status
            )
        ) FILTER(WHERE rr.id IS NOT NULL AND rr.status IN ('waiting', 'onboard', 'dropedoff')), '[]'
    ) as ride_requests
        FROM trips t
        LEFT JOIN ride_requests rr ON t.id = rr.trip_id
        LEFT JOIN users u ON rr.rider_id = u.id
        WHERE t.driver_id = $1
        GROUP BY t.id
        ORDER BY t.travel_date DESC;
`;
    try {
        const res = await query(sql, [driver_id]);
        return res.rows;
    } catch (error) {
        console.error('Error getting driver trips with requests:', error);
        return [];
    }
};

export const cancelTripById = async (trip_id: string, reason?: string, driver_id?: string): Promise<boolean> => {
    const cancellationReason = reason?.trim() || "Trip cancelled";
    try {
        const sql = `
            WITH cancelled_trip AS (
                UPDATE trips
                SET status = 'cancelled',
                    cancelled_at = now(),
                    cancelled_reason = $2,
                    available_seats = total_seats,
                    updated_at = now()
                WHERE id = $1
                  AND status = 'scheduled'
                  AND ($3::uuid IS NULL OR driver_id = $3::uuid)
                RETURNING id
            ),
            cancelled_requests AS (
                UPDATE ride_requests rr
                SET status = 'cancelled',
                    cancelled_at = now(),
                    cancelled_reason = $2,
                    updated_at = now()
                WHERE rr.trip_id IN (SELECT id FROM cancelled_trip)
                  AND rr.status IN ('waiting', 'onboard')
                RETURNING rr.id
            )
            SELECT EXISTS (SELECT 1 FROM cancelled_trip) AS success;
        `;
        const res = await query(sql, [trip_id, cancellationReason, driver_id ?? null]);
        return Boolean(res.rows[0]?.success);
    } catch (error) {
        console.error('Error cancelling trip:', error);
        return false;
    }
};

export const removeRiderFromTrip = async (request_id: string, requesting_user_id?: string, reason?: string): Promise<boolean> => {
    if (!requesting_user_id) {
        console.error("Unauthorized cancellation attempt");
        return false;
    }

    const cancellationReason = reason?.trim() || "Cancelled by user";
    if (reason) {
        console.info("Ride request cancelled:", { request_id, reason: cancellationReason });
    }

    try {
        const sql = `
            WITH cancelled_request AS (
                UPDATE ride_requests rr
                SET status = 'cancelled',
                    cancelled_at = now(),
                    cancelled_reason = $3,
                    updated_at = now()
                FROM trips t
                JOIN drivers d ON t.driver_id = d.id
                WHERE rr.id = $1
                  AND rr.trip_id = t.id
                  AND rr.status = 'waiting'
                  AND t.status = 'scheduled'
                  AND ($2::uuid = rr.rider_id OR $2::uuid = d.user_id)
                RETURNING rr.trip_id, rr.seats
            ),
            updated_trip AS (
                UPDATE trips t
                SET available_seats = t.available_seats + cr.seats,
                    updated_at = now()
                FROM cancelled_request cr
                WHERE t.id = cr.trip_id
                RETURNING t.id
            )
            SELECT EXISTS (SELECT 1 FROM updated_trip) AS success;
        `;
        const res = await query(sql, [request_id, requesting_user_id, cancellationReason]);
        return Boolean(res.rows[0]?.success);
    } catch (error) {
        console.error('Error cancelling ride request:', error);
        return false;
    }
};

const updateUserAggregateRating = async (client: PoolClient, userId: string, rating: number): Promise<void> => {
    await client.query(
        `
        UPDATE users
        SET
            avg_rating = CASE
                WHEN total_ratings <= 0 THEN $2::numeric(3,2)
                ELSE ROUND(((avg_rating * total_ratings) + $2::numeric) / (total_ratings + 1), 2)
            END,
            total_ratings = total_ratings + 1,
            updated_at = now()
        WHERE id = $1
        `,
        [userId, rating]
    );
};

const updateDriverAggregateRating = async (client: PoolClient, driverUserId: string, rating: number): Promise<void> => {
    await client.query(
        `
        UPDATE drivers
        SET
            avg_rating = CASE
                WHEN total_ratings <= 0 THEN $2::numeric(3,2)
                ELSE ROUND(((avg_rating * total_ratings) + $2::numeric) / (total_ratings + 1), 2)
            END,
            total_ratings = total_ratings + 1,
            updated_at = now()
        WHERE user_id = $1
        `,
        [driverUserId, rating]
    );
};

const submitTripRating = async (requestId: string, actorUserId: string, rating: number, role: TripRatingRole, comment?: string): Promise<{ success: boolean; message?: string }> => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { success: false, message: "Rating must be between 1 and 5." };
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const requestSql = `
            SELECT
                rr.id as request_id,
                rr.trip_id,
                rr.rider_id,
                rr.status as request_status,
                t.status as trip_status,
                d.user_id as driver_user_id
            FROM ride_requests rr
            JOIN trips t ON rr.trip_id = t.id
            JOIN drivers d ON t.driver_id = d.id
            WHERE rr.id = $1
            FOR UPDATE OF rr
        `;
        const requestRes = await client.query(requestSql, [requestId]);
        if ((requestRes.rowCount ?? 0) === 0) {
            await client.query("ROLLBACK");
            return { success: false, message: "Ride request not found." };
        }

        const row = requestRes.rows[0] as {
            request_id: string;
            trip_id: string;
            rider_id: string;
            request_status: RideRequestStatus;
            trip_status: TripStatus;
            driver_user_id: string;
        };

        if (row.trip_status !== "completed" || row.request_status !== "dropedoff") {
            await client.query("ROLLBACK");
            return { success: false, message: "Ratings are allowed only after completed drop-off." };
        }

        let ratedUserId = "";
        if (role === "rider_to_driver") {
            if (actorUserId !== row.rider_id) {
                await client.query("ROLLBACK");
                return { success: false, message: "Only the rider can rate this driver." };
            }
            ratedUserId = row.driver_user_id;
        } else {
            if (actorUserId !== row.driver_user_id) {
                await client.query("ROLLBACK");
                return { success: false, message: "Only the trip driver can rate this rider." };
            }
            ratedUserId = row.rider_id;
        }

        const insertSql = `
            INSERT INTO trip_ratings (trip_id, request_id, rater_user_id, rated_user_id, role, rating, comment)
            VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''))
            ON CONFLICT (request_id, role) DO NOTHING
            RETURNING id
        `;
        const insertRes = await client.query(insertSql, [
            row.trip_id,
            row.request_id,
            actorUserId,
            ratedUserId,
            role,
            rating,
            (comment || "").trim()
        ]);
        if ((insertRes.rowCount ?? 0) === 0) {
            await client.query("ROLLBACK");
            return { success: false, message: "Rating already submitted." };
        }

        if (role === "rider_to_driver") {
            await updateDriverAggregateRating(client, ratedUserId, rating);
        } else {
            await updateUserAggregateRating(client, ratedUserId, rating);
        }

        await client.query("COMMIT");
        return { success: true };
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error submitting trip rating:", error);
        return { success: false, message: "Failed to submit rating." };
    } finally {
        client.release();
    }
};

export const rateDriverByRider = async (requestId: string, riderUserId: string, rating: number, comment?: string): Promise<{ success: boolean; message?: string }> => {
    return submitTripRating(requestId, riderUserId, rating, "rider_to_driver", comment);
};

export const rateRiderByDriver = async (requestId: string, driverUserId: string, rating: number, comment?: string): Promise<{ success: boolean; message?: string }> => {
    return submitTripRating(requestId, driverUserId, rating, "driver_to_rider", comment);
};

export const getAllUpcomingTrips = async (): Promise<Record<string, unknown>[]> => {
    const sql = `
        SELECT
            t.id,
            t.from_address,
            t.to_address,
            t.travel_date,
            t.fare_per_seat,
            t.total_seats,
            t.available_seats,
            t.description,
            t.status,
            ST_Y(t.from_location::geometry) as from_lat,
            ST_X(t.from_location::geometry) as from_lng,
            ST_Y(t.to_location::geometry) as to_lat,
            ST_X(t.to_location::geometry) as to_lng,
            u.name as driver_name,
            d.avg_rating as driver_rating,
            d.total_ratings as driver_total_ratings,
            d.vehicle_type,
            d.vehicle_number,
            d.vehicle_info
        FROM trips t
        JOIN drivers d ON t.driver_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE t.status = 'scheduled'
          AND t.available_seats > 0
          AND t.travel_date > now()
        ORDER BY t.travel_date ASC;
    `;
    try {
        const res = await query(sql);
        return res.rows;
    } catch (error) {
        console.error('Error fetching all upcoming trips:', error);
        return [];
    }
};

export const createPasswordResetToken = async (
    userId: string,
    token: string,
    expiresAt: Date
): Promise<void> => {
    await query(
        `
        WITH deleted AS (
            DELETE FROM password_reset_tokens
            WHERE user_id = $1
        )
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3);
        `,
        [userId, token, expiresAt]
    );
};

export const getPasswordResetToken = async (
    token: string
): Promise<{ user_id: string; expires_at: Date } | null> => {
    const res = await query(
        "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1",
        [token]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0] as { user_id: string; expires_at: Date };
};

export const deletePasswordResetToken = async (token: string): Promise<void> => {
    await query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);
};
