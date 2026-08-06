"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiSend } from "@/lib/api-client";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useToast } from "@/components/common/Toast";
import type { Recipe } from "@/types/recipe";
import type { MealEntry, WeeklyMealPlan } from "@/types/meal";
import type { ShoppingItem } from "@/types/shopping";
import type { PantryItem } from "@/types/pantry";
import type { WeightEntry } from "@/types/weight";
import type { UserSettings } from "@/types/settings";

interface UserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string | null;
    lastActivityAt: string | null;
    disabled: boolean;
  };
  recipes: Recipe[];
  meals: MealEntry[];
  mealPlans: (WeeklyMealPlan | null)[];
  shopping: ShoppingItem[];
  pantry: PantryItem[];
  weights: WeightEntry[];
  settings: UserSettings;
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [data, setData] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void apiGet<{ data: UserDetail }>(`/api/admin/users/${params.id}`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load user")
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  async function deleteUser() {
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${params.id}`, "DELETE");
      push("User deleted", "success");
      window.location.href = "/admin/users";
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState message="Loading user..." />;
  if (error || !data) {
    return <ErrorState title="User not found" message={error || ""} />;
  }

  const { user } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-sm text-indigo-300 hover:underline"
          >
            ← Back to users
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {user.name}
          </h1>
          <p className="text-sm text-zinc-400">{user.email}</p>
        </div>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Delete user
        </Button>
      </div>

      <Section title="Profile">
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <Item label="Role" value={user.role} />
          <Item
            label="Status"
            value={user.disabled ? "Disabled" : "Active"}
          />
          <Item
            label="Created"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "—"
            }
          />
          <Item
            label="Last activity"
            value={
              user.lastActivityAt
                ? new Date(user.lastActivityAt).toLocaleString()
                : "—"
            }
          />
        </dl>
      </Section>

      <Section title={`Recipes (${data.recipes.length})`}>
        <ReadOnlyList
          empty="No recipes"
          items={data.recipes.map((r) => `${r.name} · ${r.category}`)}
        />
      </Section>

      <Section title={`Daily tracker (${data.meals.length})`}>
        <ReadOnlyList
          empty="No meals logged"
          items={data.meals
            .slice(0, 50)
            .map((m) => `${m.date} · ${m.mealType} · ${m.name}`)}
        />
      </Section>

      <Section title={`Meal plans (${data.mealPlans.filter(Boolean).length})`}>
        <ReadOnlyList
          empty="No meal plans"
          items={data.mealPlans
            .filter(Boolean)
            .map(
              (p) =>
                `Week of ${p!.weekStart} · ${p!.meals.length} planned meals`
            )}
        />
      </Section>

      <Section title={`Shopping (${data.shopping.length})`}>
        <ReadOnlyList
          empty="No shopping items"
          items={data.shopping.map(
            (i) => `${i.name} · ${i.quantity}${i.unit} · ${i.purchased ? "bought" : "open"}`
          )}
        />
      </Section>

      <Section title={`Pantry (${data.pantry.length})`}>
        <ReadOnlyList
          empty="No pantry items"
          items={data.pantry.map(
            (i) => `${i.name} · ${i.quantity}${i.unit}`
          )}
        />
      </Section>

      <Section title={`Weight history (${data.weights.length})`}>
        <ReadOnlyList
          empty="No weight entries"
          items={data.weights.map((w) => `${w.date} · ${w.weight} kg`)}
        />
      </Section>

      <Section title="Settings">
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <Item
            label="Display name"
            value={data.settings.profile.displayName || "—"}
          />
          <Item label="Theme" value={data.settings.theme} />
          <Item
            label="Calorie goal"
            value={String(data.settings.nutritionGoals.dailyCalorieGoal)}
          />
          <Item
            label="Protein goal"
            value={String(data.settings.nutritionGoals.dailyProteinGoal)}
          />
          <Item
            label="Location"
            value={`${data.settings.location.city}, ${data.settings.location.state}`}
          />
        </dl>
      </Section>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void deleteUser()}
        title="Delete user"
        description="This permanently deletes the user and all associated data."
        confirmLabel="Delete"
        isDestructive
        isLoading={busy}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-0.5 capitalize text-zinc-100">{value}</dd>
    </div>
  );
}

function ReadOnlyList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2 text-sm text-zinc-300">
      {items.map((item) => (
        <li key={item} className="rounded-lg bg-white/5 px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}
