"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiSend } from "@/lib/api-client";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useToast } from "@/components/common/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Recipe } from "@/types/recipe";

export default function AdminRecipeEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const [recipe, setRecipe] = useState<(Recipe & { mongoId?: string }) | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void apiGet<{ data: Recipe & { mongoId?: string } }>(
      `/api/admin/recipes/${params.id}`
    )
      .then((res) => setRecipe(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  async function save() {
    if (!recipe) return;
    setSaving(true);
    try {
      await apiSend(`/api/admin/recipes/${params.id}`, "PATCH", {
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        instructions: recipe.instructions,
        status: recipe.status,
        visibility: recipe.visibility || "public",
        totalNutrition: recipe.totalNutrition,
        servings: recipe.servings,
        servingSize: recipe.servingSize,
        imageUrl: recipe.imageUrl,
      });
      push("Recipe updated", "success");
      router.push("/admin/recipes");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Loading recipe..." />;
  if (error || !recipe) {
    return <ErrorState title="Recipe not found" message={error || ""} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="CMS"
        title={recipe.name}
        description="Edit recipe details and publishing status."
        actions={
          <div className="flex gap-2">
            <Badge tone={recipe.status === "published" ? "success" : "warning"}>
              {recipe.status || "published"}
            </Badge>
            <Button isLoading={saving} onClick={() => void save()}>
              Save changes
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Title"
              value={recipe.name}
              onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
            />
            <Textarea
              label="Description"
              value={recipe.description || ""}
              onChange={(e) =>
                setRecipe({ ...recipe, description: e.target.value })
              }
            />
            <Textarea
              label="Instructions"
              value={recipe.instructions || ""}
              onChange={(e) =>
                setRecipe({ ...recipe, instructions: e.target.value })
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setRecipe({
                  ...recipe,
                  status: recipe.status === "published" ? "draft" : "published",
                })
              }
            >
              Mark as {recipe.status === "published" ? "draft" : "published"}
            </Button>
            <p className="text-sm text-slate-400">
              Calories: {Math.round(recipe.totalNutrition.calories)} · Protein:{" "}
              {recipe.totalNutrition.protein.toFixed(1)}g · Category:{" "}
              {recipe.category}
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
