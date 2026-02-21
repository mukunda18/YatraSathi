package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func isDriverForTrip(ctx context.Context, tripID, userID string) bool {
	sql := `
		SELECT 1
		FROM trips t
		JOIN drivers d ON t.driver_id = d.id
		WHERE t.id = $1
		  AND d.user_id = $2
		  AND t.status = 'ongoing'
		LIMIT 1
	`
	var one int
	if err := dbPool.QueryRow(ctx, sql, tripID, userID).Scan(&one); err != nil {
		return false
	}
	return true
}

func isRiderForTrip(ctx context.Context, tripID, userID string) bool {
	sql := `
		SELECT 1
		FROM ride_requests rr
		JOIN trips t ON t.id = rr.trip_id
		WHERE rr.trip_id = $1
		  AND rr.rider_id = $2
		  AND rr.status IN ('waiting', 'onboard', 'dropedoff')
		  AND t.status = 'ongoing'
		LIMIT 1
	`
	var one int
	if err := dbPool.QueryRow(ctx, sql, tripID, userID).Scan(&one); err != nil {
		return false
	}
	return true
}

func upsertDriverLiveLocation(ctx context.Context, tripID, userID string, payload LocationUpdatePayload) error {
	var driverID string
	driverSQL := `
		SELECT d.id
		FROM drivers d
		JOIN trips t ON t.driver_id = d.id
		WHERE t.id = $1 AND d.user_id = $2
		LIMIT 1
	`
	if err := dbPool.QueryRow(ctx, driverSQL, tripID, userID).Scan(&driverID); err != nil {
		return err
	}

	sql := `
		INSERT INTO live_trips (trip_id, driver_id, current_location, heading, speed_kmph, last_updated)
		VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326)::geography, $5, $6, now())
		ON CONFLICT (trip_id)
		DO UPDATE SET
			current_location = EXCLUDED.current_location,
			heading = EXCLUDED.heading,
			speed_kmph = EXCLUDED.speed_kmph,
			last_updated = now()
	`
	_, err := dbPool.Exec(ctx, sql, tripID, driverID, payload.Lat, payload.Lng, payload.Heading, payload.SpeedKmph)
	return err
}

func upsertRiderLiveLocation(ctx context.Context, userID string, payload LocationUpdatePayload) error {
	sql := `
		INSERT INTO live_users (user_id, current_location, status, last_updated)
		VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography, 'trip_active', now())
		ON CONFLICT (user_id)
		DO UPDATE SET
			current_location = EXCLUDED.current_location,
			status = EXCLUDED.status,
			last_updated = now()
	`
	_, err := dbPool.Exec(ctx, sql, userID, payload.Lat, payload.Lng)
	return err
}

func validateRiderDistanceForSelfAction(ctx context.Context, tripID, requestID, riderID, action string) (bool, string) {
	if action != "onboard" && action != "dropoff" {
		return false, "invalid rider action"
	}

	targetColumn := "rr.pickup_location"
	expectedStatus := "waiting"
	if action == "dropoff" {
		targetColumn = "rr.drop_location"
		expectedStatus = "onboard"
	}

	sql := fmt.Sprintf(`
		SELECT ST_DWithin(lu.current_location, %s, 100)
		FROM live_users lu
		JOIN ride_requests rr ON rr.rider_id = lu.user_id
		WHERE rr.trip_id = $1
		  AND rr.id = $2
		  AND rr.status = $3
		  AND rr.rider_id = $4
		LIMIT 1
	`, targetColumn)

	var allowed bool
	if err := dbPool.QueryRow(ctx, sql, tripID, requestID, expectedStatus, riderID).Scan(&allowed); err != nil {
		return false, "missing live locations or invalid request state"
	}
	if !allowed {
		return false, "rider must be within 100m"
	}
	return true, ""
}

func setLiveUserStatus(ctx context.Context, userID, status string) error {
	sql := `
		UPDATE live_users
		SET status = $2, last_updated = now()
		WHERE user_id = $1
	`
	_, err := dbPool.Exec(ctx, sql, userID, status)
	return err
}

func getUserName(ctx context.Context, userID string) string {
	var name string
	if err := dbPool.QueryRow(ctx, `SELECT name FROM users WHERE id = $1`, userID).Scan(&name); err != nil {
		return "Rider"
	}
	return name
}

func getRequestIDForTripRider(ctx context.Context, tripID, riderID string) string {
	var requestID string
	sql := `
		SELECT rr.id
		FROM ride_requests rr
		WHERE rr.trip_id = $1
		  AND rr.rider_id = $2
		  AND rr.status IN ('waiting', 'onboard', 'dropedoff')
		LIMIT 1
	`
	if err := dbPool.QueryRow(ctx, sql, tripID, riderID).Scan(&requestID); err != nil {
		return ""
	}
	return requestID
}

func startTripByDriver(ctx context.Context, tripID, userID string) (bool, string) {
	tx, err := dbPool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return false, "failed to start transaction"
	}
	defer tx.Rollback(ctx)

	var driverID string
	var travelDate string
	var tripStatus string
	var fromLocation string
	var routeID *string
	tripSQL := `
		SELECT d.id, t.travel_date::text, t.status, ST_AsText(t.from_location) as from_location_wkt, t.route_id
		FROM trips t
		JOIN drivers d ON d.id = t.driver_id
		WHERE t.id = $1 AND d.user_id = $2
		FOR UPDATE OF t
	`
	if err := tx.QueryRow(ctx, tripSQL, tripID, userID).Scan(&driverID, &travelDate, &tripStatus, &fromLocation, &routeID); err != nil {
		return false, "Trip not found or unauthorized."
	}

	if tripStatus != "scheduled" {
		return false, "Only scheduled trips can be started."
	}
	if routeID == nil || *routeID == "" {
		return false, "Trip route is missing. Please recreate the trip."
	}

	ongoingSQL := `
		SELECT 1 FROM trips WHERE driver_id = $1 AND status = 'ongoing' AND id != $2 LIMIT 1
	`
	var one int
	if err := tx.QueryRow(ctx, ongoingSQL, driverID, tripID).Scan(&one); err == nil {
		return false, "You already have an ongoing trip."
	}

	if _, err := tx.Exec(ctx, `UPDATE trips SET status = 'ongoing', updated_at = now() WHERE id = $1 AND driver_id = $2`, tripID, driverID); err != nil {
		return false, "Failed to start trip."
	}

	if _, err := tx.Exec(ctx, `DELETE FROM live_trips WHERE driver_id = $1`, driverID); err != nil {
		return false, "Failed to initialize live trip."
	}

	if _, err := tx.Exec(ctx, `INSERT INTO live_trips (trip_id, driver_id, current_location, heading, speed_kmph, last_updated) VALUES ($1, $2, ST_GeogFromText($3), NULL, NULL, now())`, tripID, driverID, fromLocation); err != nil {
		return false, "Failed to initialize live trip."
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO live_users (user_id, current_location, status, last_updated)
		SELECT rr.rider_id, rr.pickup_location, 'trip_waiting', now()
		FROM ride_requests rr
		WHERE rr.trip_id = $1 AND rr.status IN ('waiting', 'onboard')
		ON CONFLICT (user_id)
		DO UPDATE SET current_location = EXCLUDED.current_location, status = EXCLUDED.status, last_updated = EXCLUDED.last_updated
	`, tripID); err != nil {
		return false, "Failed to initialize riders."
	}

	if err := tx.Commit(ctx); err != nil {
		return false, "Failed to commit trip start."
	}

	hub.EnsureRoom(tripID)
	hub.BroadcastToTrip(tripID, SocketResponse{
		Event:   "trip_started",
		Payload: map[string]interface{}{"tripId": tripID, "status": "ongoing"},
	})

	_ = travelDate // reserved for future time-window validation
	return true, ""
}

func completeTripByDriver(ctx context.Context, tripID, userID string) (bool, string) {
	tx, err := dbPool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return false, "failed to start transaction"
	}
	defer tx.Rollback(ctx)

	const proximitySQL = `
		SELECT 1
		FROM trips t
		JOIN drivers d ON d.id = t.driver_id
		JOIN live_trips lt ON lt.trip_id = t.id
		WHERE t.id = $1
		  AND d.user_id = $2
		  AND t.status = 'ongoing'
		  AND ST_DWithin(lt.current_location, t.to_location, 100)
		LIMIT 1
	`
	var one int
	if err := tx.QueryRow(ctx, proximitySQL, tripID, userID).Scan(&one); err != nil {
		return false, "Driver must be within 100m of destination to complete trip."
	}

	res, err := tx.Exec(ctx, `
		UPDATE trips t
		SET status = 'completed', available_seats = t.total_seats, updated_at = now()
		FROM drivers d
		WHERE t.id = $1 AND d.id = t.driver_id AND d.user_id = $2 AND t.status = 'ongoing'
	`, tripID, userID)
	if err != nil || res.RowsAffected() == 0 {
		return false, "Trip is not ongoing or not owned by driver."
	}

	if _, err := tx.Exec(ctx, `
		UPDATE ride_requests
		SET
			status = CASE
				WHEN status = 'onboard' THEN 'dropedoff'
				ELSE 'cancelled'
			END,
			cancelled_at = CASE
				WHEN status = 'waiting' THEN now()
				ELSE cancelled_at
			END,
			cancelled_reason = CASE
				WHEN status = 'waiting' THEN 'Trip completed'
				ELSE cancelled_reason
			END,
			updated_at = now()
		WHERE trip_id = $1
		  AND status IN ('waiting', 'onboard')
	`, tripID); err != nil {
		return false, "Failed to reconcile rider statuses."
	}

	if _, err := tx.Exec(ctx, `
		DELETE FROM live_users lu
		WHERE lu.user_id = $2
		   OR lu.user_id IN (
				SELECT rr.rider_id
				FROM ride_requests rr
				WHERE rr.trip_id = $1
		   )
	`, tripID, userID); err != nil {
		return false, "Failed to clear live users."
	}

	if _, err := tx.Exec(ctx, `DELETE FROM live_trips WHERE trip_id = $1`, tripID); err != nil {
		return false, "Failed to clear live trip."
	}

	if err := tx.Commit(ctx); err != nil {
		return false, "Failed to complete trip."
	}

	hub.BroadcastToTrip(tripID, SocketResponse{
		Event:   "trip_completed",
		Payload: map[string]interface{}{"tripId": tripID, "status": "completed"},
	})
	hub.CloseRoom(tripID)
	return true, ""
}

func markRiderOnboardByRider(ctx context.Context, requestID, riderID string) (bool, string, string) {
	const sql = `
		UPDATE ride_requests rr
		SET status = 'onboard', updated_at = now()
		FROM trips t
		JOIN live_users lu ON lu.user_id = rr.rider_id
		WHERE rr.id = $1
		  AND rr.rider_id = $2
		  AND rr.trip_id = t.id
		  AND t.status = 'ongoing'
		  AND rr.status = 'waiting'
		  AND ST_DWithin(lu.current_location, rr.pickup_location, 100)
		RETURNING rr.trip_id
	`
	var tripID string
	if err := dbPool.QueryRow(ctx, sql, requestID, riderID).Scan(&tripID); err != nil {
		return false, "", "Unable to mark onboard. Be within 100m of pickup and trip must be ongoing."
	}
	hub.BroadcastToTrip(tripID, SocketResponse{
		Event:   "rider_onboard",
		Payload: map[string]interface{}{"tripId": tripID, "requestId": requestID, "status": "onboard"},
	})
	return true, tripID, ""
}

func markRiderDroppedOffByRider(ctx context.Context, requestID, riderID string) (bool, string, string) {
	tx, err := dbPool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return false, "", "failed to start transaction"
	}
	defer tx.Rollback(ctx)

	const currentSQL = `
		SELECT rr.status, rr.seats, rr.trip_id,
			   ST_DWithin(lu.current_location, rr.drop_location, 100) as within_range
		FROM ride_requests rr
		JOIN trips t ON rr.trip_id = t.id
		JOIN live_users lu ON lu.user_id = rr.rider_id
		WHERE rr.id = $1 AND rr.rider_id = $2 AND t.status = 'ongoing'
		FOR UPDATE OF rr
	`
	var oldStatus string
	var seats int
	var tripID string
	var withinRange bool
	if err := tx.QueryRow(ctx, currentSQL, requestID, riderID).Scan(&oldStatus, &seats, &tripID, &withinRange); err != nil {
		return false, "", "Unable to drop off. Be within 100m of destination and status must be onboard."
	}
	if oldStatus != "onboard" || !withinRange {
		return false, "", "Unable to drop off. Be within 100m of destination and status must be onboard."
	}

	if _, err := tx.Exec(ctx, `UPDATE ride_requests SET status = 'dropedoff', updated_at = now() WHERE id = $1`, requestID); err != nil {
		return false, "", "Failed to update rider status."
	}
	if _, err := tx.Exec(ctx, `UPDATE trips SET available_seats = available_seats + $1, updated_at = now() WHERE id = $2`, seats, tripID); err != nil {
		return false, "", "Failed to update seat availability."
	}
	if _, err := tx.Exec(ctx, `DELETE FROM live_users WHERE user_id = $1`, riderID); err != nil {
		return false, "", "Failed to clear rider live status."
	}

	if err := tx.Commit(ctx); err != nil {
		return false, "", "Failed to commit dropoff."
	}

	hub.BroadcastToTrip(tripID, SocketResponse{
		Event:   "rider_dropped_off",
		Payload: map[string]interface{}{"tripId": tripID, "requestId": requestID, "status": "dropedoff"},
	})
	return true, tripID, ""
}

func getLiveTripViewByID(ctx context.Context, tripID, userID string) (map[string]interface{}, error) {
	const sql = `
		SELECT row_to_json(t)
		FROM (
			SELECT
				t.id as trip_id, t.from_address, t.to_address, t.travel_date,
				t.fare_per_seat, t.total_seats, t.available_seats, t.description, t.status as trip_status,
				ST_Y(t.from_location::geometry) as from_lat, ST_X(t.from_location::geometry) as from_lng,
				ST_Y(t.to_location::geometry) as to_lat, ST_X(t.to_location::geometry) as to_lng,
				u.name as driver_name, d.avg_rating as driver_rating,
				($2::uuid = u.id) as is_driver_viewer,
				d.vehicle_type, d.vehicle_number, d.vehicle_info,
				ST_Y(lt.current_location::geometry) as driver_current_lat,
				ST_X(lt.current_location::geometry) as driver_current_lng,
				lt.heading as driver_heading,
				lt.speed_kmph as driver_speed_kmph,
				lt.last_updated as driver_last_updated,
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
				CASE
					WHEN $2::uuid = u.id THEN (
						SELECT COALESCE(json_agg(rd), '[]')
						FROM (
							SELECT rr.id as request_id, ru.name as rider_name,
								   rr.pickup_address, rr.drop_address, rr.seats, rr.total_fare, rr.status,
								   ST_Y(rr.pickup_location::geometry) as pickup_lat, ST_X(rr.pickup_location::geometry) as pickup_lng,
								   ST_Y(rr.drop_location::geometry) as drop_lat, ST_X(rr.drop_location::geometry) as drop_lng
							FROM ride_requests rr
							JOIN users ru ON rr.rider_id = ru.id
							WHERE rr.trip_id = t.id AND rr.status IN ('waiting', 'onboard', 'dropedoff')
						) rd
					)
					ELSE '[]'::json
				END as riders,
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
					WHERE my_rr.trip_id = t.id AND my_rr.rider_id = $2 AND my_rr.status NOT IN ('cancelled')
					LIMIT 1
				) as my_request
			FROM trips t
			JOIN drivers d ON t.driver_id = d.id
			JOIN users u ON d.user_id = u.id
			LEFT JOIN routes r ON t.route_id = r.id
			LEFT JOIN live_trips lt ON lt.trip_id = t.id
			WHERE t.id = $1
			LIMIT 1
		) t
	`

	var raw []byte
	if err := dbPool.QueryRow(ctx, sql, tripID, userID).Scan(&raw); err != nil {
		return nil, err
	}

	var trip map[string]interface{}
	if err := json.Unmarshal(raw, &trip); err != nil {
		return nil, err
	}
	if myRequest, ok := trip["my_request"].(map[string]interface{}); ok {
		if _, hasID := myRequest["id"]; !hasID {
			trip["my_request"] = nil
		}
	}
	return trip, nil
}

func getCurrentDriverLiveTripByUserID(ctx context.Context, userID string) (map[string]interface{}, error) {
	const sql = `
		SELECT row_to_json(t)
		FROM (
			SELECT
				t.id as trip_id, t.from_address, t.to_address, t.travel_date,
				t.fare_per_seat, t.total_seats, t.available_seats, t.description, t.status as trip_status,
				ST_Y(t.from_location::geometry) as from_lat, ST_X(t.from_location::geometry) as from_lng,
				ST_Y(t.to_location::geometry) as to_lat, ST_X(t.to_location::geometry) as to_lng,
				u.name as driver_name, d.avg_rating as driver_rating,
				true as is_driver_viewer,
				d.vehicle_type, d.vehicle_number, d.vehicle_info,
				ST_Y(lt.current_location::geometry) as driver_current_lat,
				ST_X(lt.current_location::geometry) as driver_current_lng,
				lt.heading as driver_heading,
				lt.speed_kmph as driver_speed_kmph,
				lt.last_updated as driver_last_updated,
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
						SELECT rr.id as request_id, ru.name as rider_name,
							   rr.pickup_address, rr.drop_address, rr.seats, rr.total_fare, rr.status,
							   ST_Y(rr.pickup_location::geometry) as pickup_lat, ST_X(rr.pickup_location::geometry) as pickup_lng,
							   ST_Y(rr.drop_location::geometry) as drop_lat, ST_X(rr.drop_location::geometry) as drop_lng,
							   COALESCE(ST_Y(lu.current_location::geometry), ST_Y(rr.pickup_location::geometry)) as current_lat,
							   COALESCE(ST_X(lu.current_location::geometry), ST_X(rr.pickup_location::geometry)) as current_lng,
							   lu.status as live_status, lu.last_updated as live_last_updated
						FROM ride_requests rr
						JOIN users ru ON rr.rider_id = ru.id
						LEFT JOIN live_users lu ON lu.user_id = rr.rider_id
						WHERE rr.trip_id = t.id AND rr.status IN ('waiting', 'onboard', 'dropedoff')
					) rd
				) as riders
			FROM trips t
			JOIN drivers d ON t.driver_id = d.id
			JOIN users u ON d.user_id = u.id
			LEFT JOIN routes r ON t.route_id = r.id
			LEFT JOIN live_trips lt ON lt.trip_id = t.id
			WHERE u.id = $1 AND t.status = 'ongoing'
			ORDER BY t.updated_at DESC
			LIMIT 1
		) t
	`

	var raw []byte
	if err := dbPool.QueryRow(ctx, sql, userID).Scan(&raw); err != nil {
		return nil, err
	}

	var trip map[string]interface{}
	if err := json.Unmarshal(raw, &trip); err != nil {
		return nil, err
	}
	return trip, nil
}
