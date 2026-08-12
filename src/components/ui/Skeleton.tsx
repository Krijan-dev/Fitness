export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer animate-pulse bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="surface-card space-y-3 rounded-2xl border border-border bg-card p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/** Product-result grid skeleton while grocery/price APIs load */
export function ProductSearchSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="surface-card space-y-3 rounded-2xl border border-border bg-card p-4"
        >
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PriceRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading prices">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-2xl border border-border p-3"
        >
          <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
