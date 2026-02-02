import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'Delhi';

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
