"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiGet } from "@/lib/api-client";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

interface StatsResponse {
  data: {
    totals: {
      users: number;
      recipes: number;
      mealPlans: number;
      shoppingItems: number;
      weightEntries: number;
      newUsersThisWeek: number;
    };
    charts: {
      registrations: { date: string; count: number }[];
      recipesCreated: { date: string; count: number }[];
      activeUsersByWeek: { week: string; count: number }[];
    };
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiGet<StatsResponse>("/api/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load stats")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading admin dashboard..." />;
  if (error || !stats) {
    return <ErrorState title="Unable to load stats" message={error || ""} />;
  }

  const cards = [
    { label: "Total users", value: stats.totals.users },
    { label: "Total recipes", value: stats.totals.recipes },
    { label: "Total meal plans", value: stats.totals.mealPlans },
    { label: "Shopping items", value: stats.totals.shoppingItems },
    { label: "Weight entries", value: stats.totals.weightEntries },
    { label: "New users this week", value: stats.totals.newUsersThisWeek },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>
        <p className="text-sm text-zinc-400">
          Platform health across users, recipes, and engagement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-[#111827] p-5"
          >
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="User registrations (30 days)">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.charts.registrations}>
              <defs>
                <linearGradient id="regFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis allowDecimals={false} stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#818cf8"
                fill="url(#regFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recipes created per day">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.charts.recipesCreated}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis allowDecimals={false} stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Active users by week">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.charts.activeUsersByWeek}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="week" hide />
              <YAxis allowDecimals={false} stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <h2 className="mb-4 text-sm font-medium text-zinc-300">{title}</h2>
      {children}
    </div>
  );
}
