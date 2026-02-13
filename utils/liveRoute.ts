export type RoutePoint = [number, number];

interface DriverPosition {
    lat: number;
    lng: number;
}

interface SplitRouteResult {
    completedRoute: RoutePoint[];
    remainingRoute: RoutePoint[];
    progressPercent: number;
    completedDistanceKm: number;
    remainingDistanceKm: number;
    totalDistanceKm: number;
}

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceKm = (a: RoutePoint, b: RoutePoint): number => {
    const earthRadiusKm = 6371;
    const dLat = toRadians(b[1] - a[1]);
    const dLng = toRadians(b[0] - a[0]);
    const lat1 = toRadians(a[1]);
    const lat2 = toRadians(b[1]);

    const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

    return earthRadiusKm * y;
};

const getNearestRouteIndex = (route: RoutePoint[], driverPosition: DriverPosition): number => {
    if (route.length === 0) return -1;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < route.length; i++) {
        const [lng, lat] = route[i];
        const dLng = lng - driverPosition.lng;
        const dLat = lat - driverPosition.lat;
        const d2 = dLng * dLng + dLat * dLat;

        if (d2 < bestDistance) {
            bestDistance = d2;
            bestIndex = i;
        }
    }

    return bestIndex;
};

export const calculateRouteDistanceKm = (route: RoutePoint[]): number => {
    if (!route || route.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < route.length; i++) {
        total += distanceKm(route[i - 1], route[i]);
    }

    return total;
};

export const splitRouteByDriverPosition = (
    route: RoutePoint[],
    driverPosition: DriverPosition | null
): SplitRouteResult => {
    const totalDistanceKm = calculateRouteDistanceKm(route);

    if (!driverPosition || route.length < 2) {
        return {
            completedRoute: [],
            remainingRoute: route || [],
            progressPercent: 0,
            completedDistanceKm: 0,
            remainingDistanceKm: totalDistanceKm,
            totalDistanceKm,
        };
    }

    const nearestIndex = getNearestRouteIndex(route, driverPosition);
    if (nearestIndex < 0) {
        return {
            completedRoute: [],
            remainingRoute: route,
            progressPercent: 0,
            completedDistanceKm: 0,
            remainingDistanceKm: totalDistanceKm,
            totalDistanceKm,
        };
    }

    const driverPoint: RoutePoint = [driverPosition.lng, driverPosition.lat];
    const completedRoute = [...route.slice(0, nearestIndex + 1), driverPoint];
    const remainingRoute = [driverPoint, ...route.slice(nearestIndex + 1)];

    const completedDistanceKm = calculateRouteDistanceKm(completedRoute);
    const remainingDistanceKm = Math.max(0, totalDistanceKm - completedDistanceKm);
    const progressPercent = totalDistanceKm > 0
        ? Math.max(0, Math.min(100, (completedDistanceKm / totalDistanceKm) * 100))
        : 0;

    return {
        completedRoute,
        remainingRoute,
        progressPercent,
        completedDistanceKm,
        remainingDistanceKm,
        totalDistanceKm,
    };
};
