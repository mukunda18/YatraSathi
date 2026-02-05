CREATE EXTENSION IF NOT EXISTS postgis;
-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    avg_rating NUMERIC(3, 2) DEFAULT 5.0 CHECK (
        avg_rating BETWEEN 0 AND 5
    ),
    total_ratings INT DEFAULT 0,
    is_driver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- 2. DRIVERS
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    vehicle_number TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL,
    vehicle_info JSONB,
    license_number TEXT NOT NULL UNIQUE,
    avg_rating NUMERIC(3, 2) DEFAULT 5.0 CHECK (
        avg_rating BETWEEN 0 AND 5
    ),
    total_ratings INT DEFAULT 0,
    status TEXT DEFAULT 'inactive',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 3. TRIPS
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    from_location GEOGRAPHY(POINT, 4326) NOT NULL,
    from_address TEXT NOT NULL,
    to_location GEOGRAPHY(POINT, 4326) NOT NULL,
    to_address TEXT NOT NULL,
    route GEOGRAPHY(LINESTRING, 4326),
    travel_date TIMESTAMPTZ NOT NULL,
    fare_per_seat NUMERIC(10, 2) NOT NULL CHECK (fare_per_seat >= 0),
    total_seats INT NOT NULL CHECK (total_seats > 0),
    available_seats INT NOT NULL CHECK (
        available_seats >= 0
        AND available_seats <= total_seats
    ),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trips_geo_from ON trips USING GIST (from_location);
CREATE INDEX IF NOT EXISTS idx_trips_geo_to ON trips USING GIST (to_location);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
-- 3.5 TRIP STOPS
CREATE TABLE IF NOT EXISTS trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_location GEOGRAPHY(POINT, 4326) NOT NULL,
    stop_address TEXT NOT NULL,
    stop_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
-- 4. RIDE REQUESTS
CREATE TABLE IF NOT EXISTS ride_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
    pickup_address TEXT NOT NULL,
    drop_location GEOGRAPHY(POINT, 4326) NOT NULL,
    drop_address TEXT NOT NULL,
    seats INT NOT NULL DEFAULT 1 CHECK (seats > 0),
    total_fare NUMERIC(10, 2) NOT NULL CHECK (total_fare >= 0),
    status TEXT NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(rider_id, trip_id)
);
CREATE INDEX IF NOT EXISTS idx_ride_requests_trip_id ON ride_requests(trip_id);
-- 5. LIVE TRACKING
CREATE TABLE IF NOT EXISTS live_trips (
    trip_id UUID PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL UNIQUE REFERENCES drivers(id) ON DELETE CASCADE,
    current_location GEOGRAPHY(POINT, 4326) NOT NULL,
    heading NUMERIC(5, 2),
    speed_kmph NUMERIC(5, 2),
    last_updated TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_live_trips_location ON live_trips USING GIST(current_location);
CREATE TABLE IF NOT EXISTS live_users (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_location GEOGRAPHY(POINT, 4326) NOT NULL,
    status TEXT DEFAULT 'online',
    last_updated TIMESTAMPTZ DEFAULT now()
);
-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_users_updated_at'
) THEN CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_drivers_updated_at'
) THEN CREATE TRIGGER update_drivers_updated_at BEFORE
UPDATE ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_trips_updated_at'
) THEN CREATE TRIGGER update_trips_updated_at BEFORE
UPDATE ON trips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_ride_requests_updated_at'
) THEN CREATE TRIGGER update_ride_requests_updated_at BEFORE
UPDATE ON ride_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
END IF;
END $$;