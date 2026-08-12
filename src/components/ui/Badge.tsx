import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "accent" | "savings";
  className?: string;
}

const tones = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  savings: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
  accent: "bg-emerald-50 text-emerald-700",
};

export function Badge({ children, tone = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
