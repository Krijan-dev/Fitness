"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { LoadingState } from "@/components/common/LoadingState";

interface ActivityItem {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  at?: string;
}

function AdminActivityPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiGet<{ data: ActivityItem[] }>("/api/admin/activity?limit=40")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        {loading ? (
          <LoadingState message="Loading activity..." />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={`${item.type}-${item.id}-${item.at}`}
                className="rounded-xl bg-white/5 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-zinc-400">{item.subtitle}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                      {item.type.replace("_", " ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {item.at ? new Date(item.at).toLocaleString() : "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminTrackerPage() {
  return (
    <AdminActivityPage
      title="Tracker activity"
      description="Recent platform activity relevant to daily tracking and engagement."
    />
  );
}
