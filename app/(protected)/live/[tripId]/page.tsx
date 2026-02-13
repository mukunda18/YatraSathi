import { validateSession } from "@/app/actions/authActions";
import { validateTripLivePageAction } from "@/app/actions/tripActions";
import { redirect } from "next/navigation";
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

    const hasLiveTrip = await validateTripLivePageAction(tripId);
    if (!hasLiveTrip) {
        redirect(`/trips/${tripId}`);
    }

    return (
        <main className="min-h-screen bg-slate-950">
            <LiveTripClient tripId={tripId} viewerUserId={user.id} />
        </main>
    );
}
