'use client';

import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, LayerGroup } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import { MapPin, Waves, Leaf } from 'lucide-react';

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

interface LandMapViewerProps {
  geometry?: PolygonGeometry;
  centroid?: {
    type: 'Point';
    coordinates: number[];
  };
}

const fallbackCenter: [number, number] = [28.6139, 77.209];

const getBounds = (coordinates: number[][][]): LatLngBoundsExpression => {
  const ring = coordinates[0] || [];
  const latLngs = ring.map(([lng, lat]) => [lat, lng]) as [number, number][];
  return latLngs.length ? latLngs : [fallbackCenter];
};

function FitBounds({ geometry }: { geometry?: PolygonGeometry }) {
  const map = useMap();

  useEffect(() => {
    if (!geometry?.coordinates?.length) return;
    const bounds = getBounds(geometry.coordinates);
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [geometry, map]);

  return null;
}

export function LandMapViewer({ geometry, centroid }: LandMapViewerProps) {
  const [showFacilities, setShowFacilities] = useState(true);
  const [showSoilOverlay, setShowSoilOverlay] = useState(false);
  const [facilities, setFacilities] = useState<{ id: string; name: string; type: string; lat: number; lng: number }[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [soilData, setSoilData] = useState<{ ph?: number; clay?: number; sand?: number; silt?: number; source?: string } | null>(null);
  const [loadingSoil, setLoadingSoil] = useState(false);
  const geoJson = useMemo(() => {
    if (!geometry) return null;
    return {
      type: 'Feature',
      geometry,
      properties: {},
    };
  }, [geometry]);

  useEffect(() => {
    if (!showFacilities) return;
    if (!geometry?.coordinates?.length) return;

    const center = centroid?.coordinates || geometry.coordinates[0]?.[0];
    if (!center) return;

    const [lng, lat] = center;
    setLoadingFacilities(true);
    fetch(`/api/lands/facilities?lat=${lat}&lng=${lng}&radiusKm=3`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.facilities) ? data.facilities : [];
        setFacilities(list.slice(0, 40));
      })
      .catch(() => setFacilities([]))
      .finally(() => setLoadingFacilities(false));
  }, [geometry, showFacilities]);

  useEffect(() => {
    if (!showSoilOverlay) return;
    if (!geometry?.coordinates?.length) return;

    const center = centroid?.coordinates || geometry.coordinates[0]?.[0];
    if (!center) return;

    const [lng, lat] = center;
    setLoadingSoil(true);
    fetch(`/api/lands/soil?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => setSoilData(data))
      .catch(() => setSoilData(null))
      .finally(() => setLoadingSoil(false));
  }, [geometry, showSoilOverlay]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <button
          onClick={() => setShowFacilities((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition ${
            showFacilities ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Nearby Facilities
        </button>
        <button
          onClick={() => setShowSoilOverlay((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition ${
            showSoilOverlay ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500'
          }`}
        >
          <Leaf className="h-4 w-4" />
          Soil Overlay (Preview)
        </button>
        {loadingFacilities && <span className="text-xs text-gray-500">Loading facilities...</span>}
        {loadingSoil && <span className="text-xs text-gray-500">Loading soil data...</span>}
      </div>

      <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-green-200 shadow-sm">
        <MapContainer
          center={fallbackCenter}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoJson && (
            <>
              <GeoJSON data={geoJson as any} style={{ color: '#15803d', weight: 2, fillColor: '#22c55e', fillOpacity: 0.35 }} />
              <FitBounds geometry={geometry} />
            </>
          )}
          {showFacilities && facilities.length > 0 && (
            <LayerGroup>
              {facilities.map((facility) => (
                <CircleMarker
                  key={facility.id}
                  center={[facility.lat, facility.lng]}
                  radius={5}
                  pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.8 }}
                />
              ))}
            </LayerGroup>
          )}
        </MapContainer>

        {showSoilOverlay && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-green-200/20">
            <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs text-gray-700 shadow">
              {soilData?.ph ? `Soil pH ${soilData.ph.toFixed(1)}` : 'Soil overlay preview'}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-600" />
          Land boundary
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500" />
          Facilities
        </div>
        <div className="flex items-center gap-2">
          <Waves className="h-3 w-3 text-yellow-500" />
          Soil overlay preview
        </div>
        {soilData && (
          <div className="text-xs text-gray-500">
            pH {soilData.ph ?? '--'} • Clay {soilData.clay ?? '--'}% • Sand {soilData.sand ?? '--'}% • Silt {soilData.silt ?? '--'}%
          </div>
        )}
      </div>
    </div>
  );
}
