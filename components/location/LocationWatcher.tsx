"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

export default function LocationWatcher() {
    const { setLocation, setError, setTracking } = useLocationStore();

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setTracking(true);

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp,
                });
            },
            (error) => {
                let errorMessage = "An unknown error occurred";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "The request to get user location timed out.";
                        break;
                }
                setError(errorMessage);
                setTracking(false);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
            setTracking(false);
        };
    }, [setLocation, setError, setTracking]);

    return null;
}
