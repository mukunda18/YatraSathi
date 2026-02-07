import { pool } from "./index";

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
    vehicle_info: any;
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
    status: string;
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
    status: string;
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


export type TableName =
    | "users"
    | "drivers"
    | "trips"
    | "ride_requests"
    | "live_trips"
    | "live_users"
    | "routes";

export const query = (text: string, params?: any[]) => pool.query(text, params);

// ============================================================================
// USER QUERIES
// ============================================================================

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
    const values: any[] = [];
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


// ============================================================================
// DRIVER QUERIES
// ============================================================================

export const createDriver = async (data: {
    user_id: string;
    vehicle_number: string;
    vehicle_type: string;
    license_number: string;
    vehicle_info?: any;
}): Promise<Driver | undefined> => {
    const sql = `
        INSERT INTO drivers (user_id, vehicle_number, vehicle_type, license_number, vehicle_info)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
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
        console.error('Error creating driver:', error);
        return;
    }
};


// ============================================================================
// TRIP QUERIES
// ============================================================================

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
            for (const stop of data.stops) {
                const stopSql = `
                    INSERT INTO trip_stops (trip_id, stop_location, stop_address, stop_order)
                    VALUES ($1, ST_GeogFromText($2), $3, $4);
                `;
                await client.query(stopSql, [trip.id, stop.location, stop.address, stop.order]);
            }
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




export const searchTrips = async (from_location: string, to_location: string): Promise<any[]> => {
    const sql = `
        SELECT 
            t.id, t.driver_id, t.from_address, t.to_address, t.travel_date, t.fare_per_seat, 
            t.total_seats, t.available_seats, t.description, t.status,
            u.id as driver_user_id, u.name as driver_name, u.avg_rating as driver_rating, u.total_ratings as driver_total_ratings,
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
            COALESCE(
                (SELECT json_agg(json_build_object(
                    'name', ru.name,
                    'pickup_address', rr.pickup_address,
                    'drop_address', rr.drop_address,
                    'seats', rr.seats,
                    'lat', ST_Y(rr.pickup_location::geometry),
                    'lng', ST_X(rr.pickup_location::geometry)
                ))
                 FROM ride_requests rr
                 JOIN users ru ON rr.rider_id = ru.id
                 WHERE rr.trip_id = t.id AND rr.status = 'waiting'
                ), '[]'::json
            ) as riders
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
        const res = await pool.query(sql, [from_location, to_location]);
        return res.rows;
    } catch (error) {
        console.error('Error searching trips:', error);
        return [];
    }
};

export const updateTripStatus = async (id: string, status: string, cancelled_reason?: string): Promise<Trip | undefined> => {
    const sql = `
        UPDATE trips 
        SET status = $1, 
            cancelled_at = CASE WHEN $1 = 'cancelled' THEN now() ELSE cancelled_at END,
            cancelled_reason = $2
        WHERE id = $3
        RETURNING 
            id, driver_id, 
            ST_AsText(from_location) as from_location, from_address,
            ST_AsText(to_location) as to_location, to_address,
            route_id,
            travel_date, fare_per_seat, total_seats, available_seats,
            description, status, cancelled_at, cancelled_reason,
            created_at, updated_at;
    `;
    try {
        const res = await query(sql, [status, cancelled_reason ?? null, id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error updating trip status:', error);
        return;
    }
};


// ============================================================================
// RIDE REQUEST QUERIES
// ============================================================================

export const createRideRequest = async (data: {
    rider_id: string;
    trip_id: string;
    pickup_location: string;
    pickup_address: string;
    drop_location: string;
    drop_address: string;
    seats: number;
    total_fare: number;
}): Promise<RideRequest | undefined> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Check seat availability
        const tripSql = `SELECT available_seats FROM trips WHERE id = $1 FOR UPDATE`;
        const tripRes = await client.query(tripSql, [data.trip_id]);
        if (tripRes.rowCount === 0) throw new Error('Trip not found');
        if (tripRes.rows[0].available_seats < data.seats) throw new Error('Not enough seats available');

        // 2. Insert request
        const sql = `
            INSERT INTO ride_requests (
                rider_id, trip_id, pickup_location, pickup_address,
                drop_location, drop_address, seats, total_fare, status
            )
            VALUES ($1, $2, ST_GeogFromText($3), $4, ST_GeogFromText($5), $6, $7, $8, 'waiting')
            RETURNING 
                id, rider_id, trip_id,
                ST_AsText(pickup_location) as pickup_location, pickup_address,
                ST_AsText(drop_location) as drop_location, drop_address,
                seats, total_fare, status, created_at, updated_at;
        `;
        const res = await client.query(sql, [
            data.rider_id,
            data.trip_id,
            data.pickup_location,
            data.pickup_address,
            data.drop_location,
            data.drop_address,
            data.seats,
            data.total_fare
        ]);

        // 3. Update trip seats
        const updateTripSql = `UPDATE trips SET available_seats = available_seats - $1 WHERE id = $2`;
        await client.query(updateTripSql, [data.seats, data.trip_id]);

        await client.query('COMMIT');
        return res.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating ride request:', error);
        return;
    } finally {
        client.release();
    }
};




export const getJoinedTripsByRiderId = async (rider_id: string): Promise<any[]> => {
    const sql = `
        SELECT 
            rr.id as request_id, rr.status as request_status, rr.seats as requested_seats,
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

export const getTripViewById = async (trip_id: string, rider_id?: string): Promise<any | null> => {
    const sql = `
        SELECT 
            t.id as trip_id, t.from_address, t.to_address, t.travel_date, 
            t.fare_per_seat, t.total_seats, t.available_seats, t.description, t.status as trip_status,
            ST_Y(t.from_location::geometry) as from_lat, ST_X(t.from_location::geometry) as from_lng,
            ST_Y(t.to_location::geometry) as to_lat, ST_X(t.to_location::geometry) as to_lng,
            u.id as driver_user_id, u.name as driver_name, u.phone as driver_phone, u.avg_rating as driver_rating,
            d.id as driver_id, d.vehicle_type, d.vehicle_number, d.vehicle_info,
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
            (
                SELECT COALESCE(json_agg(rd), '[]')
                FROM (
                    SELECT rr.id as request_id, rr.rider_id, ru.name as rider_name, ru.phone as rider_phone,
                           rr.pickup_address, rr.drop_address, rr.seats, rr.total_fare, rr.status
                    FROM ride_requests rr
                    JOIN users ru ON rr.rider_id = ru.id
                    WHERE rr.trip_id = t.id AND rr.status = 'accepted'
                ) rd
            ) as riders,
            (
                SELECT json_build_object(
                    'id', my_rr.id,
                    'status', my_rr.status,
                    'seats', my_rr.seats,
                    'total_fare', my_rr.total_fare,
                    'pickup_address', my_rr.pickup_address,
                    'drop_address', my_rr.drop_address
                )
                FROM ride_requests my_rr 
                WHERE my_rr.trip_id = t.id AND my_rr.rider_id = $2
                LIMIT 1
            ) as my_request
        FROM trips t
        JOIN drivers d ON t.driver_id = d.id
        JOIN users u ON d.user_id = u.id
        LEFT JOIN routes r ON t.route_id = r.id
        WHERE t.id = $1;
    `;
    try {
        const res = await query(sql, [trip_id, rider_id || null]);
        if (res.rows.length === 0) return null;

        const trip = res.rows[0];

        if (trip.my_request && !trip.my_request.id) {
            trip.my_request = null;
        }

        return trip;
    } catch (error) {
        console.error('Error getting trip view:', error);
        return null;
    }
};

// ============================================================================
// HELPERS
// ============================================================================

export const getOwnedTrip = async (tripId: string, userId: string): Promise<Trip | null> => {
    const sql = `
        SELECT t.* 
        FROM trips t
        JOIN drivers d ON t.driver_id = d.id
        WHERE t.id = $1 AND d.user_id = $2;
    `;
    try {
        const res = await query(sql, [tripId, userId]);
        return res.rows[0] || null;
    } catch (error) {
        console.error('Error checking trip ownership:', error);
        return null;
    }
};


// ============================================================================
// DRIVER DASHBOARD QUERIES
// ============================================================================

export const getDriverTripsWithRequests = async (driver_id: string): Promise<any[]> => {
    const sql = `
SELECT
t.id as trip_id, t.from_address, t.to_address, t.travel_date,
    t.fare_per_seat, t.total_seats, t.available_seats, t.status as trip_status,
    t.description, t.created_at,
    COALESCE(
        json_agg(
            json_build_object(
                'request_id', rr.id,
                'rider_id', rr.rider_id,
                'rider_name', u.name,
                'rider_phone', u.phone,
                'pickup_address', rr.pickup_address,
                'drop_address', rr.drop_address,
                'seats', rr.seats,
                'total_fare', rr.total_fare,
                'status', rr.status
            )
        ) FILTER(WHERE rr.id IS NOT NULL), '[]'
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
    let sql = `
        UPDATE trips 
        SET status = 'cancelled', cancelled_at = now(), cancelled_reason = $2, updated_at = now()
        WHERE id = $1 AND status = 'scheduled'
    `;
    const params = [trip_id, reason || null];

    if (driver_id) {
        sql += ` AND driver_id = $3`;
        params.push(driver_id);
    }

    try {
        const res = await query(sql, params);
        return (res.rowCount ?? 0) > 0;
    } catch (error) {
        console.error('Error cancelling trip:', error);
        return false;
    }
};

export const updateRideRequestStatus = async (request_id: string, status: string, driver_id: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verify driver owns the trip
        const checkOwnershipSql = `
            SELECT t.id 
            FROM ride_requests rr
            JOIN trips t ON rr.trip_id = t.id
            WHERE rr.id = $1 AND t.driver_id = $2
        `;
        const ownershipRes = await client.query(checkOwnershipSql, [request_id, driver_id]);
        if (ownershipRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return false;
        }

        const updateSql = `UPDATE ride_requests SET status = $2, updated_at = now() WHERE id = $1 RETURNING seats, trip_id; `;
        const res = await client.query(updateSql, [request_id, status]);

        if (res.rowCount === 0) {
            await client.query('ROLLBACK');
            return false;
        }

        const { seats, trip_id: requestTripId } = res.rows[0];

        if (status === 'accepted') {
            const updateSeatsSql = `UPDATE trips SET available_seats = available_seats - $1, updated_at = now() WHERE id = $2 AND available_seats >= $1; `;
            const seatsRes = await client.query(updateSeatsSql, [seats, requestTripId]);
            if (seatsRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return false;
            }
        } else if (status === 'rejected' || status === 'cancelled') {
            // Seats were already deducted when the request was created ('waiting')
            // So when rejecting or cancelling, we always restore them regardless of whether it was accepted or waiting.
            const restoreSeatsSql = `UPDATE trips SET available_seats = available_seats + $1, updated_at = now() WHERE id = $2; `;
            await client.query(restoreSeatsSql, [seats, requestTripId]);
        }

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating ride request status:', error);
        return false;
    } finally {
        client.release();
    }
};

export const removeRiderFromTrip = async (request_id: string, requesting_user_id?: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const getSql = `
            SELECT rr.seats, rr.trip_id, rr.status, rr.rider_id, t.driver_id, d.user_id as driver_user_id
            FROM ride_requests rr
            JOIN trips t ON rr.trip_id = t.id
            JOIN drivers d ON t.driver_id = d.id
            WHERE rr.id = $1
        `;
        const getRes = await client.query(getSql, [request_id]);

        if (getRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return false;
        }

        const { seats, trip_id, status, rider_id, driver_user_id } = getRes.rows[0];

        if (requesting_user_id && requesting_user_id !== rider_id && requesting_user_id !== driver_user_id) {
            await client.query('ROLLBACK');
            console.error("Unauthorized removal attempt");
            return false;
        }

        const deleteSql = `DELETE FROM ride_requests WHERE id = $1; `;
        await client.query(deleteSql, [request_id]);

        if (status === 'accepted' || status === 'waiting') {
            const restoreSql = `UPDATE trips SET available_seats = available_seats + $1, updated_at = now() WHERE id = $2; `;
            await client.query(restoreSql, [seats, trip_id]);
        }

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error removing rider from trip:', error);
        return false;
    } finally {
        client.release();
    }
};

