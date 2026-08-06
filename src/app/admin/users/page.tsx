"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api-client";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingState } from "@/components/common/LoadingState";
import { useToast } from "@/components/common/Toast";
import { useDebounce } from "@/hooks/useDebounce";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string | null;
  lastActivityAt: string | null;
  disabled: boolean;
}

export default function AdminUsersPage() {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{
        data: AdminUser[];
        pagination: { totalPages: number };
      }>(
        `/api/admin/users?page=${page}&limit=10&q=${encodeURIComponent(debounced)}`
      );
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debounced, push]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeRole(user: AdminUser) {
    const role = user.role === "admin" ? "user" : "admin";
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${user.id}`, "PATCH", {
        action: "role",
        role,
      });
      push(`Role updated to ${role}`, "success");
      await load();
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDisable(user: AdminUser) {
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${user.id}`, "PATCH", {
        action: "disable",
        disabled: !user.disabled,
      });
      push(user.disabled ? "Account enabled" : "Account disabled", "success");
      await load();
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${pendingDelete.id}`, "DELETE");
      push("User deleted", "success");
      setPendingDelete(null);
      await load();
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset() {
    if (!resetUser || newPassword.length < 8) {
      push("Password must be at least 8 characters", "error");
      return;
    }
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${resetUser.id}`, "PATCH", {
        action: "reset-password",
        password: newPassword,
      });
      push("Password reset", "success");
      setResetUser(null);
      setNewPassword("");
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-zinc-400">
            Search, manage roles, and review accounts.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search name or email"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading users..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Last activity</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.name}</div>
                      {user.disabled ? (
                        <span className="text-xs text-amber-400">Disabled</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {user.lastActivityAt
                        ? new Date(user.lastActivityAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-md px-2 py-1 text-xs text-indigo-300 hover:bg-white/5"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                          onClick={() => void changeRole(user)}
                          disabled={busy}
                        >
                          Role
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                          onClick={() => setResetUser(user)}
                        >
                          Reset pw
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-amber-300 hover:bg-white/5"
                          onClick={() => void toggleDisable(user)}
                          disabled={busy}
                        >
                          {user.disabled ? "Enable" : "Disable"}
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-red-300 hover:bg-white/5"
                          onClick={() => setPendingDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-zinc-400">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete user"
        description={`Permanently delete ${pendingDelete?.name} and all their data? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={busy}
      />

      <ConfirmDialog
        isOpen={Boolean(resetUser)}
        onClose={() => {
          setResetUser(null);
          setNewPassword("");
        }}
        onConfirm={() => void confirmReset()}
        title="Reset password"
        description={`Set a new password for ${resetUser?.email}.`}
        confirmLabel="Reset"
        isLoading={busy}
      />
      {resetUser ? (
        <div className="fixed inset-x-0 bottom-6 z-[60] mx-auto w-full max-w-md px-4">
          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-4 shadow-2xl">
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
