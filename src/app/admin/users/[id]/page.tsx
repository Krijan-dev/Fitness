"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiSend } from "@/lib/api-client";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useToast } from "@/components/common/Toast";
import { Select } from "@/components/ui/Select";
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

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [data, setData] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void apiGet<{ data: UserDetail }>(`/api/admin/users/${params.id}`)
      .then((res) => {
        setData(res.data);
        setSelectedRole(res.data.user.role === "admin" ? "admin" : "user");
      })
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

  async function saveRole() {
    if (!data) return;
    if (selectedRole === data.user.role) {
      push("Role is already set to that value", "success");
      return;
    }
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${params.id}`, "PATCH", {
        action: "role",
        role: selectedRole,
      });
      setData({
        ...data,
        user: { ...data.user, role: selectedRole },
      });
      push(`Role updated to ${selectedRole}`, "success");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset() {
    if (newPassword.length < 8) {
      push("Password must be at least 8 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      push("Passwords do not match", "error");
      return;
    }
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${params.id}`, "PATCH", {
        action: "reset-password",
        password: newPassword,
      });
      push("Password reset successfully", "success");
      setResetOpen(false);
      setNewPassword("");
      setConfirmPassword("");
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
            className="text-sm text-emerald-700 hover:underline"
          >
            ← Back to users
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {user.name}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setNewPassword("");
              setConfirmPassword("");
              setResetOpen(true);
            }}
          >
            Reset password
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete user
          </Button>
        </div>
      </div>

      <Section title="Profile">
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
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

        <div className="mt-6 max-w-sm space-y-3 border-t border-border pt-5">
          <Select
            label="Role"
            value={selectedRole}
            options={ROLE_OPTIONS}
            onChange={(e) =>
              setSelectedRole(e.target.value as "user" | "admin")
            }
          />
          <Button
            onClick={() => void saveRole()}
            isLoading={busy}
            disabled={selectedRole === user.role}
          >
            Save role
          </Button>
        </div>
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
            (i) =>
              `${i.name} · ${i.quantity}${i.unit} · ${i.purchased ? "bought" : "open"}`
          )}
        />
      </Section>

      <Section title={`Pantry (${data.pantry.length})`}>
        <ReadOnlyList
          empty="No pantry items"
          items={data.pantry.map((i) => `${i.name} · ${i.quantity}${i.unit}`)}
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
            label="Age / sex"
            value={
              data.settings.profile.age
                ? `${data.settings.profile.age} · ${data.settings.profile.gender ?? "—"}`
                : "—"
            }
          />
          <Item
            label="Goal"
            value={data.settings.profile.goal ?? "—"}
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

      <Modal
        isOpen={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setNewPassword("");
          setConfirmPassword("");
        }}
        title="Reset password"
        description={`Enter a new password for ${user.name} (${user.email}).`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="At least 8 characters"
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setResetOpen(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={() => void confirmReset()} isLoading={busy}>
              Reset password
            </Button>
          </div>
        </div>
      </Modal>
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
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 capitalize text-foreground">{value}</dd>
    </div>
  );
}

function ReadOnlyList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="rounded-lg bg-muted px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}
