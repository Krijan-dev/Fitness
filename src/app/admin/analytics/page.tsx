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
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<{
    totals: {
      users: number;
      recipes: number;
      newUsersThisWeek: number;
    };
    charts: {
      registrations: { date: string; count: number }[];
      recipesCreated: { date: string; count: number }[];
      activeUsersByWeek: { week: string; count: number }[];
    };
  } | null>(null);

  useEffect(() => {
    void apiGet<{ data: typeof stats }>("/api/admin/stats").then((res) =>
      setStats(res.data)
    );
  }, []);

  if (!stats) return <LoadingState message="Loading analytics..." />;

  const registrationsByMonth = Object.values(
    stats.charts.registrations.reduce<Record<string, { month: string; count: number }>>(
      (acc, row) => {
        const month = row.date.slice(0, 7);
        acc[month] = acc[month] || { month, count: 0 };
        acc[month].count += row.count;
        return acc;
      },
      {}
    )
  );

  const recipesByMonth = Object.values(
    stats.charts.recipesCreated.reduce<Record<string, { month: string; count: number }>>(
      (acc, row) => {
        const month = row.date.slice(0, 7);
        acc[month] = acc[month] || { month, count: 0 };
        acc[month].count += row.count;
        return acc;
      },
      {}
    )
  );

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Growth, engagement, and content publishing trends."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Users" value={stats.totals.users} />
        <StatCard label="Recipes" value={stats.totals.recipes} />
        <StatCard label="New this week" value={stats.totals.newUsersThisWeek} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrations by month</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={registrationsByMonth}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #2B3548",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipes published by month</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={recipesByMonth}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #2B3548",
                  borderRadius: 12,
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf633" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Active users by week</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.charts.activeUsersByWeek}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="week" hide />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #2B3548",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}
