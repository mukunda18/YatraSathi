import { validateSession } from "@/app/actions/authActions";
import { getTripViewAction } from "@/app/actions/tripActions";
import { notFound, redirect } from "next/navigation";
import TripView from "@/components/trips/TripView";

interface TripPageProps {
    params: Promise<{ id: string }>;
}

export default async function TripViewPage({ params }: TripPageProps) {
    const { id } = await params;
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    const result = await getTripViewAction(id);

    if (!result.success || !result.trip) {
        notFound();
    }

    const trip = result.trip;

    return (
        <main className="min-h-screen bg-slate-950">
            <TripView
                initialTrip={trip}
                isDriver={trip.driver_user_id === user.id}
            />
        </main>
    );
}
