package main

import (
	"context"
	"fmt"
	"net/url"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

func setupRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		_, _ = fmt.Fprintf(w, "Welcome to the Yatra Backend!")
	})
	http.HandleFunc("/ws", wsEndpoint)
	http.HandleFunc("/api/trips/", tripsAPIHandler)
	http.HandleFunc("/api/requests/", requestsAPIHandler)
	http.HandleFunc("/api/live/trips/", liveTripViewAPIHandler)
	http.HandleFunc("/api/live/driver/current", liveDriverCurrentTripAPIHandler)
}

func tripsAPIHandler(w http.ResponseWriter, r *http.Request) {
	if !handleCORS(w, r) {
		return
	}

	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "method not allowed"})
		return
	}

	userID, err := verifyToken(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "message": "unauthorized"})
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/trips/")
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) != 2 {
		writeJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "invalid trip action path"})
		return
	}

	tripID := parts[0]
	action := parts[1]

	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	switch action {
	case "start":
		ok, msg := startTripByDriver(ctx, tripID, userID)
		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": msg})
			return
		}
		writeJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "Trip started successfully", "redirectTo": "/driver/live"})
	case "complete":
		ok, msg := completeTripByDriver(ctx, tripID, userID)
		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": msg})
			return
		}
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"success":    true,
			"message":    "Trip completed successfully",
			"redirectTo": fmt.Sprintf("/trips/%s", tripID),
		})
	default:
		writeJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "unknown trip action"})
	}
}

func requestsAPIHandler(w http.ResponseWriter, r *http.Request) {
	if !handleCORS(w, r) {
		return
	}

	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "method not allowed"})
		return
	}

	userID, err := verifyToken(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "message": "unauthorized"})
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/requests/")
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) != 2 {
		writeJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "invalid request action path"})
		return
	}

	requestID := parts[0]
	action := parts[1]

	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	switch action {
	case "onboard":
		ok, tripID, msg := markRiderOnboardByRider(ctx, requestID, userID)
		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": msg})
			return
		}
		writeJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "You are now onboard.", "tripId": tripID})
	case "dropoff":
		ok, tripID, msg := markRiderDroppedOffByRider(ctx, requestID, userID)
		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": msg})
			return
		}
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"success":    true,
			"message":    "You are now dropped off.",
			"redirectTo": fmt.Sprintf("/trips/%s", tripID),
		})
	default:
		writeJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "unknown request action"})
	}
}

func handleCORS(w http.ResponseWriter, r *http.Request) bool {
	allowedOrigin := strings.TrimSpace(os.Getenv("FRONTEND_ORIGIN"))
	if allowedOrigin == "" {
		writeJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "FRONTEND_ORIGIN not configured"})
		return false
	}
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	if origin != "" {
		originURL, originErr := url.Parse(origin)
		allowedURL, allowedErr := url.Parse(allowedOrigin)
		if originErr != nil || allowedErr != nil ||
			!strings.EqualFold(originURL.Scheme, allowedURL.Scheme) ||
			!strings.EqualFold(originURL.Host, allowedURL.Host) {
			writeJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "origin not allowed"})
			return false
		}
	}

	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Vary", "Origin")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return false
	}
	return true
}

func liveTripViewAPIHandler(w http.ResponseWriter, r *http.Request) {
	if !handleCORS(w, r) {
		return
	}
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "method not allowed"})
		return
	}

	userID, err := verifyToken(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "message": "unauthorized"})
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/live/trips/")
	tripID := strings.Trim(path, "/")
	if tripID == "" {
		writeJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "invalid trip id"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	if !isDriverForTrip(ctx, tripID, userID) && !isRiderForTrip(ctx, tripID, userID) {
		writeJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "forbidden"})
		return
	}

	trip, err := getLiveTripViewByID(ctx, tripID, userID)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "Trip not found", "trip": nil})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "failed to fetch live trip", "trip": nil})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"success": true, "trip": trip})
}

func liveDriverCurrentTripAPIHandler(w http.ResponseWriter, r *http.Request) {
	if !handleCORS(w, r) {
		return
	}
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "method not allowed"})
		return
	}

	userID, err := verifyToken(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "message": "unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	trip, err := getCurrentDriverLiveTripByUserID(ctx, userID)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "No ongoing trip found", "trip": nil})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "failed to fetch driver live trip", "trip": nil})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"success": true, "trip": trip})
}
