"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { useDebounce } from "@/hooks/useDebounce";

interface AdminRecipeRow {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AdminRecipesPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminRecipeRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void apiGet<{
      data: AdminRecipeRow[];
      pagination: { totalPages: number };
    }>(
      `/api/admin/recipes?page=${page}&limit=15&q=${encodeURIComponent(debounced)}`
    )
      .then((res) => {
        setRows(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, debounced]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Recipes</h1>
          <p className="text-sm text-zinc-400">All user recipes across the platform.</p>
        </div>
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

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading recipes..." />
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Recipe</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 capitalize text-zinc-300">
                    {row.category}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {row.user ? (
                      <div>
                        <div>{row.user.name}</div>
                        <div className="text-xs text-zinc-500">{row.user.email}</div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
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
    </div>
  );
}
