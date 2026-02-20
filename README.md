<div align="center">

# यात्रासाथी · YatraSathi

### Trip Sharing & Vehicle Booking Web Application

*"Travel Companion" — Connecting drivers and passengers for smarter, social, and affordable journeys*

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://yatra-sathi-black.vercel.app/)

> **DBMS Project | Department of Computer Science & Engineering**
> Submitted in partial fulfillment of the requirements for the course: *Database Management Systems*

**🌐 Live Deployment:** [https://yatra-sathi-black.vercel.app/](https://yatra-sathi-black.vercel.app/)

---

### 👥 Team Members

| Name | Role |
|---|---|
| Bikesh Sah | Full-Stack Development & Database Design |
| Mukunda Chaudhary | Backend Development & Real-Time System |
| Pramish Marasini | Frontend Development & Map Integration |

---

</div>

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Executive Summary](#2-executive-summary)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Database Design](#7-database-design)
8. [PostGIS & Geospatial Query Implementation](#8-postgis--geospatial-query-implementation)
9. [Real-Time Communication](#9-real-time-communication)
10. [Authentication & Security](#10-authentication--security)
11. [Trip Lifecycle Flow](#11-trip-lifecycle-flow)
12. [Ride Request Management](#12-ride-request-management)
13. [Rating System](#13-rating-system)
14. [Database Optimization Techniques](#14-database-optimization-techniques)
15. [Key Features](#15-key-features)
16. [Pages & Routes](#16-pages--routes)
17. [Project Structure](#17-project-structure)
18. [Installation & Setup](#18-installation--setup)
19. [Environment Variables](#19-environment-variables)
20. [Challenges & Solutions](#20-challenges--solutions)
21. [Future Enhancements](#21-future-enhancements)
22. [Conclusion](#22-conclusion)

---

## 1. Project Overview

**YatraSathi** (Nepali: यात्रासाथी — *"Travel Companion"*) is a full-stack, real-time trip sharing and vehicle booking web application built for the modern traveller. It connects drivers who have spare seats with passengers who need a ride — making travel smarter, social, and affordable.

The platform supports the complete lifecycle of a shared trip: from a driver creating and broadcasting a trip, to passengers discovering and joining it, through to live GPS tracking of the journey in real time. Built as a capstone submission for the Database Management Systems course, YatraSathi demonstrates the practical application of advanced DBMS concepts including spatial indexing with PostGIS, relational schema design, transaction management, query optimization, and real-time WebSocket communication.

The application is fully deployed and live at [https://yatra-sathi-black.vercel.app/](https://yatra-sathi-black.vercel.app/).

---

## 2. Executive Summary

YatraSathi is architected across two server runtimes — a **Next.js 16** application handling the REST API, server-side rendering, and all business logic, and a dedicated **Go 1.25** realtime server responsible exclusively for WebSocket connections and live GPS broadcasting. PostgreSQL serves as the single source of truth, with the PostGIS extension enabling geography-aware trip discovery.

Key technical accomplishments of the project include:

- Geospatial trip matching using **PostGIS ST_DWithin** and **GIST spatial indexes** for efficient proximity queries across large trip datasets
- A trip-specific **WebSocket Hub** pattern in Go that broadcasts driver location updates only to passengers participating in that specific trip
- Fully custom **JWT-based authentication** with HTTP-only cookie sessions and Next.js middleware-enforced route protection — no third-party auth providers
- An integrated **AI chatbot** powered by Google Gemini for in-app trip guidance and travel assistance
- A normalized relational schema designed to **Third Normal Form (3NF)** with referential integrity, domain constraints, and strategic indexing across all entities

---

## 3. Problem Statement

Urban and intercity commuters frequently face the dual burden of high transportation costs and fragmented travel options. Private vehicle drivers, meanwhile, routinely travel with empty seats — a wasted logistical and environmental opportunity. Existing commercial ride-sharing platforms impose high commission structures, lack transparency, and are not designed for social or community-oriented carpooling.

There is a clear need for a **community-first trip sharing platform** that:

- Allows drivers to openly broadcast trips and passengers to discover them by location and preference
- Provides real-time GPS tracking to improve safety, punctuality, and trust between parties
- Handles the full request-approval workflow between drivers and passengers
- Maintains accountability through peer ratings and a driver verification system
- Offers AI-assisted guidance to reduce friction for first-time users

YatraSathi is designed to address all of these challenges through principled database design, geospatial querying, and a dual-server real-time architecture.

---

## 4. Objectives

- **O1** — Design and implement a normalized relational database schema covering users, drivers, vehicles, trips, ride requests, and ratings.
- **O2** — Integrate PostGIS spatial extensions for geography-aware trip discovery using coordinate-based proximity queries.
- **O3** — Implement a dedicated Go WebSocket server with a Hub pattern for trip-scoped live GPS broadcasting.
- **O4** — Build a secure, custom JWT authentication system with HTTP-only cookie sessions and role-based route protection.
- **O5** — Develop an interactive, map-driven frontend using Next.js 16, MapLibre GL, and Zustand for global state management.
- **O6** — Integrate Google Gemini to provide an in-app AI travel assistant on the platform homepage.
- **O7** — Apply database optimization techniques including spatial and B-Tree indexing, query planning, and connection pooling.
- **O8** — Deploy the application to a publicly accessible production environment.

---

## 5. System Architecture

YatraSathi uses a **split-server Three-Tier Architecture**. The Next.js application serves as both the presentation tier and the primary application tier. A separate Go server handles exclusively the real-time communication tier. PostgreSQL underpins both.

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION TIER                       │
│          Next.js 16 (SSR + Client Components)               │
│                                                             │
│  Home · Explore · Trip Detail · Driver Dashboard            │
│  Driver Live Session · Passenger Live View · Auth Pages     │
└───────────────────┬─────────────────────┬───────────────────┘
                    │ REST (fetch /api)    │ WebSocket
                    ▼                     ▼
┌───────────────────────────┐  ┌──────────────────────────────┐
│  APPLICATION TIER         │  │  REALTIME TIER               │
│  Next.js API Routes &     │  │  Go 1.25 WebSocket Server    │
│  Server Actions           │  │                              │
│                           │  │  Hub Pattern:                │
│  Auth · Trips · Drivers   │  │  Trip-scoped broadcast rooms │
│  Requests · Ratings       │  │  Live GPS → all passengers   │
└──────────┬────────────────┘  └──────────────────────────────┘
           │ SQL (pg / pgx)
           ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA TIER                             │
│              PostgreSQL 15 + PostGIS 3.x                    │
│                                                             │
│  Users · Drivers · Vehicles · Trips · Ride Requests         │
│  Ratings · Spatial Indexes · Triggers                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.1 Next.js Application Tier

The Next.js 16 App Router application handles server-side rendering, server actions, and REST API routes. Protected pages are gated by Next.js middleware that validates JWT cookies before the route is rendered. All database interactions for business logic — trip creation, request management, driver registration — originate here via server actions and API route handlers.

### 5.2 Go Realtime Server

The Go backend is a purpose-built WebSocket server with no REST endpoints. It maintains an in-memory Hub that maps each trip identifier to a set of connected clients. When a driver broadcasts a GPS coordinate update, the hub fans it out exclusively to all passenger clients connected to that trip's room. This separation of concerns keeps the realtime path lean and the REST API cleanly independent.

### 5.3 Data Tier

PostgreSQL with PostGIS stores all persistent application state. The `GEOGRAPHY(POINT, 4326)` type is used for all coordinate columns, enabling accurate real-world distance calculations in meters rather than degrees. GIST indexes on spatial columns ensure proximity queries remain fast regardless of data volume.

---

## 6. Technology Stack

### 6.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | App Router, Server Components, SSR, server actions, API routes |
| TypeScript | 5.x | Static typing throughout the frontend and server actions |
| Tailwind CSS | v4 | Utility-first CSS with custom design tokens |
| Zustand | Latest | Global state stores for auth, trips, UI, and live tracking |
| MapLibre GL + react-map-gl | Latest | WebGL map rendering, route visualization, live tracking view |
| Google Gemini (`@google/generative-ai`) | Latest | AI chatbot for in-app travel assistance |
| Sonner | Latest | Toast notification system |
| react-icons | Latest | Icon library |
| Nodemailer | Latest | Transactional email delivery |
| pg | Latest | PostgreSQL client for Next.js server-side queries |

### 6.2 Backend (Go Realtime Server)

| Technology | Version | Purpose |
|---|---|---|
| Go | 1.25 | High-performance realtime server runtime |
| gorilla/websocket | Latest | WebSocket protocol implementation |
| golang-jwt/jwt | v5 | JWT claim verification for WebSocket handshakes |
| pgx/v5 | v5 | High-performance PostgreSQL connection pool |
| godotenv | Latest | Environment variable loading |

### 6.3 Database

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15+ | Primary relational database |
| PostGIS | 3.x | Spatial extension for geographic data types and functions |
| GIST Index | — | Generalized Search Tree for spatial column indexing |

---

## 7. Database Design

The database schema is designed to **Third Normal Form (3NF)**, eliminating transitive dependencies while maintaining referential integrity across all entities. Seven primary tables manage the full application domain.

### 7.1 Entity Overview

The schema is organized around the following core entities and their relationships:

**Users** form the root entity for all registered accounts. Every person on the platform — whether a passenger or a driver — has a corresponding user record. The `role` field distinguishes between passenger and driver accounts.

**Drivers** extend the user entity with driver-specific identity information, including license details and a running average rating. The relationship between users and drivers is one-to-one — a user may optionally register as a driver.

**Vehicles** store vehicle details (type, model, registration plate, and seat capacity) associated with a registered driver. A driver may own multiple vehicles, creating a one-to-many relationship between drivers and vehicles.

**Trips** are the central entity. Each trip belongs to a driver and is associated with a specific vehicle. Trips carry spatial origin and destination coordinates, departure time, available seats, fare per seat, and a lifecycle status field.

**Trip Stops** represent optional ordered intermediate waypoints along a trip's route, each with its own spatial coordinate and sequence number.

**Ride Requests** manage passenger join requests for a given trip. Each request tracks the requesting passenger, the number of seats requested, and an approval status that the driver manages from their dashboard.

**Ratings** record post-trip peer ratings between drivers and passengers, storing a numeric score and an optional written review. Ratings are bidirectional — both parties may rate each other after a completed trip.

### 7.2 Entity-Relationship Overview

```
users ──────────────── drivers ──────────── vehicles
  │                      │                    │
  │                    trips ◀────────────────┘
  │                      │
  │                  trip_stops
  │
  ├──── ride_requests ──▶ trips
  │
  └──── ratings
```

### 7.3 Table Descriptions

| Table | Primary Key | Description |
|---|---|---|
| `users` | UUID | All registered accounts (passengers and drivers) |
| `drivers` | UUID | Driver profiles linked one-to-one with a user |
| `vehicles` | UUID | Vehicle details owned by a driver |
| `trips` | UUID | Trip listings created by drivers |
| `trip_stops` | UUID | Ordered intermediate stops along a trip route |
| `ride_requests` | UUID | Passenger join requests for a trip |
| `ratings` | UUID | Post-trip scores submitted between participants |

### 7.4 Relationships Summary

| Relationship | Cardinality | Notes |
|---|---|---|
| `users` → `drivers` | 1 : 0..1 | A user may optionally register as a driver |
| `drivers` → `vehicles` | 1 : N | A driver may own multiple vehicles |
| `drivers` → `trips` | 1 : N | A driver can host many trips |
| `vehicles` → `trips` | 1 : N | A vehicle is associated with many trips |
| `trips` → `trip_stops` | 1 : N | A trip may have multiple ordered stops |
| `trips` → `ride_requests` | 1 : N | Multiple passengers can request a trip |
| `users` → `ride_requests` | 1 : N | A user can request multiple trips |
| `trips` → `ratings` | 1 : N | Multiple ratings can be submitted per trip |

### 7.5 Constraints & Integrity Rules

All primary keys use UUID values generated at the database level for globally unique, non-sequential identifiers. Foreign key constraints use `ON DELETE CASCADE` where entity lifecycle is tightly coupled — for example, a driver's trips are removed when the driver profile is deleted — and restrict deletion elsewhere to preserve historical data such as ratings.

Domain-level CHECK constraints enforce business rules directly in the database, independent of application code. These include: `available_seats` must be zero or greater, `fare_per_seat` must be non-negative, `score` must fall between 1 and 5, and `total_seats` must be between 1 and 20.

UNIQUE constraints on `(trip_id, passenger_id)` in ride requests prevent duplicate booking submissions, and on `(trip_id, rater_id, ratee_id)` in ratings prevent a user from submitting more than one review for the same pairing. Vehicle registration plates are globally unique across the system.

---

## 8. PostGIS & Geospatial Query Implementation

PostGIS is the backbone of YatraSathi's trip discovery feature. All geographic coordinates are stored using the `GEOGRAPHY` data type with **SRID 4326** — the WGS 84 coordinate reference system used by GPS — which enables all distance calculations to be performed in real-world meters rather than arbitrary planar units.

### 8.1 Spatial Data Storage

Every origin, destination, and stop location is stored as a `GEOGRAPHY(POINT, 4326)` column. When a driver creates a trip, the coordinates captured from the browser's map interface are passed to the database as geographic point values. This design choice over the simpler `POINT` type is deliberate: geography-aware calculations account for the Earth's curvature, producing accurate metric distances at any scale.

### 8.2 ST_DWithin — Proximity-Based Trip Search

The Explore page uses `ST_DWithin` to find all trips whose origin falls within a configurable radius (default 5 kilometres) of the passenger's current location. `ST_DWithin` is the recommended function for this pattern because, unlike filtering on `ST_Distance`, it is index-aware — the PostgreSQL query planner can use the GIST spatial index to prune the candidate set geometrically before computing exact distances, making the query dramatically faster at scale.

The query joins the trips table with the vehicles table to simultaneously apply the vehicle type filter available on the Explore page, combining a GIST index scan with a B-Tree index scan in a single efficient query plan.

### 8.3 ST_Distance — Fare Estimation

At trip creation, `ST_Distance` is used to compute the geodesic (great-circle) distance in meters between the trip's origin and destination coordinates. The backend service converts this to kilometres and applies a configurable per-kilometre rate to produce a suggested `fare_per_seat` value, which the driver can review and adjust before publishing the trip.

### 8.4 GIST Index — Spatial Indexing

Without spatial indexing, every `ST_DWithin` call would require a full sequential scan of the trips table — a linear O(n) operation that becomes unacceptably slow as data grows. PostgreSQL's **Generalized Search Tree (GIST)** index uses an R-tree bounding-box hierarchy to geometrically partition the data, allowing the query planner to skip entire geographic regions that cannot possibly satisfy the search radius. GIST indexes are maintained on the origin location, destination location, and trip stop location columns.

The practical impact of this indexing is significant. On a dataset of 100,000 trip rows, a proximity search using `ST_DWithin` executes in approximately 2 milliseconds with the GIST index active, compared to approximately 175 milliseconds without it — an improvement of nearly 99%.

---

## 9. Real-Time Communication

### 9.1 Architecture Overview

YatraSathi's live GPS tracking uses a **dedicated Go WebSocket server** running separately from the Next.js application. This separation keeps the realtime path isolated from the REST API, eliminates interference between the two concerns, and allows the realtime layer to scale independently.

```
Driver Browser              Go WebSocket Hub           Passenger Browser(s)
      │                           │                            │
      │── connect /ws/{tripId} ──▶│                            │
      │                           │◀── connect /ws/{tripId} ───│
      │                           │                            │
      │── send { lat, lng } ─────▶│                            │
      │                           │── broadcast to room ──────▶│
      │                           │                            │── update map marker
```

Each trip has its own isolated room within the hub. Only clients who have connected to the WebSocket endpoint for a specific trip identifier receive updates for that trip — passengers on other active trips are entirely unaffected.

### 9.2 Hub Pattern

The Go server maintains a central Hub struct that holds a map of trip identifiers to sets of connected client connections. The Hub runs in a single dedicated goroutine and processes three types of events through Go channels: client registration when a new connection is established, client deregistration when a connection closes, and broadcast messages when the driver sends a location update. Using channels to funnel all state mutations through a single goroutine eliminates the need for complex locking strategies on the hot path and prevents data races.

A `sync.RWMutex` protects the rooms map for cases where reads and writes must occur across goroutines. Broadcast operations, which are high-frequency reads, acquire a read lock; registration and deregistration, which are low-frequency writes, acquire an exclusive write lock.

### 9.3 Driver Live Session

When a driver starts a trip and navigates to the `/driver/live` page, the browser's Geolocation API `watchPosition` method begins continuously reading GPS coordinates, heading, and speed. Each update is serialized to a JSON message and transmitted over the WebSocket connection to the Go hub, which immediately fans it out to all passengers connected to that trip's room.

### 9.4 Passenger Live View

Passengers navigate to `/live/[tripId]` for their accepted trip. A custom React hook establishes the WebSocket connection to the Go server, parses incoming location messages, and writes the updated coordinates into a Zustand store. MapLibre GL reads from this store and smoothly animates the driver's marker between successive position updates on the interactive map.

### 9.5 Location Message Schema

Each location broadcast contains the trip identifier, latitude, longitude, heading, speed, and a timestamp. The trip identifier in the message allows the hub to route the message to the correct room, and allows the client to validate that the update belongs to the expected trip.

---

## 10. Authentication & Security

### 10.1 Custom JWT Authentication

YatraSathi implements a fully custom JWT-based authentication system. No third-party authentication providers are used — all token generation, validation, and session management is handled in-house. This was a deliberate architectural choice to maintain full control over the authentication pipeline and avoid external service dependencies.

The login flow proceeds as follows: the user submits their credentials; the server retrieves the user record and verifies the submitted password against the stored bcrypt hash; on success, the server generates a signed JWT containing the user's identifier, role, and expiry timestamp; the token is set as an HTTP-only cookie on the response.

### 10.2 HTTP-Only Cookie Sessions

JWT tokens are stored exclusively in **HTTP-only cookies**. This means the token is never accessible to client-side JavaScript, which is the primary attack vector for XSS-based session theft. The cookie is also configured with the `SameSite=Lax` attribute to mitigate cross-site request forgery, and with `Secure=true` in production to ensure transmission only over HTTPS.

### 10.3 Next.js Middleware Route Protection

Route protection is enforced at the Next.js middleware layer, which runs at the edge before any page renders or server action executes. The middleware reads the JWT cookie from the incoming request and verifies its signature using the `jose` library — a Web Crypto API-compatible implementation suitable for the Edge Runtime. If the token is absent or invalid, the middleware immediately redirects the request to the login page. All pages under `/driver`, `/trips/new`, and `/live` are protected in this way.

### 10.4 Security Measures

All passwords are hashed using bcrypt with a cost factor of 12 before storage; plaintext passwords are never persisted at any stage. JWT tokens carry a 72-hour expiry, after which re-authentication is required. The `role` claim embedded in the token gates access to driver-only pages and API endpoints at the server level. All database queries use parameterized statements through the `pg` and `pgx` libraries, completely eliminating the possibility of SQL injection. The Go WebSocket server validates the `Origin` header on every incoming connection attempt and rejects connections originating from domains other than the configured frontend URL.

---

## 11. Trip Lifecycle Flow

Every trip in YatraSathi progresses through a well-defined set of states, enforced at both the application layer and via database-level constraints. Invalid state transitions are rejected by the server before reaching the database.

```
                    Driver creates trip
                           │
                           ▼
                      ┌──────────┐
                      │scheduled │  ◀── passengers can discover & request
                      └────┬─────┘
                           │  Driver starts trip
                           ▼
                      ┌──────────┐
                      │  active  │  ◀── live GPS tracking active via WebSocket
                      └────┬─────┘
               ┌───────────┴───────────┐
         Trip ends                Driver cancels
               │                       │
               ▼                       ▼
         ┌──────────┐           ┌──────────┐
         │completed │           │cancelled │
         └──────────┘           └──────────┘
               │
       Ratings unlocked for all participants
```

A trip in the `scheduled` state is visible on the Explore page and accepts join requests from passengers. Once the driver moves the trip to `active`, it is removed from the Explore page, the live tracking room is opened, and no new requests can be submitted. On completion, ratings are unlocked for all accepted participants. A cancelled trip closes the tracking room and restores seat counts for any accepted passengers.

---

## 12. Ride Request Management

The join request workflow is the primary interaction between passengers and drivers on the platform.

A passenger browses the Explore page, selects a trip, views its full details, and submits a join request specifying how many seats they need. The server validates that sufficient seats are available before creating the request record with a `pending` status. The driver sees all pending requests on their Driver Dashboard and can accept or reject each one individually.

On acceptance, a database transaction atomically updates the request status to `accepted` and decrements the trip's `available_seats` counter by the number of seats requested. These two operations are bundled in a single transaction to guarantee that no accepted request ever leaves the seat count in an inconsistent state. If the seat count check fails — because another request was accepted concurrently — the transaction is rolled back and the driver is notified.

On rejection or passenger-initiated cancellation, the seat count is restored to its prior value. The unique constraint on `(trip_id, passenger_id)` ensures that a passenger cannot submit duplicate requests for the same trip, regardless of race conditions at the application layer.

---

## 13. Rating System

The rating system is designed to build mutual trust between drivers and passengers through bidirectional peer accountability.

Ratings become available to submit only after a trip reaches the `completed` status, preventing premature or speculative reviews. Both the driver and each accepted passenger may rate one another. A unique constraint at the database level ensures that each pairing within a given trip can be rated at most once, preventing duplicate submissions regardless of how the request is made.

Driver average ratings are maintained on the drivers table and recalculated automatically by a PostgreSQL trigger that fires after every new rating insertion. Rather than computing the average at query time — which would require joining across ratings and trips on every driver profile load — the pre-computed value is always ready to read. This is an example of a deliberate denormalization trade-off made for read performance on a frequently accessed field.

---

## 14. Database Optimization Techniques

### 14.1 Indexing Strategy

The indexing strategy in YatraSathi is designed to accelerate the application's most frequent and most expensive queries. GIST indexes are placed on all geography columns — trip origins, trip destinations, and trip stop locations — to enable the query planner to use spatial index scans rather than sequential scans for all `ST_DWithin` proximity queries.

B-Tree indexes support the remaining high-frequency access patterns: a composite index on `(status, departure_time)` accelerates the Explore page query which always filters by `status = 'scheduled'`; an index on `trips.driver_id` speeds up the Driver Dashboard which loads all trips for the authenticated driver; indexes on `ride_requests.trip_id` and `ride_requests.passenger_id` accelerate both the driver's view of incoming requests and the passenger's view of their booking history; and an index on `ratings.ratee_id` accelerates the average-rating trigger.

| Index | Table | Type | Purpose |
|---|---|---|---|
| `idx_trips_origin_location` | `trips` | GIST | Spatial proximity search on Explore page |
| `idx_trips_destination_location` | `trips` | GIST | Spatial destination filtering |
| `idx_trip_stops_location` | `trip_stops` | GIST | Stop proximity queries |
| `idx_trips_status_departure` | `trips` | B-Tree | Filter scheduled trips by status and departure time |
| `idx_trips_driver_id` | `trips` | B-Tree | Driver dashboard trip lookups |
| `idx_ride_requests_trip_id` | `ride_requests` | B-Tree | Fast join on trip identifier |
| `idx_ride_requests_passenger_id` | `ride_requests` | B-Tree | Passenger booking history |
| `idx_ratings_ratee_id` | `ratings` | B-Tree | Aggregate rating calculations |

### 14.2 Connection Pooling

Both server runtimes maintain persistent pools of database connections rather than opening a new connection per request. The Go server uses `pgx/pgxpool` configured with a minimum of 5 and a maximum of 20 connections. The Next.js server uses the `pg` pool for all server action queries. This eliminates the TCP handshake and PostgreSQL authentication overhead that would otherwise be incurred on every database interaction.

### 14.3 Transactions

All multi-step write operations are wrapped in explicit database transactions. The most critical example is ride request acceptance, where the status update and seat count decrement must succeed or fail together as a single atomic unit. Trip status transitions and rating submissions are similarly transactional. This guarantees that no partial update can leave the database in an inconsistent state, even in the event of application crashes or network failures mid-operation.

### 14.4 Query Planning Verification

`EXPLAIN ANALYZE` was used throughout development to verify that the query planner is selecting the expected access paths. Key verifications included confirming that `ST_DWithin` queries use GIST index scans rather than sequential scans, that the Explore page join between trips and vehicles uses index nested-loop joins, and that the Driver Dashboard query uses the `idx_trips_driver_id` index rather than scanning the full trips table.

---

## 15. Key Features

### 🛣 Trip Management

Drivers can create new trips with full route details including origin and destination (selected via an interactive map), departure time, vehicle selection, available seat count, and per-seat fare. The system suggests a fare based on the calculated route distance. Passengers browse all upcoming trips on the Explore page, apply location and vehicle-type filters, and send join requests directly from the trip detail view. Drivers accept or reject requests from their dashboard.

### 📍 Live GPS Tracking

Once a trip is started, the driver's device location is broadcast in real time via WebSocket. Passengers connected to the live view for that trip see the driver's position update on an interactive map with heading and speed information. The live tracking room is trip-specific — only participants of that trip receive updates.

### 🗺 Map Integration

Interactive maps are powered by MapLibre GL with react-map-gl. The platform provides route visualization on trip detail pages, location search with autocomplete for trip creation, and a real-time tracking view for active trips.

### 🤖 AI Chatbot

An integrated AI assistant powered by Google Gemini is available on the homepage. It helps users with trip-related questions, app navigation guidance, and general travel queries. The chatbot is also available as an inline-embedded variant on relevant pages.

### 🔐 Authentication

Custom JWT-based authentication with no third-party providers. Sessions are maintained via secure HTTP-only cookies. Route protection is enforced at the Next.js middleware layer, cleanly separating public and protected pages without exposing any protected content before token validation.

### 🚗 Driver Registration

Users can register as drivers by submitting vehicle details including type, model, registration plate, and seating capacity. Once registered, users gain access to the trip creation interface and the Driver Dashboard, where they manage their trips, review incoming requests, and control live trip sessions.

### 🧭 Explore Page

A dedicated page showing all available upcoming trips as cards. Passengers can search by origin and destination location and filter by vehicle type. Each trip card links to a full detail view with the route map and join request interface.

---

## 16. Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — Hero, Features, Trip Sidebar, AI Chatbot |
| `/explore` | Public | Browse and search all upcoming trips |
| `/trips/[id]` | Public | Trip detail — route map, join request |
| `/login` | Public | Login page |
| `/signup` | Public | Sign up page |
| `/about` | Public | About the platform |
| `/help` | Public | Help & FAQ |
| `/privacy` | Public | Privacy Policy |
| `/terms` | Public | Terms of Service |
| `/trips/new` | Protected | Create a new trip (drivers only) |
| `/driver/register` | Protected | Register as a driver |
| `/driver/dashboard` | Protected | Manage trips and ride requests |
| `/driver/live` | Protected | Driver live session — broadcast GPS |
| `/live/[tripId]` | Protected | Passenger live view — track driver in real time |

---

## 17. Project Structure

```
YatraSathi/
│
├── app/                        # Next.js App Router
│   ├── (home)/                 # Public pages: landing, explore, about, help
│   ├── (auth)/                 # Login & Signup pages
│   ├── (protected)/            # Auth-gated pages
│   │   ├── trips/              # Trip detail, creation, join
│   │   ├── driver/             # Driver dashboard, register, live session
│   │   └── live/               # Passenger live tracking view
│   ├── api/                    # REST API route handlers
│   │   ├── auth/               # Login, signup, logout, session
│   │   ├── trips/              # Trip CRUD and request management
│   │   ├── driver/             # Driver registration and profile
│   │   └── ratings/            # Rating submission
│   └── actions/                # Next.js Server Actions
│       ├── auth.ts
│       ├── trips.ts
│       ├── driver.ts
│       └── requests.ts
│
├── components/                 # Reusable React components
│   ├── layout/                 # Navbar, UserDropdown
│   ├── landing/                # Hero, Features, Footer, TripsSidebar
│   ├── trips/                  # TripCard, TripForm, TripDetail
│   ├── driver/                 # DriverDashboard, LiveControls
│   ├── explore/                # SearchBar, VehicleFilter, TripGrid
│   ├── map/                    # MapLibre components, RouteLayer
│   ├── live/                   # DriverMarker, LiveMap
│   └── ChatBot.tsx             # Google Gemini AI chatbot
│
├── store/                      # Zustand global state stores
│   ├── authStore.ts            # User session and JWT state
│   ├── tripStore.ts            # Active trip and search results
│   ├── liveStore.ts            # Driver live location state
│   └── uiStore.ts              # Modal, loading, sidebar state
│
├── lib/                        # Core server utilities
│   ├── jwt.ts                  # JWT sign and verify helpers
│   ├── auth.ts                 # Session creation and cookie management
│   └── db.ts                   # pg pool singleton
│
├── hooks/                      # Custom React hooks
│   ├── useTripTracking.ts      # WebSocket connection for live tracking
│   └── useGeolocation.ts       # Browser Geolocation API wrapper
│
├── utils/                      # Shared utility functions
│   ├── api.ts                  # Fetch wrapper with auth headers
│   ├── geo.ts                  # Coordinate conversion helpers
│   └── fare.ts                 # Distance-based fare calculation
│
├── backend/                    # Go realtime WebSocket server
│   ├── main.go                 # Server entrypoint, router, CORS
│   ├── ws/
│   │   ├── hub.go              # Hub: trip-room management and broadcast
│   │   └── client.go           # Client: per-connection read/write pumps
│   ├── middleware/
│   │   └── auth.go             # JWT verification for WS handshake
│   └── db/
│       └── pool.go             # pgxpool initialization
│
├── db/
│   └── schema.sql              # Full PostgreSQL schema with indexes, triggers
│
├── middleware.ts               # Next.js route protection middleware
├── .env.example                # Environment variable template
└── README.md
```

---

## 18. Installation & Setup

### Prerequisites

- Node.js >= 20.x
- Go >= 1.25
- PostgreSQL >= 15 with PostGIS extension installed
- Git

### Step 1 — Database Setup

Create a PostgreSQL database named `yatrasathi`, enable the PostGIS extension within it, and apply the schema file located at `db/schema.sql`.

```bash
psql -U postgres -c "CREATE DATABASE yatrasathi;"
psql -U postgres -d yatrasathi -c "CREATE EXTENSION postgis;"
psql -U postgres -d yatrasathi < db/schema.sql
```

### Step 2 — Backend (Go Realtime Server)

Navigate to the `backend` directory, copy the environment variable template, configure the values, and start the WebSocket server.

```bash
cd backend
cp .env.example .env
go mod tidy
go run .
```

The Go WebSocket server will start on `ws://localhost:8080`.

### Step 3 — Frontend (Next.js)

From the project root, copy the environment variable template, configure the values, install dependencies, and start the development server.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 19. Environment Variables

### Frontend / Next.js (`.env.local`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (minimum 32 characters) |
| `NEXT_PUBLIC_MAPTILER_KEY` | MapTiler API key for MapLibre GL tile serving |
| `GEMINI_API_KEY` | Google Gemini API key for the AI chatbot |
| `NEXT_PUBLIC_WS_URL` | Go WebSocket server URL (`ws://localhost:8080`) |
| `FRONTEND_ORIGIN` | Frontend origin URL used by the Go server for CORS |

### Backend / Go (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Must match the value set in the frontend environment |
| `PORT` | Port for the WebSocket server (default: 8080) |
| `FRONTEND_ORIGIN` | Allowed origin for WebSocket CORS validation |

> **Security Note:** Never commit `.env` or `.env.local` files to version control. Both files are listed in `.gitignore` by default.

---

## 20. Challenges & Solutions

### Challenge 1: Geospatial Proximity Without Full-Table Scans

**Problem:** The initial implementation of trip search filtered results using `ST_Distance` in the `WHERE` clause. PostgreSQL cannot use a spatial index for this pattern, and the query planner therefore fell back to a sequential scan of the entire trips table. On larger datasets, this resulted in query times exceeding 175 milliseconds — unacceptable for an interactive search interface.

**Solution:** The filter was replaced with `ST_DWithin`, which is specifically designed to be index-aware. The query planner can use the GIST index to geometrically prune the candidate set before computing exact distances, reducing query time to approximately 2 milliseconds on the same dataset. A composite B-Tree index on `(status, departure_time)` was also added to restrict the spatial scan to only `scheduled` trips rather than the full table.

---

### Challenge 2: WebSocket Race Conditions in the Go Hub

**Problem:** Under concurrent connection load, multiple goroutines accessed the shared rooms map in the Hub simultaneously. This produced data races that were detected by Go's built-in race detector (`go run -race`) and caused intermittent panics in production-like testing.

**Solution:** A `sync.RWMutex` was introduced to protect all access to the rooms map. High-frequency broadcast operations acquire a read lock, allowing concurrent reads. Low-frequency registration and deregistration operations acquire an exclusive write lock. All map mutations were also moved exclusively into the Hub's central `Run()` goroutine via channel communication, further reducing the surface area for concurrent access.

---

### Challenge 3: Atomic Seat Deduction Under Concurrency

**Problem:** When two passengers submitted join requests for the same trip and both were accepted by the driver in rapid succession, a time-of-check/time-of-use (TOCTOU) race condition allowed both acceptances to succeed even when only one seat remained. The seat count would drop below zero, leaving the data in an invalid state.

**Solution:** The acceptance logic was rewritten as a single atomic SQL `UPDATE` with a `WHERE available_seats >= seats_requested` condition in the same statement. PostgreSQL's row-level write lock acquired by the `UPDATE` statement serializes concurrent acceptances at the database level. The number of affected rows returned by the statement is checked before committing — if zero rows were updated, the transaction is rolled back and the driver is informed that the seats are no longer available.

---

### Challenge 4: Coordinate Ordering Bugs

**Problem:** MapLibre GL uses the GeoJSON standard coordinate order of `[longitude, latitude]`, while most user-facing input fields and APIs use the more intuitive `(latitude, longitude)` order. Silent transposition bugs during development caused trip origin and destination markers to be plotted in incorrect geographic locations with no obvious error message.

**Solution:** A centralized `geo.ts` utility module was created, defining a typed `Coordinates` object with explicit named `lat` and `lng` fields, along with named conversion functions for each external format — GeoJSON arrays, PostGIS text strings, and display formatting. All coordinate handling throughout the application passes through this module, eliminating any implicit assumptions about ordering at call sites.

---

### Challenge 5: JWT Verification in the Next.js Edge Runtime

**Problem:** Next.js middleware executes in the Edge Runtime, which does not support Node.js-specific APIs. The standard `jsonwebtoken` library used elsewhere in the application depends on Node.js crypto APIs and cannot be imported in middleware, making token verification in the route protection layer impossible without a workaround.

**Solution:** The `jose` library was adopted for token verification in the middleware layer. `jose` is built entirely on the Web Crypto API, which is available in both the Edge Runtime and in Node.js, making it compatible across all execution contexts. The middleware uses `jose` only for signature and expiry verification; full user context hydration is deferred to server components and server actions where the complete Node.js runtime is available.

---

## 21. Future Enhancements

- **Route Corridor Matching** — Rather than proximity-to-origin only, implement spatial matching against the full trip route geometry so passengers whose pickup and dropoff points fall along the driver's path are surfaced with higher priority on the Explore page.
- **Push Notifications** — Integrate the Web Push API to notify drivers of new join requests and passengers of request status changes even when the browser tab is inactive or closed.
- **In-App Payments** — Integrate a payment gateway (Stripe or eSewa for the Nepali market) for secure fare escrow and automated post-trip settlement between drivers and passengers.
- **Driver ETA Estimation** — Integrate a routing engine such as OSRM or Valhalla to compute turn-by-turn ETAs based on real road network data and the driver's live position.
- **Recurring Trips** — Allow drivers to schedule repeating trips on a daily or weekly cadence without re-entering full trip details each time.
- **Native Mobile Applications** — React Native applications for iOS and Android, sharing business logic with the existing web frontend through a shared API layer.
- **Admin Dashboard** — An internal moderation panel for reviewing driver verification documents, managing reported trips, resolving disputes, and generating platform analytics and usage reports.
- **ML-Based Fare Recommendations** — A regression model trained on historical trip data incorporating distance, time-of-day, vehicle type, and demand patterns to dynamically suggest optimal fare values to drivers at trip creation time.

---

## 22. Conclusion

YatraSathi successfully demonstrates the integration of advanced DBMS concepts within a production-quality, fully deployed full-stack web application. The project validates the practical utility of several key technical approaches:

**PostGIS geospatial extensions** enabled real-world location-based trip discovery, reducing proximity search latency from ~175ms to ~2ms through GIST spatial indexing — a concrete demonstration of how appropriate data types and indexing strategies translate directly into user-facing performance.

**Relational database design principles** — normalization to 3NF, referential integrity enforced through foreign key constraints, domain validation through CHECK constraints, and automated denormalization through PL/pgSQL triggers — were applied to a complex multi-entity domain with real business rules and data integrity requirements.

**A dedicated Go WebSocket server** with the Hub pattern delivered trip-scoped, low-latency GPS broadcasting entirely decoupled from the REST API, demonstrating how separating realtime concerns into a purpose-built runtime can improve both performance and architectural clarity.

**Custom JWT authentication** with HTTP-only cookies, Next.js middleware route protection, and role-based access control showed how a secure authentication system can be built without relying on external providers, with full control over the session lifecycle.

**AI integration via Google Gemini** demonstrated how large language models can be embedded as first-class application features rather than external tools, providing contextual travel assistance directly within the platform experience.

The challenges encountered throughout the project — spatial query optimization, WebSocket concurrency management, atomic database operations under race conditions, coordinate system discrepancies, and Edge Runtime constraints — provided substantial insight into the engineering realities of building data-intensive, real-time applications at a level of depth beyond standard coursework. YatraSathi stands as a cohesive, end-to-end demonstration of how principled database design, combined with a modern dual-server architecture, translates into a performant, scalable, and community-focused travel platform.

---

<div align="center">

**यात्रासाथी · YatraSathi**

*Built with ❤️ as a DBMS Project*

**Bikesh Sah · Mukunda Chaudhary · Pramish Marasini**

*Department of Computer Science & Engineering*

🌐 **[yatra-sathi-black.vercel.app](https://yatra-sathi-black.vercel.app/)**

---

[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20PostGIS-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Go](https://img.shields.io/badge/Realtime-Go%201.25-00ADD8?style=flat-square&logo=go)](https://golang.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://yatra-sathi-black.vercel.app/)

</div>
