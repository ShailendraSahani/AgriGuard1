'use client';

import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import type { LeafletEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

interface PointGeometry {
  type: 'Point';
  coordinates: number[];
}

interface LandBoundaryMapProps {
  onChange: (geometry: PolygonGeometry | null, centroid: PointGeometry | null) => void;
  defaultCenter?: [number, number];
}

const fallbackCenter: [number, number] = [28.6139, 77.209];

const calculateCentroid = (coordinates: number[][][]): [number, number] => {
  const ring = coordinates[0] || [];
  if (ring.length === 0) return [fallbackCenter[1], fallbackCenter[0]];
  let sumLng = 0;
  let sumLat = 0;
  ring.forEach(([lng, lat]) => {
    sumLng += lng;
    sumLat += lat;
  });
  return [sumLng / ring.length, sumLat / ring.length];
};

const toPolygonGeometry = (event: LeafletEvent): PolygonGeometry | null => {
  const geo = (event as any).layer?.toGeoJSON?.();
  if (!geo || geo.geometry?.type !== 'Polygon') return null;
  return geo.geometry as PolygonGeometry;
};

export function LandBoundaryMap({ onChange, defaultCenter }: LandBoundaryMapProps) {
  const center = useMemo(() => defaultCenter || fallbackCenter, [defaultCenter]);

  const handleCreate = (event: LeafletEvent) => {
    const geometry = toPolygonGeometry(event);
    if (!geometry) return;
    const centroid = calculateCentroid(geometry.coordinates);
    onChange(geometry, { type: 'Point', coordinates: centroid });
  };

  const handleEdit = (event: LeafletEvent) => {
    const layers = (event as any).layers;
    if (!layers) return;
    layers.eachLayer((layer: any) => {
      const geometry = layer.toGeoJSON?.()?.geometry;
      if (!geometry || geometry.type !== 'Polygon') return;
      const centroid = calculateCentroid(geometry.coordinates);
      onChange(geometry, { type: 'Point', coordinates: centroid });
    });
  };

  const handleDelete = () => {
    onChange(null, null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-green-600" />
        Draw the land boundary on the map. Use the polygon tool and double click to finish.
      </div>
      <div className="h-64 md:h-80 lg:h-[420px] w-full overflow-hidden rounded-2xl border border-green-200 shadow-sm">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleCreate}
              onEdited={handleEdit}
              onDeleted={handleDelete}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                },
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
}
