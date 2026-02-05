import { NextRequest, NextResponse } from 'next/server';

type CacheEntry = {
  expiresAt: number;
  data: any;
};

const globalCache = (globalThis as any).__landsFacilitiesCache as Map<string, CacheEntry> | undefined;
const cache = globalCache ?? new Map<string, CacheEntry>();
(globalThis as any).__landsFacilitiesCache = cache;
const TTL_MS = Number(process.env.FACILITIES_CACHE_TTL_MS || 15 * 60 * 1000);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusKm = searchParams.get('radiusKm') || '3';

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const key = `${lat}:${lng}:${radiusKm}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const radiusMeters = parseFloat(radiusKm) * 1000;

    const query = `
      [out:json];
      (
        node["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});
        node["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
        node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        node["shop"="agricultural"](around:${radiusMeters},${lat},${lng});
        node["waterway"="river"](around:${radiusMeters},${lat},${lng});
      );
      out center 50;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 502 });
    }

    const data = await response.json();
    const elements = Array.isArray(data.elements) ? data.elements : [];
    const facilities = elements
      .filter((el: any) => el.lat && el.lon)
      .map((el: any) => ({
        id: String(el.id),
        name: el.tags?.name || 'Nearby Facility',
        type: el.tags?.amenity || el.tags?.shop || el.tags?.waterway || 'facility',
        lat: el.lat,
        lng: el.lon,
      }));

    const payload = { facilities };
    cache.set(key, { expiresAt: Date.now() + TTL_MS, data: payload });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
  }
}
