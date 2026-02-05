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
    const safeData = {
      main: {
        temp: typeof data.main.temp === 'object' ? (data.main.temp as any).value : data.main.temp,
        humidity: typeof data.main.humidity === 'object' ? (data.main.humidity as any).value : data.main.humidity,
      },
      weather: data.weather.map((w: any) => ({
        description: typeof w.description === 'object' ? (w.description as any).value : w.description,
      })),
    };
    return NextResponse.json(safeData);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
