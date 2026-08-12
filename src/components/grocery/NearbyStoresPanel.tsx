"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StoreBadge } from "@/components/grocery/StoreBadge";
import type { NearbyStore } from "@/types/grocery";
import type { StoreName } from "@/types/common";

interface NearbyStoresPanelProps {
  location: string;
}

function chainToStoreName(chain: NearbyStore["chain"]): StoreName | null {
  if (chain === "other") return null;
  return chain;
}

export function NearbyStoresPanel({ location }: NearbyStoresPanelProps) {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(
    async (coords?: { lat: number; lng: number }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ location });
        if (coords) {
          params.set("lat", String(coords.lat));
          params.set("lng", String(coords.lng));
        }
        const res = await fetch(`/api/grocery/nearby-stores?${params}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Failed to load stores");
        setStores(body.data ?? []);
        setSource(body.source ?? null);
        setNotice(typeof body.notice === "string" ? body.notice : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stores");
        setStores([]);
        setNotice(null);
      } finally {
        setLoading(false);
      }
    },
    [location]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void load({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError("Unable to read your location.")
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-foreground">Nearby stores</h3>
        </div>
        <Button variant="outline" onClick={useMyLocation} disabled={loading}>
          <Navigation className="h-4 w-4" />
          Use my location
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Nearest Coles, Woolworths, ALDI, and IGA
        {source ? ` · source: ${source}` : ""}.
      </p>
      {notice ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {notice}
        </p>
      ) : null}
      {loading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stores found nearby.</p>
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
                  {store.storeId ? (
                    <p className="text-[10px] text-text-muted">
                      Store ID {store.storeId}
                      {store.postcode ? ` · ${store.postcode}` : ""}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {(store.distanceMeters / 1000).toFixed(1)} km
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
