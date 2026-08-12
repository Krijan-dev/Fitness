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
  isBestPrice?: boolean;
  onSelect: () => void;
}

export function PriceOptionRow({
  price,
  isSelected,
  isBestPrice = false,
  onSelect,
}: PriceOptionRowProps) {
  const updated = new Date(price.lastUpdated).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const savings =
    price.regularPrice != null && price.regularPrice > price.currentPrice
      ? price.regularPrice - price.currentPrice
      : null;

  const highlight = isBestPrice || isSelected;

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all duration-200 ${
        isBestPrice
          ? "border-2 border-emerald-500 bg-emerald-50/40 shadow-emerald-ring"
          : highlight
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-slate-100 hover:border-slate-200 hover:shadow-lg"
      }`}
    >
      <input
        type="radio"
        checked={isSelected}
        onChange={onSelect}
        className="mt-1 accent-emerald-600"
        aria-label={`Select ${price.productName} from ${STORE_LABELS[price.store]}`}
      />
      <ProductThumbnail src={price.imageUrl} alt={price.productName} size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StoreBadge store={price.store} />
          {isBestPrice ? (
            <span className="pill-best inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              Best Price
            </span>
          ) : null}
          <span className="text-sm font-semibold text-slate-900">
            {price.productName}
          </span>
          <DataSourceBadge source={price.dataSource} />
          {price.isOnSpecial ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Special
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {price.brand ? `${price.brand}` : ""}
          {price.brand && price.size ? " · " : ""}
          {price.size ?? ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`text-lg font-bold tabular-nums tracking-tight ${
              isBestPrice ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            {formatCurrency(price.currentPrice)}
          </span>
          {price.regularPrice && price.regularPrice > price.currentPrice ? (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(price.regularPrice)}
            </span>
          ) : null}
          {price.unitPrice != null ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {formatCurrency(price.unitPrice)} {price.unitLabel ?? ""}
            </span>
          ) : null}
          {savings != null && savings > 0 ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              You Save {formatCurrency(savings)}
            </span>
          ) : null}
          {price.discountPercentage ? (
            <span className="text-xs font-medium text-emerald-700">
              -{price.discountPercentage}%
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
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
            className="mt-1 inline-block text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View product
          </a>
        ) : null}
      </div>
    </label>
  );
}
