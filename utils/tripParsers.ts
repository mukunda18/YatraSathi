import { LiveDriverTripData, TripSearchResult, TripViewData } from "@/store/types";
import { Coordinate, parseLineStringGeoJSON } from "@/utils/geo";

type RouteGeoRecord = Record<string, unknown> & {
    route_geojson?: unknown;
};

const withoutRouteGeoJSON = (row: RouteGeoRecord): Record<string, unknown> => {
    const rest = { ...row };
    delete rest.route_geojson;
    return rest;
};

export const splitRouteGeometry = (
    row: RouteGeoRecord,
    source?: string
): { route_geometry: Coordinate[] | null; rest: Record<string, unknown> } => {
    const route_geometry = parseLineStringGeoJSON(row.route_geojson);
    if (!route_geometry && row.route_geojson != null && source) {
        console.error(`Error parsing route GeoJSON in ${source}`);
    }
    return {
        route_geometry,
        rest: withoutRouteGeoJSON(row),
    };
};

export const toTripSearchResult = (row: RouteGeoRecord, source?: string): TripSearchResult => {
    const { route_geometry, rest } = splitRouteGeometry(row, source);
    return {
        ...(rest as unknown as TripSearchResult),
        route_geometry: route_geometry || [],
    };
};

export const toTripViewData = (row: RouteGeoRecord, source?: string): TripViewData => {
    const { route_geometry, rest } = splitRouteGeometry(row, source);
    return {
        ...(rest as unknown as TripViewData),
        route_geometry,
    };
};

export const toLiveDriverTripData = (row: RouteGeoRecord, source?: string): LiveDriverTripData => {
    const { route_geometry, rest } = splitRouteGeometry(row, source);
    return {
        ...(rest as unknown as LiveDriverTripData),
        route_geometry,
    };
};
