"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
  Rectangle,
  WMSTileLayer,
  GeoJSON,
  useMapEvents,
} from "react-leaflet";

import { EditControl } from "react-leaflet-draw";
import L, { Map as LeafletMap, LatLngBounds } from "leaflet";

import type { FeatureCollection, GeoJsonObject } from "geojson";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

/* Fix Leaflet marker icons */
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* Types */
interface Land {
  _id: string;
  title: string;
  leasePrice: number;
  soilType: string;
  centroid?: {
    coordinates: number[]; //
  };
}

type Bbox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

interface Props {
  lands: Land[];
  onBboxChange?: (bbox: Bbox | null) => void;
  onViewBboxChange?: (bbox: Bbox) => void;
  enableViewSearch?: boolean;
}

export default function LandMapFree({
  lands,
  onBboxChange,
  onViewBboxChange,
  enableViewSearch,
}: Props) {
  const [bbox, setBbox] = useState<Bbox | null>(null);

  const [showSoilTiles, setShowSoilTiles] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);

  const [districtGeoJson, setDistrictGeoJson] =
    useState<FeatureCollection | null>(null);

  const debounceRef = useRef<number | null>(null);

  const [isClient, setIsClient] = useState(false);

  const mapId = useMemo(
    () => `lands-map-${Math.random().toString(36).slice(2)}`,
    []
  );

  const mapRef = useRef<LeafletMap | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mapKey, setMapKey] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  /* Client Fix */
  useEffect(() => {
    setIsClient(true);
    setMapKey((prev) => prev + 1);
  }, []);

  /* Prevent Leaflet Duplicate Init */
  useEffect(() => {
    if (!isClient) return;

    const container = containerRef.current as
      | (HTMLDivElement & { _leaflet_id?: number })
      | null;

    if (container?._leaflet_id) {
      delete container._leaflet_id;
    }

    setMapReady(true);
  }, [isClient]);

  /* Cleanup */
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* Convert Bounds → Bbox */
  const boundsToBbox = (bounds: LatLngBounds): Bbox => ({
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  });

  /* Draw Events */
  const handleCreated = (event: { layer: L.Rectangle }) => {
    const next = boundsToBbox(event.layer.getBounds());
    setBbox(next);
    onBboxChange?.(next);
  };

  const handleEdited = (event: { layers: L.LayerGroup }) => {
    event.layers.eachLayer((layer) => {
      if (layer instanceof L.Rectangle) {
        const next = boundsToBbox(layer.getBounds());
        setBbox(next);
        onBboxChange?.(next);
      }
    });
  };

  const handleDeleted = () => {
    setBbox(null);
    onBboxChange?.(null);
  };

  /* Soil WMS */
  const soilWms = useMemo(
    () => ({
      url: "https://maps.isric.org/mapserv?map=/map/soilgrids.map&",
      layers: "phh2o",
    }),
    []
  );

  /* District GeoJSON */
  useEffect(() => {
    if (!showDistricts) return;

    fetch("/geo/india-districts.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setDistrictGeoJson(data))
      .catch(() => setDistrictGeoJson(null));
  }, [showDistricts]);

  /* Viewport Watcher */
  const ViewportWatcher = () => {
    useMapEvents({
      moveend: (event) => {
        if (!enableViewSearch) return;

        const bounds = event.target.getBounds();
        const next = boundsToBbox(bounds);

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(() => {
          onViewBboxChange?.(next);
        }, 400);
      },
    });

    return null;
  };

  return (
    <div className="space-y-3">
      {/* Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <button
          onClick={() => setShowSoilTiles((prev) => !prev)}
          className={`rounded-full border px-3 py-1 transition ${
            showSoilTiles
              ? "border-yellow-300 bg-yellow-50 text-yellow-700"
              : "border-gray-200 text-gray-500"
          }`}
        >
          Soil Tiles
        </button>

        <button
          onClick={() => setShowDistricts((prev) => !prev)}
          className={`rounded-full border px-3 py-1 transition ${
            showDistricts
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 text-gray-500"
          }`}
        >
          District Boundaries
        </button>

        {bbox && (
          <span className="text-xs text-green-700">
            BBox: {bbox.west.toFixed(2)}, {bbox.south.toFixed(2)} →{" "}
            {bbox.east.toFixed(2)}, {bbox.north.toFixed(2)}
          </span>
        )}
      </div>

      {/* Map */}
      {isClient && mapReady ? (
        <div ref={containerRef} className="h-64 md:h-80 lg:h-[450px]">
          <MapContainer
            key={mapKey}
            id={mapId}
            center={[20.5937, 78.9629]}
            zoom={5}
            className="w-full h-full rounded-2xl shadow-lg"
            ref={mapRef}
          >
            <ViewportWatcher />

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {showSoilTiles && (
              <WMSTileLayer
                url={soilWms.url}
                layers={soilWms.layers}
                transparent
                opacity={0.35}
              />
            )}

            {showDistricts && districtGeoJson && (
              <GeoJSON
                data={districtGeoJson}
                style={{
                  color: "#2563eb",
                  weight: 1,
                  fillOpacity: 0,
                }}
              />
            )}

            {/* Draw Rectangle */}
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  polygon: false,
                  polyline: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  rectangle: true,
                }}
              />

              {bbox && (
                <Rectangle
                  bounds={[
                    [bbox.south, bbox.west],
                    [bbox.north, bbox.east],
                  ]}
                  pathOptions={{ color: "#16a34a" }}
                />
              )}
            </FeatureGroup>

            {/* Land Markers */}
            {lands
              .filter(
                (land) =>
                  land.centroid &&
                  land.centroid.coordinates &&
                  land.centroid.coordinates.length >= 2
              )
              .map((land) => (
                <Marker
                  key={land._id}
                  position={[
                    land.centroid!.coordinates[1],
                    land.centroid!.coordinates[0],
                  ]}
                >
                  <Popup>
                    <h3 className="font-bold">{land.title}</h3>
                    <p>₹{land.leasePrice}</p>
                    <p>Soil: {land.soilType}</p>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      ) : (
        <div className="w-full h-64 md:h-80 lg:h-[450px] rounded-2xl bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}
