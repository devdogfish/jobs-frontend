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
import {
  AUTO_SPIN_DELAY,
  WORLD_SCALE,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  MAP_SIZE,
  PIN_SIZE,
  PIN_SIZE_HIGHLIGHT,
  LANDMASS_COLOR,
  WATERMASS_COLOR,
  majorRoadsLayer,
  secondaryRoadsLayer,
  countryBordersLayer,
  greenSpacesLayer,
  majorCitiesLayer,
  buildingLayer,
} from "@/lib/map.config";

const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MyMapProps {
  applications: Application[];
  selectedId: string | null;
  onPinClick: (id: string) => void;
  onZoomChange?: (isAtZoomZero: boolean) => void;
}

export default function MyMap({
  applications,
  selectedId,
  onPinClick,
  onZoomChange,
}: MyMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  // -- Refs for State Tracking --
  const spinAnimationFrameId = useRef<number | null>(null);
  const restartTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserInteracting = useRef(false);
  const isSpinningEnabled = useRef(true);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // -- 1. Smooth Spin Loop --
  const spinGlobe = useCallback(() => {
    const map = mapRef.current;
    if (
      !isSpinningEnabled.current ||
      !map ||
      isUserInteracting.current ||
      selectedIdRef.current
    ) {
      return;
    }

    const zoom = map.getZoom();
    if (zoom > 5) return;

    const center = map.getCenter();
    const distancePerSecond = 360 / 120;
    const speed = distancePerSecond / 60;
    center.lng -= speed;

    map.jumpTo({ center });
    spinAnimationFrameId.current = requestAnimationFrame(spinGlobe);
  }, []);

  // -- 2. Stop/Start Helpers --
  const stopSpinning = useCallback(() => {
    isSpinningEnabled.current = false;
    if (spinAnimationFrameId.current) {
      cancelAnimationFrame(spinAnimationFrameId.current);
      spinAnimationFrameId.current = null;
    }
  }, []);

  const startSpinning = useCallback(() => {
    stopSpinning();
    isSpinningEnabled.current = true;
    spinGlobe();
  }, [stopSpinning, spinGlobe]);

  // -- 3. Interaction Handlers --
  const returnToAutoRotate = useCallback(() => {
    const map = mapRef.current;
    if (!map || selectedIdRef.current) return;

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
      if (!isUserInteracting.current && !selectedIdRef.current) {
        startSpinning();
      }
    });
  }, [startSpinning]);

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
    if (selectedIdRef.current) return;

    if (restartTimeoutId.current) clearTimeout(restartTimeoutId.current);

    restartTimeoutId.current = setTimeout(() => {
      returnToAutoRotate();
    }, AUTO_SPIN_DELAY);
  }, [returnToAutoRotate]);

  // -- 4. Custom: Apply Land Color on Load & Start Spinning --
  const onMapLoad = useCallback(
    (event: any) => {
      // 1. Get the raw map instance from the event
      const map = event.target;

      // 2. The standard Mapbox Light style uses a layer named "background" for the land/ocean base.
      if (LANDMASS_COLOR && WATERMASS_COLOR) {
        map.setPaintProperty("land", "background-color", LANDMASS_COLOR);
        map.setPaintProperty("water", "fill-color", WATERMASS_COLOR);
      }

      // 3. Start spinning on load if no item is selected
      if (!selectedIdRef.current) {
        startSpinning();
      }
    },
    [startSpinning],
  );

  // -- 5. Effects --
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpinning();
      if (restartTimeoutId.current) clearTimeout(restartTimeoutId.current);
    };
  }, [stopSpinning]);

  useEffect(() => {
    if (selectedId) {
      stopSpinning();
      if (restartTimeoutId.current) clearTimeout(restartTimeoutId.current);
    } else {
      onUserInteractionEnd();
    }
  }, [selectedId, stopSpinning, onUserInteractionEnd]);

  // -- 6. The Cinematic Click Fix --
  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const { features } = event;
      if (features && features[0] && features[0].properties?.id) {
        stopSpinning();
        mapRef.current?.stop();

        onPinClick(String(features[0].properties.id));

        const [lng, lat] = (features[0].geometry as Point).coordinates;

        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 11,
          pitch: 50,
          duration: 6000,
          essential: true,
        });
      }
    },
    [onPinClick, stopSpinning],
  );

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
        "circle-radius": ["case", isHighlighted, PIN_SIZE_HIGHLIGHT, PIN_SIZE],
        "circle-color": ["case", isHighlighted, "#be123c", "#E11D48"],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
      },
    };
  }, [hoveredId, selectedId]);

  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const { features } = event;
    setHoveredId(features && features[0] ? features[0].properties?.id : null);
  }, []);

  // -- Zoom Change Handler --
  const onZoom = useCallback(() => {
    const map = mapRef.current;
    if (!map || !onZoomChange) return;
    const zoom = map.getZoom();
    // Consider "at zoom zero" only when zoom is essentially 0
    onZoomChange(zoom < 0.05);
  }, [onZoomChange]);

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
          onLoad={onMapLoad}
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
          onZoom={onZoom}
          onRotateEnd={onUserInteractionEnd}
          cursor={hoveredId ? "pointer" : "auto"}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Order matters: Bottom layers first */}
          <Layer {...greenSpacesLayer} />
          <Layer {...countryBordersLayer} />
          <Layer {...majorRoadsLayer} />
          <Layer {...secondaryRoadsLayer} />
          <Layer {...buildingLayer} />
          <Layer {...majorCitiesLayer} />

          <Source id="my-data" type="geojson" data={geoJsonData}>
            <Layer {...layerStyle} />
          </Source>
        </Map>
      </div>
    </div>
  );
}
