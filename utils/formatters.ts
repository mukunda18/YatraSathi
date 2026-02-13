export const formatDistanceKm = (value: number) => `${value.toFixed(1)} km`;

export const formatCoordinate = (value: number | null | undefined, precision = 5) =>
    value == null ? "--" : value.toFixed(precision);
