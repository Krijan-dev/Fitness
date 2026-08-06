"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ops"
        title="Admin settings"
        description="Operational controls for MealPrep Pro."
      />
      <Card className="space-y-4 text-sm text-slate-300">
        <p>
          Seed an admin account with{" "}
          <code className="text-emerald-300">npm run seed:admin</code> using{" "}
          <code className="text-emerald-300">ADMIN_EMAIL</code> /{" "}
          <code className="text-emerald-300">ADMIN_PASSWORD</code>.
        </p>
        <p>
          JWT sessions last 7 days in HTTP-only cookies (
          <code className="text-emerald-300">sameSite=lax</code>).
        </p>
        <p>
          Manage users from{" "}
          <Link href="/admin/users" className="text-emerald-300 hover:underline">
            Users
          </Link>{" "}
          and publish global recipes from{" "}
          <Link
            href="/admin/recipes/new"
            className="text-emerald-300 hover:underline"
          >
            Recipe Upload
          </Link>
          .
        </p>
      </Card>
    </>
  );
}
