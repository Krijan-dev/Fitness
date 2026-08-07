"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound } from "lucide-react";

interface ProviderStatus {
  id: string;
  label: string;
  configured: boolean;
  live: boolean;
  hint: string;
}

interface StatusPayload {
  mode: string;
  usingMockPrices: boolean;
  usingDemoStores: boolean;
  providers: ProviderStatus[];
  setupHint: string;
}

export function GroceryDataSourceBanner() {
  const [status, setStatus] = useState<StatusPayload | null>(null);

  useEffect(() => {
    void fetch("/api/grocery/status")
      .then((r) => r.json())
      .then((body) => setStatus(body.data))
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  const needsSetup = status.usingMockPrices || status.usingDemoStores;

  if (!needsSetup) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium text-emerald-100">Live grocery data connected</p>
          <p className="mt-1 text-xs text-emerald-200/80">
            {status.providers
              .filter((p) => p.live)
              .map((p) => p.label)
              .join(" · ")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div className="space-y-2">
          <p className="font-medium">
            Showing sample data — live API keys are not loaded
          </p>
          <p className="text-xs text-amber-100/80">{status.setupHint}</p>
          <ul className="space-y-1 text-xs text-amber-100/90">
            {status.providers.map((p) => (
              <li key={p.id} className="flex flex-wrap gap-2">
                <span className="font-medium">{p.label}:</span>
                <span className={p.live ? "text-emerald-300" : "text-amber-200"}>
                  {p.live ? "live" : "not configured"}
                </span>
                {!p.live ? (
                  <span className="text-amber-100/70">— {p.hint}</span>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-1.5 text-xs text-amber-100/80">
            <KeyRound className="h-3.5 w-3.5" />
            Put keys in <code className="rounded bg-black/20 px-1">.env.local</code>,
            then restart <code className="rounded bg-black/20 px-1">npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
