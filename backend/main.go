package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load("../.env.local"); err != nil {
		log.Println("Warning: could not load ../.env.local, using system env vars")
	}

	// Validate required environment variables
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	if strings.TrimSpace(os.Getenv("FRONTEND_ORIGIN")) == "" {
		log.Fatal("FRONTEND_ORIGIN is required")
	}

	var err error
	dbPool, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer dbPool.Close()

	// Verify database connection is working
	if err := dbPool.Ping(context.Background()); err != nil {
		log.Fatalf("failed to verify database connection: %v", err)
	}
	log.Println("Database connection verified")

	setupRoutes()
	log.Println("Starting Yatra Backend on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
