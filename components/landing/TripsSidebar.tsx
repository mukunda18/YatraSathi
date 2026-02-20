"use client";

import UserRidesList from "./UserRidesList";
import DriverRidesList from "./DriverRidesList";

export default function TripsSidebar() {
    return (
        <div className="space-y-8">
            <UserRidesList />
            <DriverRidesList />
        </div>
    );
}
