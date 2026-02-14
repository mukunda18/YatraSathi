# Yatra

A ride-sharing application built as a DBMS project. Users can create, search, and join trips for carpooling with real-time tracking and driver-passenger matching.

## Stack

**Frontend:**
- Next.js 16 with TypeScript
- React 19
- Zustand (state management)
- Tailwind CSS
- MapLibre GL (mapping)

**Backend:**
- Go 1.25
- PostgreSQL with PostGIS (geospatial queries)
- WebSocket (real-time updates)
- JWT authentication

## Features

- User authentication (signup, login, logout)
- Driver registration and profile management
- Trip creation with fare calculation and seat allocation
- Trip search and filtering by location
- Real-time trip tracking via WebSocket
- Live location updates for drivers
- Ride request management
- Rating system for users and drivers
- Map view of trips and live locations

## Project Structure

```
app/              - Next.js pages and layouts
components/       - React components
store/            - Zustand stores
actions/          - Server actions and API calls
backend/          - Go server code
db/               - Database schema and initialization
utils/            - Helper functions
hooks/            - React hooks
```

## Setup

### Frontend
```bash
npm install
npm run dev
```

Runs on http://localhost:3000

### Backend
```bash
cd backend
go run main.go
```

Ensure PostgreSQL is running with PostGIS extension installed.

## Database

The schema uses PostgreSQL with PostGIS for spatial indexing:
- Users, Drivers, Trips (trip creation and management)
- Routes (geometric representations of trip paths)
- Ride Requests (passenger booking information)
- Trip Stops (multi-point routes)
- Spatial indexes on geographic data for efficient querying

Initialize database:
```bash
psql -U postgres -d yatra < db/schema.sql
```

## Environment Variables

Create `.env` files in both frontend and backend directories with necessary configuration for database connection, JWT secret, and API endpoints.
