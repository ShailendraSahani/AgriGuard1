import { NextRequest, NextResponse } from 'next/server';

type CacheEntry = {
  expiresAt: number;
  data: any;
};

const globalCache = (globalThis as any).__landsSoilCache as Map<string, CacheEntry> | undefined;
const cache = globalCache ?? new Map<string, CacheEntry>();
(globalThis as any).__landsSoilCache = cache;
const TTL_MS = Number(process.env.SOIL_CACHE_TTL_MS || 60 * 60 * 1000);

const pickMean = (property: any) => {
  const depths = property?.depths;
  if (!Array.isArray(depths) || depths.length === 0) return null;
  const values = depths[0]?.values;
  if (!values) return null;
  return values.mean ?? values.median ?? null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const key = `${lat}:${lng}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const url = new URL('https://rest.isric.org/soilgrids/v2.0/properties/query');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lng);
    url.searchParams.set('property', 'phh2o');
    url.searchParams.append('property', 'clay');
    url.searchParams.append('property', 'sand');
    url.searchParams.append('property', 'silt');
    url.searchParams.set('depth', '0-5cm');

    const response = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch soil data' }, { status: 502 });
    }

    const data = await response.json();
    const properties = data?.properties || {};

    const payload = {
      ph: pickMean(properties.phh2o),
      clay: pickMean(properties.clay),
      sand: pickMean(properties.sand),
      silt: pickMean(properties.silt),
      source: 'SoilGrids 2.0',
    };

    cache.set(key, { expiresAt: Date.now() + TTL_MS, data: payload });
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch soil data' }, { status: 500 });
  }
}
