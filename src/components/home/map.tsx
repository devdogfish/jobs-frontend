import Map, {
  Source,
  Layer,
  type LayerProps,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Application } from "@/types/application";
import type { FeatureCollection, Point } from "geojson";
import type { MapLayerMouseEvent } from "mapbox-gl";

const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// --- CONFIGURATION ---
const AUTO_SPIN_DELAY = 2000;
const WORLD_SCALE = 1.6;
const WINDOW_WIDTH = 140;
const WINDOW_HEIGHT = 127;
const MAP_SIZE = 512;

interface MyMapProps {
  applications: Application[];
  selectedId: string | null;
  onPinClick: (id: string) => void;
}

export default function MyMap({
  applications,
  selectedId,
  onPinClick,
}: MyMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  // -- Animation Refs --
  const spinAnimationFrameId = useRef<number | null>(null);
  // FIX: Use ReturnType so it works in Browser (number) or Node (object)
  const restartTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserInteracting = useRef(false);

  // -- 1. Smooth Spin Loop (The Frame Logic) --
  const spinGlobe = useCallback(() => {
    const map = mapRef.current;
    if (!map || isUserInteracting.current || selectedId) return;

    const zoom = map.getZoom();
    if (zoom > 5) return;

    const center = map.getCenter();
    const distancePerSecond = 360 / 120;
    const speed = distancePerSecond / 60;
    center.lng -= speed;

    map.jumpTo({ center });

    // Recursively request the next frame
    spinAnimationFrameId.current = requestAnimationFrame(spinGlobe);
  }, [selectedId]);

  // -- 2. Stop/Start Helpers --

  const stopSpinning = useCallback(() => {
    if (spinAnimationFrameId.current) {
      cancelAnimationFrame(spinAnimationFrameId.current);
      spinAnimationFrameId.current = null;
    }
  }, []);

  // FIX: Always use this to start. It guarantees we don't spawn parallel loops.
  const startSpinning = useCallback(() => {
    stopSpinning(); // Cancel any existing loop first!
    spinGlobe(); // Start the new loop
  }, [stopSpinning, spinGlobe]);

  // -- 3. The "Fly Back then Spin" Logic --
  const returnToAutoRotate = useCallback(() => {
    const map = mapRef.current;
    if (!map || selectedId) return;

    const currentCenter = map.getCenter();

    map.flyTo({
      center: [currentCenter.lng, 20],
      zoom: 0,
      pitch: 0,
      bearing: 0,
      duration: 1500,
      essential: true,
    });

    map.once("moveend", () => {
      if (!isUserInteracting.current && !selectedId) {
        startSpinning(); // Use the safe starter
      }
    });
  }, [selectedId, startSpinning]);

  // -- 4. Interaction Handlers --

  const onUserInteractionStart = useCallback(() => {
    isUserInteracting.current = true;
    stopSpinning();

    if (restartTimeoutId.current) {
      clearTimeout(restartTimeoutId.current);
      restartTimeoutId.current = null;
    }
  }, [stopSpinning]);

  const onUserInteractionEnd = useCallback(() => {
    isUserInteracting.current = false;

    if (selectedId) return;

    if (restartTimeoutId.current) clearTimeout(restartTimeoutId.current);

    restartTimeoutId.current = setTimeout(() => {
      returnToAutoRotate();
    }, AUTO_SPIN_DELAY);
  }, [selectedId, returnToAutoRotate]);

  // -- 5. Effects --

  // Initial Start
  useEffect(() => {
    startSpinning(); // Use the safe starter
    return () => {
      stopSpinning();
      if (restartTimeoutId.current) clearTimeout(restartTimeoutId.current);
    };
  }, [startSpinning, stopSpinning]);

  // Handle Selection Changes
  useEffect(() => {
    if (selectedId) {
      stopSpinning();
      if (restartTimeoutId.current) clearTimeout(restartTimeoutId.current);
    } else {
      // If we deselected, trigger the return sequence
      onUserInteractionEnd();
    }
  }, [selectedId, stopSpinning, onUserInteractionEnd]);

  // -- GeoJSON & Render Logic --
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

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const { features } = event;
      if (features && features[0] && features[0].properties?.id) {
        onPinClick(String(features[0].properties.id));

        const [lng, lat] = (features[0].geometry as Point).coordinates;
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 2000,
          essential: true,
        });
      }
    },
    [onPinClick],
  );

  const layerStyle: LayerProps = useMemo(() => {
    const isHighlighted = [
      "any",
      ["==", ["get", "id"], hoveredId],
      ["==", ["get", "id"], selectedId],
    ];
    return {
      id: "point",
      type: "circle",
      paint: {
        "circle-radius": ["case", isHighlighted, 9, 6],
        "circle-color": ["case", isHighlighted, "#be123c", "#E11D48"],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
      },
    };
  }, [hoveredId, selectedId]);

  return (
    <div
      style={{
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: MAP_SIZE,
          height: MAP_SIZE,
          position: "absolute",
          top: (WINDOW_HEIGHT - MAP_SIZE) / 2,
          left: (WINDOW_WIDTH - MAP_SIZE) / 2,
          transform: `scale(${1 / WORLD_SCALE})`,
          transformOrigin: "center center",
        }}
      >
        <Map
          ref={mapRef}
          mapboxAccessToken={token}
          initialViewState={{
            longitude: -50,
            latitude: 20,
            zoom: 0,
          }}
          projection="globe"
          mapStyle="mapbox://styles/mapbox/light-v11"
          interactiveLayerIds={["point"]}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoveredId(null)}
          onClick={onClick}
          onMouseDown={onUserInteractionStart}
          onTouchStart={onUserInteractionStart}
          onWheel={onUserInteractionStart}
          onDragStart={onUserInteractionStart}
          onRotateStart={onUserInteractionStart}
          onMouseUp={onUserInteractionEnd}
          onTouchEnd={onUserInteractionEnd}
          onDragEnd={onUserInteractionEnd}
          onZoomEnd={onUserInteractionEnd}
          onRotateEnd={onUserInteractionEnd}
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
