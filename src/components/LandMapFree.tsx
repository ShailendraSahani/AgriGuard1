"use client";

interface Land {
  _id: string;
  title: string;
  leasePrice: number;
  soilType: string;
  centroid?: {
    coordinates: number[];
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
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span className="text-red-600">Map functionality has been removed as Leaflet has been uninstalled.</span>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-[450px] rounded-2xl bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Map not available</p>
      </div>
    </div>
  );
}
