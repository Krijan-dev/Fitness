"use client";

import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin settings</h1>
        <p className="text-sm text-zinc-400">
          Environment and operational controls for MealPrep Pro.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#111827] p-6 space-y-4 text-sm text-zinc-300">
        <p>
          Admin accounts are seeded with <code className="text-indigo-300">npm run seed:admin</code>{" "}
          using <code className="text-indigo-300">ADMIN_EMAIL</code> and{" "}
          <code className="text-indigo-300">ADMIN_PASSWORD</code>.
        </p>
        <p>
          JWT sessions last 7 days and are stored in HTTP-only cookies (
          <code className="text-indigo-300">sameSite=lax</code>).
        </p>
        <p>
          Review individual user settings from the{" "}
          <Link href="/admin/users" className="text-indigo-300 hover:underline">
            Users
          </Link>{" "}
          management screen.
        </p>
      </div>
    </div>
  );
}
