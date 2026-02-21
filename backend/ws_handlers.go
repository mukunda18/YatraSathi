package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	userID, err := verifyToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrade error: %v", err)
		return
	}

	client := &Client{
		conn:   ws,
		userID: userID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	_ = setLiveUserStatus(ctx, userID, "online")
	cancel()

	log.Printf("User %s connected", userID)
	reader(client)
}

func reader(c *Client) {
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		_ = setLiveUserStatus(ctx, c.userID, "offline")
		cancel()
		hub.Leave(c)
		_ = c.conn.Close()
		log.Printf("User %s disconnected", c.userID)
	}()

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			return
		}

		var msg Message
		if err := json.Unmarshal(raw, &msg); err != nil {
			c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "invalid message"}})
			continue
		}

		switch msg.Event {
		case "join_trip":
			handleJoinTrip(c, msg.Payload)
		case "location_update":
			handleLocationUpdate(c, msg.Payload)
		case "rider_action":
			handleRiderActionValidation(c, msg.Payload)
		case "trip_action":
			handleTripActionValidation(c, msg.Payload)
		default:
			c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "unknown event"}})
		}
	}
}

func handleJoinTrip(c *Client, payloadRaw json.RawMessage) {
	var payload JoinTripPayload
	if err := json.Unmarshal(payloadRaw, &payload); err != nil || payload.TripID == "" {
		c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "invalid join payload"}})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	role := ""
	if isDriverForTrip(ctx, payload.TripID, c.userID) {
		role = "driver"
	} else if isRiderForTrip(ctx, payload.TripID, c.userID) {
		role = "rider"
	}

	if role == "" {
		c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "forbidden trip join"}})
		return
	}

	c.role = role
	hub.JoinRoom(c, payload.TripID)
	c.writeJSON(SocketResponse{
		Event: "joined_trip",
		Payload: map[string]string{
			"tripId": payload.TripID,
			"role":   role,
		},
	})
}

func handleLocationUpdate(c *Client, payloadRaw json.RawMessage) {
	var payload LocationUpdatePayload
	if err := json.Unmarshal(payloadRaw, &payload); err != nil || payload.TripID == "" {
		c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "invalid location payload"}})
		return
	}

	if c.tripID == "" || c.tripID != payload.TripID {
		c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "join trip first"}})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if isDriverForTrip(ctx, payload.TripID, c.userID) {
		if err := upsertDriverLiveLocation(ctx, payload.TripID, c.userID, payload); err != nil {
			c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "driver location update failed"}})
			return
		}
		hub.BroadcastToTrip(payload.TripID, SocketResponse{
			Event: "driver_location_updated",
			Payload: map[string]interface{}{
				"tripId":     payload.TripID,
				"lat":        payload.Lat,
				"lng":        payload.Lng,
				"heading":    payload.Heading,
				"speedKmph":  payload.SpeedKmph,
				"updatedAt":  time.Now().UTC().Format(time.RFC3339),
				"sourceRole": "driver",
			},
		})
		return
	}

	if isRiderForTrip(ctx, payload.TripID, c.userID) {
		if err := upsertRiderLiveLocation(ctx, c.userID, payload); err != nil {
			c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "rider location update failed"}})
			return
		}
		riderName := getUserName(ctx, c.userID)
		requestID := getRequestIDForTripRider(ctx, payload.TripID, c.userID)
		if requestID == "" {
			c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "active ride request not found"}})
			return
		}
		hub.BroadcastToTripRole(payload.TripID, "driver", SocketResponse{
			Event: "rider_location_updated",
			Payload: map[string]interface{}{
				"tripId":     payload.TripID,
				"requestId":  requestID,
				"riderName":  riderName,
				"lat":        payload.Lat,
				"lng":        payload.Lng,
				"status":     "trip_active",
				"updatedAt":  time.Now().UTC().Format(time.RFC3339),
				"sourceRole": "rider",
			},
		})
		return
	}

	c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "forbidden location update"}})
}

func handleRiderActionValidation(c *Client, payloadRaw json.RawMessage) {
	var payload RiderActionPayload
	if err := json.Unmarshal(payloadRaw, &payload); err != nil || payload.TripID == "" || payload.RequestID == "" {
		c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "invalid rider action payload"}})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if !isRiderForTrip(ctx, payload.TripID, c.userID) {
		c.writeJSON(SocketResponse{Event: "rider_action_validation", Payload: map[string]interface{}{"allowed": false, "reason": "rider only"}})
		return
	}

	allowed, reason := validateRiderDistanceForSelfAction(ctx, payload.TripID, payload.RequestID, c.userID, payload.Action)
	c.writeJSON(SocketResponse{
		Event: "rider_action_validation",
		Payload: map[string]interface{}{
			"tripId":    payload.TripID,
			"requestId": payload.RequestID,
			"action":    payload.Action,
			"allowed":   allowed,
			"reason":    reason,
		},
	})
}

func handleTripActionValidation(c *Client, payloadRaw json.RawMessage) {
	var payload TripActionPayload
	if err := json.Unmarshal(payloadRaw, &payload); err != nil || payload.TripID == "" {
		c.writeJSON(SocketResponse{Event: "error", Payload: map[string]string{"message": "invalid trip action payload"}})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	allowed := isDriverForTrip(ctx, payload.TripID, c.userID)
	c.writeJSON(SocketResponse{
		Event: "trip_action_validation",
		Payload: map[string]interface{}{
			"tripId":  payload.TripID,
			"action":  payload.Action,
			"allowed": allowed,
			"reason": func() string {
				if allowed {
					return ""
				}
				return "driver only"
			}(),
		},
	})
}
