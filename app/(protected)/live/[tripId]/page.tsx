import { validateSession } from "@/app/actions/authActions";
import { getLiveTripViewAction } from "@/app/actions/tripActions";
import { notFound, redirect } from "next/navigation";
import LiveTripClient from "@/components/live/LiveTripClient";
import { TripRider } from "@/store/types";

interface LiveTripPageProps {
    params: Promise<{ tripId: string }>;
}

export default async function LiveTripPage({ params }: LiveTripPageProps) {
    const { tripId } = await params;
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    const result = await getLiveTripViewAction(tripId);

    if (!result.success || !result.trip) {
        notFound();
    }

    const trip = result.trip;
    const isDriver = trip.driver_user_id === user.id;

    const isPassenger = trip.riders?.some((r: TripRider) => r.rider_id === user.id && (r.status === "waiting" || r.status === "onboard" || r.status === "dropedoff"));

    if (!isDriver && !isPassenger) {
        redirect(`/trips/${tripId}`);
    }

    const hasLiveTripInfo = Boolean(
        trip.route_geometry &&
        trip.route_geometry.length > 1 &&
        trip.driver_current_lat != null &&
        trip.driver_current_lng != null
    );

    if (!hasLiveTripInfo) {
        redirect(`/trips/${tripId}`);
    }

    return (
        <main className="min-h-screen bg-slate-950">
            <LiveTripClient
                trip={trip}
            />
        </main>
    );
}
