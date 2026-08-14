"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiGet } from "@/lib/api-client";

interface IntegrationProvider {
  id: string;
  label: string;
  configured: boolean;
  live: boolean;
  hint: string;
  health: "live" | "needs-setup";
}

interface IntegrationsPayload {
  mode: string;
  usingFallbackPrices: boolean;
  mapsConfigured: boolean;
  providers: IntegrationProvider[];
  liveCount: number;
  needsWorkCount: number;
  summary: string;
  aldiCatalogue?: {
    productCount: number;
    lastSyncedAt: string | null;
    nextWednesdayRefreshAt: string;
    isDue: boolean;
  } | null;
}

/**
 * Admin-only view of which grocery APIs are live vs need work.
 */
export function AdminGroceryIntegrations() {
  const [data, setData] = useState<IntegrationsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ data: IntegrationsPayload }>(
      "/api/admin/grocery/integrations"
    )
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      );
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API integrations</CardTitle>
        </CardHeader>
        <p className="px-5 pb-5 text-sm text-destructive">{error}</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API integrations</CardTitle>
        </CardHeader>
        <p className="px-5 pb-5 text-sm text-muted-foreground">
          Checking integration health…
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API integrations</CardTitle>
      </CardHeader>
      <div className="space-y-4 px-5 pb-5">
        <div
          className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-sm ${
            data.needsWorkCount === 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          {data.needsWorkCount === 0 ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          )}
          <div>
            <p className="font-medium">{data.summary}</p>
            <p className="mt-1 text-xs opacity-80">
              Mode: {data.mode}
              {data.usingFallbackPrices
                ? " · price search may use local fallbacks"
                : ""}
              {!data.mapsConfigured
                ? " · Maps key missing for area store lookup"
                : ""}
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {data.providers.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{p.label}</p>
                {p.health === "needs-setup" ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.hint}</p>
                ) : p.id === "aldi" && data.aldiCatalogue ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {data.aldiCatalogue.productCount} products stored
                    {data.aldiCatalogue.lastSyncedAt
                      ? ` · last sync ${new Date(data.aldiCatalogue.lastSyncedAt).toLocaleDateString()}`
                      : " · not synced yet"}
                    {data.aldiCatalogue.isDue ? " · Wednesday refresh due" : ""}
                  </p>
                ) : null}
              </div>
              <Badge
                className={
                  p.health === "live"
                    ? "bg-emerald-500/15 text-emerald-700"
                    : "bg-amber-500/15 text-amber-800"
                }
              >
                {p.health === "live" ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    Needs setup
                  </span>
                )}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
