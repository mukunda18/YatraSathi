export type Coordinate = [number, number];

export const parseWKT = (wkt: string | undefined) => {
    if (!wkt) return null;
    const match = wkt.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (!match) return null;
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
};

export const parseLineStringGeoJSON = (value: unknown): Coordinate[] | null => {
    if (!value) return null;

    let geojson: { type?: unknown; coordinates?: unknown };
    if (typeof value === "string") {
        try {
            geojson = JSON.parse(value) as { type?: unknown; coordinates?: unknown };
        } catch {
            return null;
        }
    } else if (typeof value === "object") {
        geojson = value as { type?: unknown; coordinates?: unknown };
    } else {
        return null;
    }

    if (geojson.type !== "LineString" || !Array.isArray(geojson.coordinates)) {
        return null;
    }

    const coordinates = geojson.coordinates.filter(
        (point): point is Coordinate =>
            Array.isArray(point) &&
            point.length === 2 &&
            typeof point[0] === "number" &&
            typeof point[1] === "number"
    );

    return coordinates.length > 0 ? coordinates : null;
};

export const distanceMeters = (aLat: number, aLng: number, bLat: number, bLng: number): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadius = 6371000;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);

    const hav =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    return 2 * earthRadius * Math.asin(Math.sqrt(hav));
};
