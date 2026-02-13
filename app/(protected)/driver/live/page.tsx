import { validateSession } from "@/app/actions/authActions";
import { getDriverLiveTripAction } from "@/app/actions/driverActions";
import { redirect } from "next/navigation";
import LiveTripDriver from "@/components/live/LiveTripDriver";

export default async function LiveDriverPage() {
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    if (!user.isDriver) {
        redirect("/driver/register");
    }

    const result = await getDriverLiveTripAction();
    if (!result.success || !result.trip) {
        redirect("/driver/dashboard");
    }

    const hasLiveTripData = Boolean(
        result.trip.route_geometry &&
        result.trip.route_geometry.length > 1 &&
        result.trip.driver_current_lat != null &&
        result.trip.driver_current_lng != null
    );

    if (!hasLiveTripData) {
        redirect("/driver/dashboard");
    }

    return (
        <main className="min-h-screen bg-slate-950">
            <LiveTripDriver trip={result.trip} />
        </main>
    );
}
