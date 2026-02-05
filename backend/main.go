package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Message struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}

func verifyToken(r *http.Request) (string, error) {
	tokenString := ""
	cookie, err := r.Cookie("yatrasathi")

	if err == nil {
		tokenString = cookie.Value
	} else {
		tokenString = r.URL.Query().Get("token")
	}

	if tokenString == "" {
		return "", fmt.Errorf("no security token provided")
	}

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		_, ok := t.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, fmt.Errorf("wrong signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return "", fmt.Errorf("failed to verify token: %v", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if ok && token.Valid {
		userId := fmt.Sprintf("%v", claims["userId"])
		return userId, nil
	}

	return "", fmt.Errorf("token is invalid")
}

func reader(conn *websocket.Conn) {
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(p, &msg); err != nil {
			log.Printf("error decoding json: %v", err)
			continue
		}

		log.Printf("Received Event: %s, Payload: %s\n", msg.Event, string(msg.Payload))

		response, _ := json.Marshal(msg)
		if err := conn.WriteMessage(messageType, response); err != nil {
			log.Println(err)
			return
		}
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	userId, err := verifyToken(r)
	if err != nil {
		log.Printf("Auth failed: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	log.Printf("User %s Connected\n", userId)
	reader(ws)
}

func setupRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Welcome to the Yatra Backend!")
	})
	http.HandleFunc("/ws", wsEndpoint)
}

func main() {
	err := godotenv.Load("../.env.local")
	if err != nil {
		log.Println("Warning: Could not load .env.local file, using system env vars")
	}

	fmt.Println("Starting Yatra Backend on :8080...")
	setupRoutes()
	log.Fatal(http.ListenAndServe(":8080", nil))
}
