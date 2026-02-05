import { Source, Layer } from "react-map-gl/maplibre";

interface RouteLayerProps {
    coordinates: number[][];
    color: string;
    glowColor: string;
}

export default function RouteLayer({ coordinates, color, glowColor }: RouteLayerProps) {
    if (!coordinates || coordinates.length === 0) return null;

    return (
        <Source
            id="route"
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
                id="route-line"
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
                id="route-glow"
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
