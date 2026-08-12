"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api-client";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Modal } from "@/components/common/Modal";
import { LoadingState } from "@/components/common/LoadingState";
import { useToast } from "@/components/common/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Select } from "@/components/ui/Select";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string | null;
  lastActivityAt: string | null;
  disabled: boolean;
}

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleUser, setRoleUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
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

  function openRoleDialog(user: AdminUser) {
    setRoleUser(user);
    setSelectedRole(user.role);
  }

  function openResetDialog(user: AdminUser) {
    setResetUser(user);
    setNewPassword("");
    setConfirmPassword("");
  }

  async function saveRole() {
    if (!roleUser) return;
    if (selectedRole === roleUser.role) {
      setRoleUser(null);
      return;
    }
    setBusy(true);
    try {
      await apiSend(`/api/admin/users/${roleUser.id}`, "PATCH", {
        action: "role",
        role: selectedRole,
      });
      push(`Role updated to ${selectedRole}`, "success");
      setRoleUser(null);
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
    if (!resetUser) return;
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
      await apiSend(`/api/admin/users/${resetUser.id}`, "PATCH", {
        action: "reset-password",
        password: newPassword,
      });
      push("Password reset successfully", "success");
      setResetUser(null);
      setNewPassword("");
      setConfirmPassword("");
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
          <p className="text-sm text-muted-foreground">
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

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading users..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
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
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.lastActivityAt
                        ? new Date(user.lastActivityAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-md px-2 py-1 text-xs text-emerald-700 hover:bg-muted"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                          onClick={() => openRoleDialog(user)}
                          disabled={busy}
                        >
                          Change role
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                          onClick={() => openResetDialog(user)}
                        >
                          Reset password
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-amber-700 hover:bg-muted"
                          onClick={() => void toggleDisable(user)}
                          disabled={busy}
                        >
                          {user.disabled ? "Enable" : "Disable"}
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-rose-700 hover:bg-muted"
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
        <span className="text-sm text-muted-foreground">
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

      <Modal
        isOpen={Boolean(roleUser)}
        onClose={() => setRoleUser(null)}
        title="Change role"
        description={
          roleUser
            ? `Choose a role for ${roleUser.name} (${roleUser.email}).`
            : undefined
        }
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Role"
            value={selectedRole}
            options={ROLE_OPTIONS}
            onChange={(e) =>
              setSelectedRole(e.target.value as "user" | "admin")
            }
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setRoleUser(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={() => void saveRole()} isLoading={busy}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(resetUser)}
        onClose={() => {
          setResetUser(null);
          setNewPassword("");
          setConfirmPassword("");
        }}
        title="Reset password"
        description={
          resetUser
            ? `Enter a new password for ${resetUser.name} (${resetUser.email}).`
            : undefined
        }
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
                setResetUser(null);
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
