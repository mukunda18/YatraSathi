import { validateSession } from "@/app/actions/authActions";
import { validateDriverLivePageAction } from "@/app/actions/driverActions";
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

    const hasLiveTrip = await validateDriverLivePageAction();
    if (!hasLiveTrip) {
        redirect("/driver/dashboard");
    }

    return (
        <main className="min-h-screen bg-slate-950">
            <LiveTripDriver />
        </main>
    );
}
