"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { LoadingState } from "@/components/common/LoadingState";

export default function AdminWeightsPage() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiGet<{
      data: { totals: { weightEntries: number } };
    }>("/api/admin/stats")
      .then((res) => setCount(res.data.totals.weightEntries))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Weights</h1>
        <p className="text-sm text-zinc-400">
          Platform-wide weight tracking volume.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
        {loading ? (
          <LoadingState message="Loading..." />
        ) : (
          <div>
            <p className="text-sm text-zinc-400">Total weight entries</p>
            <p className="mt-2 text-4xl font-semibold">{count}</p>
          </div>
        )}
      </div>
    </div>
  );
}
