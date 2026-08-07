"use client";

import type { StoreProductPrice } from "@/types/price";
import { formatCurrency } from "@/utils/currency";
import { STORE_LABELS } from "@/features/price-comparison/constants";
import { DataSourceBadge } from "./DataSourceBadge";
import { ProductThumbnail } from "@/components/grocery/ProductThumbnail";
import { StoreBadge } from "@/components/grocery/StoreBadge";

interface PriceOptionRowProps {
  price: StoreProductPrice;
  isSelected: boolean;
  onSelect: () => void;
}

export function PriceOptionRow({
  price,
  isSelected,
  onSelect,
}: PriceOptionRowProps) {
  const updated = new Date(price.lastUpdated).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/50"
      }`}
    >
      <input
        type="radio"
        checked={isSelected}
        onChange={onSelect}
        className="mt-1 accent-primary"
        aria-label={`Select ${price.productName} from ${STORE_LABELS[price.store]}`}
      />
      <ProductThumbnail src={price.imageUrl} alt={price.productName} size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StoreBadge store={price.store} />
          <span className="text-sm font-medium">{price.productName}</span>
          <DataSourceBadge source={price.dataSource} />
          {price.isOnSpecial ? (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
              Special
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {price.brand ? `${price.brand}` : ""}
          {price.brand && price.size ? " · " : ""}
          {price.size ?? ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatCurrency(price.currentPrice)}
          </span>
          {price.regularPrice && price.regularPrice > price.currentPrice ? (
            <span className="line-through">
              Was {formatCurrency(price.regularPrice)}
            </span>
          ) : null}
          {price.unitPrice ? (
            <span>
              {formatCurrency(price.unitPrice)} {price.unitLabel ?? ""}
            </span>
          ) : null}
          {price.discountPercentage ? (
            <span className="text-success">-{price.discountPercentage}%</span>
          ) : null}
          {price.availability ? (
            <span>{price.availability.replace("-", " ")}</span>
          ) : null}
          <span>Updated {updated}</span>
          {price.catalogueExpiresAt ? (
            <span>
              Catalogue until{" "}
              {new Date(price.catalogueExpiresAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
              })}
            </span>
          ) : null}
        </div>
        {price.productUrl ? (
          <a
            href={price.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View product
          </a>
        ) : null}
      </div>
    </label>
  );
}
