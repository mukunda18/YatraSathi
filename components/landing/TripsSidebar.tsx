"use client";

import UserRidesList from "./UserRidesList";
import DriverRidesList from "./DriverRidesList";

export default function TripsSidebar() {
    return (
        <aside className="w-80 shrink-0 sticky top-28 space-y-8">
            <UserRidesList />
            <DriverRidesList />
        </aside>
    );
}
