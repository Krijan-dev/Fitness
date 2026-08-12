"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import {
  BookOpen,
  CalendarDays,
  Scale,
  Upload,
  Users,
  Activity,
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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

interface ActivityItem {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  at?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [published, setPublished] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      apiGet<StatsResponse>("/api/admin/stats"),
      apiGet<{ data: ActivityItem[] }>("/api/admin/activity?limit=8"),
      apiGet<{ pagination: { total: number } }>(
        "/api/admin/recipes?status=published&limit=1"
      ),
    ])
      .then(([statsRes, activityRes, recipesRes]) => {
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setPublished(recipesRes.pagination.total);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading admin dashboard..." />;
  if (error || !stats) {
    return <ErrorState title="Unable to load dashboard" message={error || ""} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="Platform health, content performance, and recent activity."
        actions={
          <Link href="/admin/recipes/new">
            <Button>
              <Upload className="h-4 w-4" />
              Upload recipe
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total users" value={stats.totals.users} icon={Users} />
        <StatCard
          label="Active this week"
          value={stats.totals.newUsersThisWeek}
          icon={Activity}
          hint="New registrations this week"
        />
        <StatCard label="Total recipes" value={stats.totals.recipes} icon={BookOpen} />
        <StatCard label="Published recipes" value={published} icon={Upload} />
        <StatCard
          label="Meal plans"
          value={stats.totals.mealPlans}
          icon={CalendarDays}
        />
        <StatCard
          label="Weight entries"
          value={stats.totals.weightEntries}
          icon={Scale}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User registrations</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.charts.registrations}>
              <defs>
                <linearGradient id="reg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 12,
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#reg)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipes created</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.charts.recipesCreated}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Recent activity</CardTitle>
            <Link href="/admin/analytics" className="text-sm text-emerald-700 hover:underline">
              View analytics
            </Link>
          </div>
        </CardHeader>
        <ul className="space-y-2">
          {activity.map((item) => (
            <li
              key={`${item.type}-${item.id}-${item.at}`}
              className="flex items-start justify-between gap-3 rounded-xl bg-muted px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                <Badge tone="info" className="mt-2">
                  {item.type.replace("_", " ")}
                </Badge>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.at ? new Date(item.at).toLocaleString() : "—"}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
