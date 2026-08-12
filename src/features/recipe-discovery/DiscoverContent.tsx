"use client";

import { useCallback, useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { DiscoveredRecipeCard } from "@/components/recipes/DiscoveredRecipeCard";
import { useDebounce } from "@/hooks/useDebounce";
import type { DiscoveredRecipe } from "@/types/recipe";
import {
  DISCOVER_FILTER_OPTIONS,
  buildRecipeSearchUrl,
  type DiscoverFilter,
} from "@/features/recipe-discovery/utils";
import { useDiscoverActions } from "@/features/recipe-discovery/useDiscoverActions";

export function DiscoverContent() {
  const { saveToMyRecipes } = useDiscoverActions();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DiscoverFilter>("all");
  const debouncedSearch = useDebounce(search, 300);

  const [recipes, setRecipes] = useState<DiscoveredRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("TheMealDB (free)");

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = buildRecipeSearchUrl(debouncedSearch, filter);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load recipes.");
      }
      const json = (await response.json()) as {
        data: DiscoveredRecipe[];
        providerLabel?: string;
        source?: string;
      };
      setRecipes(json.data);
      setDataSource(
        json.providerLabel ||
          (json.source?.includes("themealdb")
            ? "TheMealDB (free)"
            : json.source === "mock"
              ? "Mock provider"
              : json.source || "TheMealDB (free)")
      );
    } catch {
      setError("Could not load discovered recipes. Please try again.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <>
      <PageHeader
        title="Discover Recipes"
        description="Find free recipes from TheMealDB — no paid API keys required."
      />

      <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        Data source:{" "}
        <span className="font-semibold">{dataSource}</span>
        {dataSource.toLowerCase().includes("themealdb")
          ? " — public free recipe API (no billing)."
          : dataSource.toLowerCase().includes("mock")
            ? " — demonstration fallback."
            : "."}
      </p>

      {actionMessage ? (
        <div
          className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, ingredient, or description..."
          label="Search recipes"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {DISCOVER_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Searching recipes..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecipes} />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No recipes found"
          description="Try a different search term or filter to discover more recipes."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <DiscoveredRecipeCard
              key={recipe.id}
              recipe={recipe}
              onSave={(r) => {
                saveToMyRecipes(r);
                showMessage("Recipe saved to My Recipes.");
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
