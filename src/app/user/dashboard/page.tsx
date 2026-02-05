'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// ✅ Recharts (SSR safe)
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });

// ---------------- TYPES ----------------
interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
}

interface AnalyticsData {
  totalIncome: number;
  monthlyIncome: Array<{ month: string; income: number }>;
  cropData: Array<{ week: string; growth: number }>;
}

// ---------------- COMPONENT ----------------
export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const location =
      (session.user as any)?.location ?? 'Delhi';

    // 🌦 Weather
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `/api/weather?location=${encodeURIComponent(location)}`
        );

        if (!res.ok) throw new Error('Weather API failed');

        const data = await res.json();
        setWeather(data);
      } catch {
        setWeather({
          main: { temp: 25, humidity: 60 },
          weather: [{ description: 'Clear sky' }],
        });
      }
    };

    // 📊 Analytics
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/user/analytics');
        if (!res.ok) throw new Error('Analytics API failed');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWeather();
    fetchAnalytics();
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-600 font-bold">
        Loading Dashboard...
      </div>
    );
  }

  const incomeData =
    analytics?.monthlyIncome ?? [
      { month: 'Jan', income: 0 },
      { month: 'Feb', income: 0 },
      { month: 'Mar', income: 0 },
      { month: 'Apr', income: 0 },
    ];

  const cropData =
    analytics?.cropData ?? [
      { week: 'Week 1', growth: 0 },
      { week: 'Week 2', growth: 0 },
      { week: 'Week 3', growth: 0 },
      { week: 'Week 4', growth: 0 },
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto py-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              Welcome,{' '}
              <span className="text-green-600">
                {session?.user?.name}
              </span>{' '}
              👨‍🌾
            </h1>
            <p className="text-gray-500 mt-2">
              Smart Farming Dashboard Overview
            </p>
          </div>

          <Link href="/bookings/new">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold shadow-lg hover:scale-105 transition w-full sm:w-auto">
              + New Booking
            </button>
          </Link>
        </div>

        {/* PROFILE + WEATHER + INCOME */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-green-700">
              Farmer Profile 🧑‍🌾
            </h2>
            <p className="mt-3 text-gray-600">
              Name: {session?.user?.name}
            </p>
            <p className="text-gray-600">Role: Farmer</p>
            <p className="text-gray-600">
              Location:{' '}
              {(session?.user as any)?.location ?? 'Delhi, India'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg">
            <h2 className="text-xl font-bold">Live Weather 🌦</h2>
            {weather ? (
              <div className="mt-4">
                <p className="text-3xl font-extrabold">
                  {weather.main.temp}°C
                </p>
                <p className="capitalize">
                  {weather.weather[0]?.description}
                </p>
                <p className="text-sm mt-2">
                  Humidity: {weather.main.humidity}%
                </p>
              </div>
            ) : (
              <p className="mt-4">Fetching weather...</p>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-yellow-600">
              Total Income 💰
            </h2>
            <p className="text-4xl font-extrabold mt-4 text-gray-800">
              ₹{analytics?.totalIncome?.toLocaleString() ?? '0'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              +12% Growth this season
            </p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-green-700 mb-4">
              Monthly Income 📊
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeData}>
                <XAxis dataKey="month" />
                <Tooltip />
                <Bar dataKey="income" fill="#22c55e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-yellow-600 mb-4">
              Crop Growth 🌾
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cropData}>
                <XAxis dataKey="week" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#eab308"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
