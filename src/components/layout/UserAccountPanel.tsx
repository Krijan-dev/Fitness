"use client";

import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import type { PublicUser } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import { accountInitials } from "./account-initials";

interface UserAccountPanelProps {
  user: PublicUser | null;
  compact?: boolean;
  showAdminLink?: boolean;
  onNavigate?: () => void;
}

export function UserAccountPanel({
  user,
  compact = false,
  showAdminLink = true,
  onNavigate,
}: UserAccountPanelProps) {
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const handleLogout = () => {
    onNavigate?.();
    void logout().then(() => {
      window.location.href = "/login";
    });
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 px-1 py-1">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700"
          title={`${user.name} · ${user.email}`}
        >
          {accountInitials(user.name)}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex min-w-0 items-center gap-3 px-2 py-1.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700"
          aria-hidden="true"
        >
          {accountInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-5 text-foreground">
            {user.name}
          </p>
          <p
            className="truncate text-[11px] leading-4 text-muted-foreground"
            title={user.email}
          >
            {user.email}
          </p>
        </div>
      </div>

      {showAdminLink && user.role === "admin" ? (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          <Shield className="h-4 w-4 shrink-0" />
          Admin portal
        </Link>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-700"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Log out
      </button>
    </div>
  );
}
