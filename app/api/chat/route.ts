import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserById, getJoinedTripsByRiderId, getDriverByUserId, getDriverTripsWithRequests } from "@/db/db";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function POST(req: Request) {
  // 1. Authenticate the user via the JWT cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("yatrasathi")?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = decoded.userId;
  } catch {
    return Response.json({ error: "Invalid session. Please log in again." }, { status: 401 });
  }

  // 2. Validate message
  const body = await req.json();
  const message = body.message;
  if (!message?.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    // 3. Fetch user and their ride data
    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 401 });
    }

    // Fetch rides as a passenger
    const joinedRides = await getJoinedTripsByRiderId(userId);

    // Fetch rides as a driver (if applicable)
    let driverTrips: Record<string, unknown>[] = [];
    if (user.is_driver) {
      const driverProfile = await getDriverByUserId(userId);
      if (driverProfile) {
        driverTrips = await getDriverTripsWithRequests(driverProfile.id);
      }
    }

    // 4. Build the user context string for the prompt
    let userContext = `User Profile:
- Name: ${user.name}
- Email: ${user.email}
- Account Type: ${user.is_driver ? "Passenger & Driver" : "Passenger"}
- Average Rating: ${user.avg_rating}
`;

    // Passenger rides context
    if (joinedRides.length === 0) {
      userContext += `\nRide History (as Passenger): No ride bookings found.\n`;
    } else {
      userContext += `\nRide History (as Passenger) — ${joinedRides.length} booking(s):\n`;
      joinedRides.forEach((ride, i) => {
        userContext += `
Booking #${i + 1}:
  - Request ID: ${ride.request_id}
  - Trip ID: ${ride.trip_id}
  - From: ${ride.from_address}
  - To: ${ride.to_address}
  - Travel Date: ${formatDate(ride.travel_date as Date)}
  - Trip Status: ${ride.trip_status}
  - Booking Status: ${ride.request_status}
  - Seats Booked: ${ride.requested_seats}
  - Pickup: ${ride.pickup_address}
  - Drop-off: ${ride.drop_address}
  - Total Fare: NPR ${ride.total_fare}
  - Driver Name: ${ride.driver_name}
  - Driver Rating: ${ride.driver_rating}
  - Vehicle: ${ride.vehicle_type} (${ride.vehicle_number})
`;
      });
    }

    // Driver trips context
    if (user.is_driver) {
      if (driverTrips.length === 0) {
        userContext += `\nTrips You Created (as Driver): No trips created yet.\n`;
      } else {
        userContext += `\nTrips You Created (as Driver) — ${driverTrips.length} trip(s):\n`;
        driverTrips.forEach((trip, i) => {
          const requests = (trip.ride_requests as Record<string, unknown>[]) || [];
          const approvedCount = requests.filter(
            (r) => r.status === "waiting" || r.status === "onboard"
          ).length;
          userContext += `
Trip #${i + 1}:
  - Trip ID: ${trip.trip_id}
  - From: ${trip.from_address}
  - To: ${trip.to_address}
  - Travel Date: ${formatDate(trip.travel_date as Date)}
  - Status: ${trip.trip_status}
  - Seats: ${trip.available_seats} available / ${trip.total_seats} total
  - Fare per Seat: NPR ${trip.fare_per_seat}
  - Active Riders: ${approvedCount}
  - Description: ${trip.description || "None"}
`;
          if (requests.length > 0) {
            requests.forEach((r, j) => {
              userContext += `    Rider #${j + 1}: ${r.rider_name} | ${r.pickup_address} → ${r.drop_address} | ${r.seats} seat(s) | Status: ${r.status}\n`;
            });
          }
        });
      }
    }

    // 5. Build prompts
    const SYSTEM_PROMPT = `You are YatraSathi Assistant — a helpful, friendly support bot for the YatraSathi bus booking platform.

Rules:
- ONLY help with YatraSathi-related topics: bookings, trips, ride status, cancellations, refunds, routes, payments, and account info.
- ONLY discuss the logged-in user's own data provided below. Never make up or guess data.
- If asked about something unrelated to YatraSathi, politely say you cannot help with that.
- If unsure, suggest contacting customer support.
- Be concise, clear, and friendly.
- Do NOT give legal or financial advice.

YatraSathi Platform Info:
- Online ride-sharing platform in Nepal
- Cancellation allowed up to 6 hours before departure
- Refund processed within 3-5 business days
- Payment methods: eSewa, Khalti, Debit/Credit Card
- Support hours: 9 AM - 6 PM (Nepal Standard Time)
- Ride request statuses: waiting (pending approval), onboard (trip started), dropedoff (completed), cancelled
- Trip statuses: scheduled, ongoing, completed, cancelled
`;

    const prompt = `${SYSTEM_PROMPT}

=== LOGGED-IN USER DATA ===
${userContext}
=== END OF USER DATA ===

User's question: ${message}

Please answer based on the user's actual data above.`;

    // 6. Call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Service temporarily unavailable." }, { status: 500 });
  }
}
