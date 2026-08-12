"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-20 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 lg:bottom-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.tone === "success"
                ? "border-success/30 bg-card text-foreground"
                : toast.tone === "error"
                  ? "border-destructive/40 bg-card text-foreground"
                  : "border-border bg-card text-foreground"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p>{toast.message}</p>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toasts: [] as Toast[],
      push: () => undefined,
      dismiss: () => undefined,
    };
  }
  return ctx;
}
