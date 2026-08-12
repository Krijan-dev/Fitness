"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StoreBadge } from "@/components/grocery/StoreBadge";
import type { NearbyStore } from "@/types/grocery";
import type { StoreName } from "@/types/common";

interface AreaStoresPanelProps {
  city: string;
  postcode?: string;
}

function chainToStoreName(chain: NearbyStore["chain"]): StoreName | null {
  if (chain === "other") return null;
  return chain;
}

/**
 * Shows Coles / Woolworths / ALDI / IGA near the user's saved settings location.
 * No geolocation “finder” — area comes from Settings.
 */
export function AreaStoresPanel({ city, postcode }: AreaStoresPanelProps) {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!city.trim()) {
      setStores([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ location: city.trim() });
      if (postcode?.trim()) params.set("postcode", postcode.trim());
      const res = await fetch(`/api/grocery/nearby-stores?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to load stores");
      setStores(body.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [city, postcode]);

  useEffect(() => {
    void load();
  }, [load]);

  const areaLabel = [city, postcode].filter(Boolean).join(" ");

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-foreground">
            Stores in your area
          </h3>
        </div>
        <Link
          href="/settings"
          className="text-xs font-medium text-emerald-700 hover:underline"
        >
          Change location
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing Coles, Woolworths, ALDI, and IGA near{" "}
        <span className="font-medium text-foreground">{areaLabel || "your location"}</span>
        .
      </p>
      {loading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">
          Couldn’t load stores for this area. Check your location in Settings.
        </p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No stores found for {areaLabel || "this location"}. Update your city
          or postcode in Settings.
        </p>
      ) : (
        <ul className="space-y-2">
          {stores.map((store) => {
            const brand = chainToStoreName(store.chain);
            return (
              <li
                key={store.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm transition-all duration-200 hover:shadow-lg"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {brand ? <StoreBadge store={brand} /> : null}
                    <p className="font-medium text-foreground">{store.name}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {store.address}
                  </p>
                </div>
                {store.distanceMeters > 0 ? (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {(store.distanceMeters / 1000).toFixed(1)} km
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
