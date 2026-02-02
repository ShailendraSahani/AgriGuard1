'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

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

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/signin');

    // ✅ REAL TIME WEATHER API FETCH
    const fetchWeather = async () => {
      try {
        const location = session?.user?.location || 'Delhi';
        const res = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to fetch weather data:', errorData.error || res.statusText);
          // Set fallback weather data
          setWeather({
            main: { temp: 25, humidity: 60 },
            weather: [{ description: 'Clear sky' }]
          });
          return;
        }
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error('Error fetching weather:', err);
        // Set fallback weather data on network error
        setWeather({
          main: { temp: 25, humidity: 60 },
          weather: [{ description: 'Clear sky' }]
        });
      }
    };

    // ✅ REAL TIME ANALYTICS API FETCH
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/user/analytics');
        if (!res.ok) {
          console.error('Failed to fetch analytics data');
          return;
        }
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchWeather();
    fetchAnalytics();
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-600 font-bold">
        Loading Dashboard...
      </div>
    );
  }

  // ✅ Real-time Chart Data
  const incomeData = analytics?.monthlyIncome || [
    { month: 'Jan', income: 0 },
    { month: 'Feb', income: 0 },
    { month: 'Mar', income: 0 },
    { month: 'Apr', income: 0 },
  ];

  const cropData = analytics?.cropData || [
    { week: 'Week 1', growth: 0 },
    { week: 'Week 2', growth: 0 },
    { week: 'Week 3', growth: 0 },
    { week: 'Week 4', growth: 0 },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">

      {/* ✅ SIDEBAR */}
      <aside className="w-72 bg-white shadow-xl border-r hidden md:flex flex-col p-6">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-yellow-500 bg-clip-text text-transparent">
          AgriGuard 🌱
        </h2>

        <nav className="mt-10 space-y-4 font-semibold text-gray-700">
          <Link href="/dashboard" className="hover:text-green-600">
            Dashboard
          </Link>
          <Link href="/services" className="hover:text-green-600">
            Book Services
          </Link>
          <Link href="/lands" className="hover:text-green-600">
            Browse Lands
          </Link>
          <Link href="/reports" className="hover:text-green-600">
            Reports
          </Link>
        </nav>

        {/* Notifications */}
        <div className="mt-auto p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <h3 className="font-bold text-yellow-700 flex items-center gap-2">
            🔔 Notifications
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            ⚠ Heavy Rain expected tomorrow.
          </p>
          <p className="text-sm text-gray-600">
            ✅ Booking Confirmed successfully.
          </p>
        </div>
      </aside>

      {/* ✅ MAIN CONTENT */}
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">
              Welcome,{" "}
              <span className="text-green-600">
                {session?.user?.name}
              </span>{" "}
              👨‍🌾
            </h1>
            <p className="text-gray-500 mt-2">
              Smart Farming Dashboard Overview
            </p>
          </div>

          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-yellow-500 text-white font-bold shadow-lg hover:scale-105 transition">
            + New Booking
          </button>
        </div>

        {/* ✅ Farmer Profile Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-green-700">
              Farmer Profile 🧑‍🌾
            </h2>
            <p className="mt-3 text-gray-600">
              Name: {session?.user?.name}
            </p>
            <p className="text-gray-600">
              Role: Farmer
            </p>
            <p className="text-gray-600">
              Location: {session?.user?.location || 'Delhi, India'}
            </p>
          </div>

          {/* Weather Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg">
            <h2 className="text-xl font-bold">Live Weather 🌦</h2>

            {weather && weather.main ? (
              <div className="mt-4">
                <p className="text-3xl font-extrabold">
                  {weather.main.temp}°C
                </p>
                <p className="capitalize">
                  {weather.weather?.[0]?.description}
                </p>
                <p className="text-sm mt-2">
                  Humidity: {weather.main.humidity}%
                </p>
              </div>
            ) : (
              <p className="mt-4">Fetching weather...</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="p-6 rounded-2xl bg-white shadow-lg border">
            <h2 className="text-xl font-bold text-yellow-600">
              Total Income 💰
            </h2>
            <p className="text-4xl font-extrabold mt-4 text-gray-800">
              ₹{analytics?.totalIncome?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              +12% Growth this season
            </p>
          </div>
        </div>

        {/* ✅ Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Income Chart */}
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

          {/* Crop Growth Chart */}
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
      </main>
    </div>
  );
}
