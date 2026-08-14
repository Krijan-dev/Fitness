"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Upload, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { AdminGroceryIntegrations } from "@/components/admin/AdminGroceryIntegrations";
import { apiGet, apiSend } from "@/lib/api-client";

interface SyncStatus {
  lastSyncedAt: string | null;
  nextWednesdayRefreshAt: string;
  productCount?: number;
  specialsCount?: number;
  providers: {
    name: string;
    status: "ok" | "skipped" | "error";
    message?: string;
    productCount?: number;
  }[];
}

interface ProductRow {
  id: string;
  name: string;
  store: string;
  currentPrice?: number;
  regularPrice?: number;
  isOnSpecial?: boolean;
  size?: string;
  barcode?: string;
  lastSyncedAt?: string;
  dataSource?: string;
  catalogueExpiresAt?: string;
}

export default function AdminGroceryPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, productsRes] = await Promise.all([
        apiGet<{ data: SyncStatus }>("/api/admin/grocery/status"),
        apiGet<{ data: ProductRow[] }>(
          `/api/admin/grocery/products?limit=50${q ? `&q=${encodeURIComponent(q)}` : ""}`
        ),
      ]);
      setStatus(statusRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await apiSend<{ data: SyncStatus }>(
        "/api/admin/grocery/refresh",
        "POST",
        {}
      );
      setStatus(res.data);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const currentPrice = Number(editPrice);
    if (!Number.isFinite(currentPrice)) return;
    await apiSend("/api/admin/grocery/products", "PATCH", {
      id: editing.id,
      currentPrice,
    });
    setEditing(null);
    await load();
  };

  if (loading && !status) {
    return <LoadingState message="Loading grocery admin…" />;
  }

  if (error && !status) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grocery management"
        description="Synchronised supermarket products, weekly catalogue refresh, and manual price edits."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/grocery/upload">
              <Button variant="secondary">
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            </Link>
            <Button onClick={() => void triggerRefresh()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Trigger weekly refresh
            </Button>
          </div>
        }
      />

      <AdminGroceryIntegrations />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Last successful sync</CardTitle>
          </CardHeader>
          <p className="px-5 pb-5 text-lg font-semibold">
            {status?.lastSyncedAt
              ? new Date(status.lastSyncedAt).toLocaleString("en-AU")
              : "Never"}
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Next Wednesday refresh</CardTitle>
          </CardHeader>
          <p className="px-5 pb-5 text-lg font-semibold">
            {status?.nextWednesdayRefreshAt
              ? new Date(status.nextWednesdayRefreshAt).toLocaleDateString(
                  "en-AU",
                  { weekday: "long", day: "numeric", month: "short" }
                )
              : "—"}
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Catalogue products</CardTitle>
          </CardHeader>
          <p className="px-5 pb-5 text-lg font-semibold">
            {status?.productCount ?? products.length}
            {status?.specialsCount != null ? (
              <span className="ml-2 text-sm font-normal text-emerald-700">
                {status.specialsCount} specials
              </span>
            ) : null}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider status</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 space-y-2">
          {(status?.providers ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No refresh has been run yet. Trigger a weekly refresh to populate.
            </p>
          ) : (
            status?.providers.map((p) => (
              <div
                key={p.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span>{p.name}</span>
                <div className="flex items-center gap-2">
                  {p.productCount != null ? (
                    <span className="text-muted-foreground">{p.productCount} products</span>
                  ) : null}
                  <Badge
                    className={
                      p.status === "ok"
                        ? "bg-emerald-500/15 text-emerald-700"
                        : p.status === "skipped"
                          ? "bg-slate-500/15 text-muted-foreground"
                          : "bg-rose-500/15 text-rose-300"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synchronised products</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or barcode"
              className="flex-1 min-w-[180px] rounded-xl border border-border bg-muted px-3 py-2 text-sm"
            />
            <Button variant="secondary" onClick={() => void load()}>
              Search
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Store</th>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2 pr-3 capitalize">{p.store}</td>
                    <td className="py-2 pr-3">
                      {p.name}
                      {p.isOnSpecial ? (
                        <span className="ml-2 text-xs text-emerald-700">Special</span>
                      ) : null}
                      {p.size ? (
                        <span className="block text-xs text-muted-foreground">{p.size}</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3">
                      {p.currentPrice != null ? `$${p.currentPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{p.dataSource}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                        onClick={() => {
                          setEditing(p);
                          setEditPrice(String(p.currentPrice ?? ""));
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Edit price</h3>
            <p className="text-sm text-muted-foreground">{editing.name}</p>
            <input
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={() => void saveEdit()}>Save</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
