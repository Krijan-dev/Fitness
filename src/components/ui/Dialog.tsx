"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className={`w-[calc(100%-2rem)] ${sizeMap[size]} rounded-2xl border border-border bg-surface p-0 text-foreground shadow-soft backdrop:bg-black/60`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
