"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { APP_NAME } from "@/utils/constants";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-primary-foreground">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, #0b1220 0%, #1e1b4b 45%, #312e81 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.45), transparent 40%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.25), transparent 35%), radial-gradient(circle at 70% 80%, rgba(168,85,247,0.2), transparent 40%)",
          }}
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur">
              M
            </div>
            <span className="text-xl font-semibold tracking-tight">{APP_NAME}</span>
          </div>
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Plan meals. Track macros. Shop smarter.
          </h1>
          <p className="text-base text-white/75">
            Your personal meal prep workspace with recipes, daily tracking,
            shopping lists, and progress — synced securely across devices.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/50">
          Secure multi-user SaaS · JWT auth · MongoDB
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/login" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
                M
              </div>
              <span className="font-semibold">{APP_NAME}</span>
            </Link>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-xl backdrop-blur sm:p-8">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PasswordInput({
  label,
  value,
  onChange,
  error,
  autoComplete,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  id?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            error ? "border-destructive" : ""
          }`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function AuthFormMessage({
  tone,
  message,
}: {
  tone: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-success/40 bg-success/10 text-success"
      }`}
      role="alert"
    >
      {message}
    </div>
  );
}

export { Link, useRouter, useState, Button, Input };
export type { FormEvent };
