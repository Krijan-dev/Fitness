"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api-client";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/components/common/Toast";
import { LoadingState } from "@/components/common/LoadingState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Tabs } from "@/components/ui/Tabs";

interface AdminRecipeRow {
  id: string;
  mongoId: string;
  name: string;
  category: string;
  imageUrl?: string;
  totalNutrition: { calories: number; protein: number };
  status?: "draft" | "published";
  createdAt: string;
  ownerType?: string;
  user: { name: string; email: string } | null;
}

export default function AdminRecipesPage() {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminRecipeRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<AdminRecipeRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = status === "all" ? "" : `&status=${status}`;
      const res = await apiGet<{
        data: AdminRecipeRow[];
        pagination: { totalPages: number };
      }>(
        `/api/admin/recipes?page=${page}&limit=12&q=${encodeURIComponent(debounced)}${statusParam}`
      );
      setRows(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debounced, status, push]);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePublish(row: AdminRecipeRow) {
    setBusy(true);
    try {
      await apiSend(`/api/admin/recipes/${row.mongoId || row.id}`, "PATCH", {
        status: row.status === "published" ? "draft" : "published",
        visibility: "public",
      });
      push(
        row.status === "published" ? "Unpublished" : "Published",
        "success"
      );
      await load();
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(row: AdminRecipeRow) {
    setBusy(true);
    try {
      await apiSend(`/api/admin/recipes/${row.mongoId || row.id}`, "PATCH", {
        action: "duplicate",
      });
      push("Recipe duplicated as draft", "success");
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
      await apiSend(
        `/api/admin/recipes/${pendingDelete.mongoId || pendingDelete.id}`,
        "DELETE"
      );
      push("Recipe deleted", "success");
      setPendingDelete(null);
      await load();
    } catch (error) {
      push(error instanceof Error ? error.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="CMS"
        title="Recipe management"
        description="Search, publish, and manage platform recipes."
        actions={
          <Link href="/admin/recipes/new">
            <Button>
              <Plus className="h-4 w-4" />
              New recipe
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { id: "all", label: "All" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
          ]}
          activeId={status}
          onChange={(id) => {
            setStatus(id);
            setPage(1);
          }}
        />
        <div className="w-full sm:w-72">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search recipes"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading recipes..." />
      ) : (
        <Table
          headers={[
            "Recipe",
            "Category",
            "Calories",
            "Protein",
            "Author",
            "Created",
            "Status",
            "Actions",
          ]}
        >
          {rows.map((row) => (
            <TableRow key={row.mongoId || row.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-[#1A2234]">
                    {row.imageUrl ? (
                      <Image
                        src={row.imageUrl}
                        alt={row.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {row.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {row.ownerType || "user"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="capitalize">{row.category}</TableCell>
              <TableCell>{Math.round(row.totalNutrition.calories)}</TableCell>
              <TableCell>{row.totalNutrition.protein.toFixed(1)}g</TableCell>
              <TableCell>
                {row.user ? (
                  <div>
                    <div>{row.user.name}</div>
                    <div className="text-xs text-muted-foreground">{row.user.email}</div>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(row.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge tone={row.status === "published" ? "success" : "warning"}>
                  {row.status || "published"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu
                  trigger={
                    <span className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
                      Actions
                    </span>
                  }
                  items={[
                    {
                      label: "View / Edit",
                      onClick: () => {
                        window.location.href = `/admin/recipes/${row.mongoId || row.id}`;
                      },
                    },
                    {
                      label: "Duplicate",
                      onClick: () => void duplicate(row),
                    },
                    {
                      label:
                        row.status === "published" ? "Unpublish" : "Publish",
                      onClick: () => void togglePublish(row),
                    },
                    {
                      label: "Delete",
                      destructive: true,
                      onClick: () => setPendingDelete(row),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || busy}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || busy}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete recipe"
        description={`Permanently delete "${pendingDelete?.name}"?`}
        confirmLabel="Delete"
        isDestructive
        isLoading={busy}
      />
    </>
  );
}
