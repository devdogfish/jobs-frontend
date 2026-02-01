import type {
  FillExtrusionLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
  FillLayerSpecification,
} from "react-map-gl/mapbox";

// --- CONFIGURATION ---
export const AUTO_SPIN_DELAY = 2000;
export const WORLD_SCALE = 1.6;
export const WINDOW_WIDTH = 140;
export const WINDOW_HEIGHT = 127;
export const MAP_SIZE = 512;
export const PIN_SIZE = 5; // Base size (1/3 smaller than original 6)
export const PIN_SIZE_HIGHLIGHT = 7.5; // Highlighted size (1/3 smaller than original 9)

// --- COLOR CONSTANTS ---
// This sets the base color of the map (the land).
// const LANDMASS_COLOR = "rgba(244, 244, 240, 0.2)";
export const WATERMASS_COLOR = ""; // "rgba(23, 23, 23, 1)";
export const LANDMASS_COLOR = ""; //"rgba(244, 244, 240, 1)";

// const WATERMASS_COLOR = "rgba(236, 237, 240, 0.1)";

// --- LAYER 1: MAJOR ROADS (Zoom 8+) ---
export const majorRoadsLayer: LineLayerSpecification = {
  id: "infrastructure-roads-major",
  type: "line",
  source: "composite",
  "source-layer": "road",
  minzoom: 8,
  filter: ["in", "class", "motorway", "trunk", "primary"],
  paint: {
    "line-color": "#94a3b8",
    "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 14, 2],
    "line-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0, 9, 0.6],
  },
};

// --- LAYER 2: SECONDARY ROADS (Zoom 15+) ---
export const secondaryRoadsLayer: LineLayerSpecification = {
  id: "infrastructure-roads-minor",
  type: "line",
  source: "composite",
  "source-layer": "road",
  minzoom: 15,
  filter: ["in", "class", "secondary", "tertiary", "street"],
  paint: {
    "line-color": "#cbd5e1",
    "line-width": 1,
    "line-opacity": 0.5,
  },
};

// --- LAYER 3: COUNTRY BORDERS (Zoom 10+) ---
export const countryBordersLayer: LineLayerSpecification = {
  id: "admin-borders",
  type: "line",
  source: "composite",
  "source-layer": "admin",
  minzoom: 10,
  filter: ["==", "admin_level", 0],
  paint: {
    "line-color": "#64748b",
    "line-width": 1,
    "line-dasharray": [2, 2],
    "line-opacity": 0.5,
  },
};

// --- LAYER 4: GREEN SPACES (Zoom 10+) ---
export const greenSpacesLayer: FillLayerSpecification = {
  id: "landuse-green",
  type: "fill",
  source: "composite",
  "source-layer": "landuse",
  minzoom: 10,
  filter: ["in", "class", "park", "wood", "national_park"],
  paint: {
    "fill-color": "#dcfce7",
    "fill-opacity": 0.4,
  },
};

// --- LAYER 5: MAJOR CITIES (Zoom 10+) ---
// FIX: Changed source-layer to 'place_label' and filter to 'type'
export const majorCitiesLayer: SymbolLayerSpecification = {
  id: "place-cities",
  type: "symbol",
  source: "composite",
  "source-layer": "place_label",
  minzoom: 10,
  filter: ["==", "type", "city"],
  layout: {
    "text-field": ["get", "name_en"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
    "text-anchor": "center",
  },
  paint: {
    "text-color": "#334155",
    "text-halo-color": "#ffffff",
    "text-halo-width": 2,
  },
};

// --- LAYER 6: 3D BUILDINGS (Zoom 15+) ---
export const buildingLayer: FillExtrusionLayerSpecification = {
  id: "3d-buildings",
  source: "composite",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion",
  minzoom: 11,
  paint: {
    "fill-extrusion-color": "#aaa",
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.6,
  },
};
