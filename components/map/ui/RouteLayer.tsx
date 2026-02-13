import { Source, Layer } from "react-map-gl/maplibre";

interface RouteLayerProps {
    coordinates: number[][];
    color: string;
    glowColor: string;
    idPrefix?: string;
}

export default function RouteLayer({ coordinates, color, glowColor, idPrefix = "route" }: RouteLayerProps) {
    if (!coordinates || coordinates.length === 0) return null;

    return (
        <Source
            id={`${idPrefix}-source`}
            type="geojson"
            data={{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            }}
        >
            <Layer
                id={`${idPrefix}-line`}
                type="line"
                paint={{
                    'line-color': color,
                    'line-width': 5,
                    'line-opacity': 0.8,
                    'line-blur': 1,
                }}
                layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                }}
            />
            <Layer
                id={`${idPrefix}-glow`}
                type="line"
                paint={{
                    'line-color': glowColor,
                    'line-width': 10,
                    'line-opacity': 0.2,
                    'line-blur': 5,
                }}
                layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                }}
            />
        </Source>
    );
}
