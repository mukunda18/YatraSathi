export const parseWKT = (wkt: string | undefined) => {
    if (!wkt) return null;
    const match = wkt.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (!match) return null;
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
};
