package main

import (
	"encoding/json"
	"log"
	"net/url"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Message struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}

type SocketResponse struct {
	Event   string      `json:"event"`
	Payload interface{} `json:"payload"`
}

type JoinTripPayload struct {
	TripID string `json:"tripId"`
	Role   string `json:"role"`
}

type LocationUpdatePayload struct {
	TripID    string   `json:"tripId"`
	Lat       float64  `json:"lat"`
	Lng       float64  `json:"lng"`
	Heading   *float64 `json:"heading"`
	SpeedKmph *float64 `json:"speedKmph"`
}

type RiderActionPayload struct {
	TripID    string `json:"tripId"`
	RequestID string `json:"requestId"`
	Action    string `json:"action"`
}

type TripActionPayload struct {
	TripID string `json:"tripId"`
	Action string `json:"action"`
}

type Client struct {
	conn   *websocket.Conn
	userID string
	tripID string
	role   string
	mu     sync.Mutex
}

func (c *Client) writeJSON(v interface{}) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if err := c.conn.WriteJSON(v); err != nil {
		log.Printf("write error for user %s: %v", c.userID, err)
	}
}

type Hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*Client]bool
}

func NewHub() *Hub {
	return &Hub{
		rooms: make(map[string]map[*Client]bool),
	}
}

func (h *Hub) EnsureRoom(tripID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.rooms[tripID]; !ok {
		h.rooms[tripID] = make(map[*Client]bool)
	}
}

func (h *Hub) JoinRoom(c *Client, tripID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if c.tripID != "" && c.tripID != tripID {
		h.removeFromRoomLocked(c, c.tripID)
	}

	if _, ok := h.rooms[tripID]; !ok {
		h.rooms[tripID] = make(map[*Client]bool)
	}
	h.rooms[tripID][c] = true
	c.tripID = tripID
}

func (h *Hub) Leave(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if c.tripID != "" {
		h.removeFromRoomLocked(c, c.tripID)
		c.tripID = ""
	}
}

func (h *Hub) removeFromRoomLocked(c *Client, tripID string) {
	room, ok := h.rooms[tripID]
	if !ok {
		return
	}
	delete(room, c)
	if len(room) == 0 {
		delete(h.rooms, tripID)
	}
}

func (h *Hub) BroadcastToTrip(tripID string, msg SocketResponse) {
	h.mu.RLock()
	room := h.rooms[tripID]
	clients := make([]*Client, 0, len(room))
	for c := range room {
		clients = append(clients, c)
	}
	h.mu.RUnlock()

	for _, c := range clients {
		c.writeJSON(msg)
	}
}

func (h *Hub) CloseRoom(tripID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	room, ok := h.rooms[tripID]
	if !ok {
		return
	}

	for c := range room {
		if c.tripID == tripID {
			c.tripID = ""
		}
	}

	delete(h.rooms, tripID)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin == "" {
			return false
		}

		allowed := strings.TrimSpace(os.Getenv("FRONTEND_ORIGIN"))
		if allowed == "" {
			return false
		}

		originURL, err := url.Parse(origin)
		if err != nil {
			return false
		}
		allowedURL, err := url.Parse(allowed)
		if err != nil {
			return false
		}

		return strings.EqualFold(originURL.Scheme, allowedURL.Scheme) &&
			strings.EqualFold(originURL.Host, allowedURL.Host)
	},
}

var dbPool *pgxpool.Pool
var hub = NewHub()
