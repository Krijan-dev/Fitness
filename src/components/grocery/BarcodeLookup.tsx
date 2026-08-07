"use client";

import { useState } from "react";
import { ScanBarcode, Search } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ProductThumbnail } from "@/components/grocery/ProductThumbnail";
import type { GroceryProduct } from "@/types/grocery";
import type { StoreProductPrice } from "@/types/price";
import { groceryToPriceOption } from "@/components/grocery/grocery-client-mappers";
import { formatCurrency } from "@/utils/currency";

interface BarcodeLookupProps {
  location?: string;
  onMatchedPrices?: (prices: StoreProductPrice[], query: string) => void;
}

export function BarcodeLookup({
  location = "Canberra",
  onMatchedPrices,
}: BarcodeLookupProps) {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<GroceryProduct | null>(null);
  const [matches, setMatches] = useState<GroceryProduct[]>([]);

  const lookup = async () => {
    const code = barcode.trim();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/grocery/barcode?barcode=${encodeURIComponent(code)}`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Lookup failed");
      setMetadata(body.data.metadata);
      setMatches(body.data.storeMatches ?? []);

      if (onMatchedPrices) {
        const query = body.data.metadata?.name ?? code;
        const prices = (body.data.storeMatches as GroceryProduct[])
          .map((p) => groceryToPriceOption(p, query, location))
          .filter((p): p is StoreProductPrice => p != null);
        onMatchedPrices(prices, query);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
      setMetadata(null);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ScanBarcode className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Barcode lookup</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Uses Open Food Facts for product metadata and images, then matches
        supermarket prices.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter barcode (EAN/UPC)"
          className="flex-1 min-w-[160px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") void lookup();
          }}
        />
        <Button onClick={() => void lookup()} disabled={loading || !barcode.trim()}>
          <Search className="h-4 w-4" />
          {loading ? "Looking up…" : "Lookup"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {metadata ? (
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 text-sm">
          <ProductThumbnail
            src={metadata.imageUrl}
            alt={metadata.name}
            size={48}
          />
          <div className="min-w-0">
            <p className="font-medium truncate">{metadata.name}</p>
            <p className="text-xs text-muted-foreground">
              {metadata.brand ? `${metadata.brand} · ` : ""}
              {metadata.barcode}
              {metadata.size ? ` · ${metadata.size}` : ""}
            </p>
          </div>
        </div>
      ) : null}
      {matches.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {matches.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <ProductThumbnail src={m.imageUrl} alt={m.name} size={40} />
              <span className="min-w-0 flex-1 truncate">
                {m.store} · {m.name}
                {m.isOnSpecial ? (
                  <span className="ml-2 text-xs text-success">Special</span>
                ) : null}
              </span>
              <span className="shrink-0 font-medium">
                {m.currentPrice != null ? formatCurrency(m.currentPrice) : "—"}
              </span>
            </li>
          ))}
        </ul>
      ) : metadata && !loading ? (
        <p className="text-xs text-muted-foreground">
          No supermarket price matches yet. Try comparing by product name.
        </p>
      ) : null}
    </div>
  );
}
