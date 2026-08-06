"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { LoadingState } from "@/components/common/LoadingState";

export default function AdminShoppingPage() {
  const [stats, setStats] = useState<{ shoppingItems: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiGet<{
      data: { totals: { shoppingItems: number } };
    }>("/api/admin/stats")
      .then((res) => setStats({ shoppingItems: res.data.totals.shoppingItems }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shopping</h1>
        <p className="text-sm text-zinc-400">
          Aggregate shopping list volume across all users.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
        {loading ? (
          <LoadingState message="Loading..." />
        ) : (
          <div>
            <p className="text-sm text-zinc-400">Total shopping items</p>
            <p className="mt-2 text-4xl font-semibold">
              {stats?.shoppingItems ?? 0}
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Open a user profile to inspect their shopping list in detail.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
