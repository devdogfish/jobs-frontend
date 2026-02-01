import Map, { Source, Layer, type LayerProps } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useMemo, useCallback } from "react";
import type { Application } from "@/types/application";
import type { FeatureCollection } from "geojson";
import type { MapLayerMouseEvent } from "mapbox-gl";

const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const WORLD_SCALE = 1.6;
const WINDOW_WIDTH = 140;
const WINDOW_HEIGHT = 127;
const MAP_SIZE = 512; // Standard tile size to keep Mapbox happy

export default function MyMap({
  applications,
}: {
  applications: Application[];
}) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const geoJsonData: FeatureCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: applications
        .filter((app) => app.longitude && app.latitude)
        .map((app, index) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [app.longitude!, app.latitude!],
          },
          properties: { id: app.id || index, title: app.location },
        })),
    }),
    [applications],
  );

  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const { features } = event;
    setHoveredId(features && features[0] ? features[0].properties?.id : null);
  }, []);

  const layerStyle: LayerProps = useMemo(
    () => ({
      id: "point",
      type: "circle",
      paint: {
        "circle-radius": ["case", ["==", ["get", "id"], hoveredId], 9, 6],
        "circle-color": [
          "case",
          ["==", ["get", "id"], hoveredId],
          "#be123c",
          "#E11D48",
        ],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
      },
    }),
    [hoveredId],
  );

  return (
    <div
      style={{
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        overflow: "hidden",
        position: "relative",
        borderRadius: "8px", // Optional: makes the tiny window look cleaner
      }}
    >
      <div
        style={{
          width: MAP_SIZE,
          height: MAP_SIZE,
          position: "absolute",
          // This centers the 512px map inside your 140x127 window
          top: (WINDOW_HEIGHT - MAP_SIZE) / 2,
          left: (WINDOW_WIDTH - MAP_SIZE) / 2,
          // This scales the entire map visually while keeping interactions aligned
          transform: `scale(${1 / WORLD_SCALE})`,
          transformOrigin: "center center",
        }}
      >
        <Map
          mapboxAccessToken={token}
          initialViewState={{
            longitude: 0,
            latitude: 20,
            zoom: 0,
          }}
          renderWorldCopies={true}
          mapStyle="mapbox://styles/mapbox/light-v11"
          interactiveLayerIds={["point"]}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoveredId(null)}
          cursor={hoveredId ? "pointer" : "auto"}
          style={{ width: "100%", height: "100%" }}
        >
          <Source id="my-data" type="geojson" data={geoJsonData}>
            <Layer {...layerStyle} />
          </Source>
        </Map>
      </div>
    </div>
  );
}
