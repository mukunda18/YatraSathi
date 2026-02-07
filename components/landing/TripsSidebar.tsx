"use client";

import { useUserRidesStore } from "@/store/userRidesStore";
import { useAuthStore } from "@/store/authStore";
import { useDriverRidesStore } from "@/store/driverRidesStore";
import { useEffect } from "react";
import TripsSidebarSkeleton from "../skeletons/TripsSidebarSkeleton";
import UserRidesList from "./UserRidesList";
import DriverRidesList from "./DriverRidesList";

export default function TripsSidebar() {
    const { trips: userTrips, isLoading: userLoading, fetchTrips: fetchUserTrips } = useUserRidesStore();
    const { trips: driverTrips, isLoading: driverLoading, fetchTrips: fetchDriverTrips } = useDriverRidesStore();
    const { isDriver } = useAuthStore();

    useEffect(() => {
        fetchUserTrips();
        if (isDriver) {
            fetchDriverTrips();
        }
    }, [fetchUserTrips, fetchDriverTrips, isDriver]);

    const isLoading = userLoading || driverLoading;

    if (isLoading && userTrips.length === 0 && driverTrips.length === 0) {
        return <TripsSidebarSkeleton />;
    }

    return (
        <aside className="w-80 shrink-0 sticky top-28 space-y-8">
            <UserRidesList />
            <DriverRidesList />
        </aside>
    );
}
