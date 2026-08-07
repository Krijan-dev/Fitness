"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/common/Button";
import type { NearbyStore } from "@/types/grocery";

interface NearbyStoresPanelProps {
  location: string;
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
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Nearby stores</h3>
        </div>
        <Button variant="secondary" onClick={useMyLocation} disabled={loading}>
          <Navigation className="h-4 w-4" />
          Use my location
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Nearest Coles, Woolworths, ALDI, and IGA
        {source ? ` · source: ${source}` : ""}.
      </p>
      {notice ? (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {notice}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Finding stores…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stores found nearby.</p>
      ) : (
        <ul className="space-y-2">
          {stores.map((store) => (
            <li
              key={store.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.address}</p>
                {store.storeId ? (
                  <p className="text-[10px] text-muted-foreground/80">
                    Store ID {store.storeId}
                    {store.postcode ? ` · ${store.postcode}` : ""}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs font-medium text-primary">
                {(store.distanceMeters / 1000).toFixed(1)} km
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
