import { validateSession } from "@/app/actions/authActions";
import { getTripViewAction } from "@/app/actions/tripActions";
import { notFound, redirect } from "next/navigation";
import LiveTripClient from "@/components/live/LiveTripClient";

interface LiveTripPageProps {
    params: Promise<{ tripId: string }>;
}

export default async function LiveTripPage({ params }: LiveTripPageProps) {
    const { tripId } = await params;
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    const result = await getTripViewAction(tripId);

    if (!result.success || !result.trip) {
        notFound();
    }

    const trip = result.trip;
    const isDriver = trip.driver_user_id === user.id;

    const isPassenger = trip.riders?.some((r: any) => r.rider_id === user.id && (r.status === 'waiting' || r.status === 'onboard' || r.status === 'dropedoff'));

    if (!isDriver && !isPassenger) {
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
