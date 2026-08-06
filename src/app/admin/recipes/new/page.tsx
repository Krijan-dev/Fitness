"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload } from "lucide-react";
import { apiSend } from "@/lib/api-client";
import { generateId } from "@/utils/ids";
import { useToast } from "@/components/common/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import type { Ingredient } from "@/types/ingredient";

interface IngredientRow {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const CATEGORY_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "meal-prep", label: "Meal prep" },
  { value: "high-protein", label: "High protein" },
  { value: "low-calorie", label: "Low calorie" },
];

function emptyIngredient(): IngredientRow {
  return {
    id: generateId(),
    name: "",
    quantity: 100,
    unit: "g",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
}

function toApiIngredients(rows: IngredientRow[]): Ingredient[] {
  return rows.map((row) => {
    const qty = Math.max(row.quantity || 0, 1);
    const factor = 100 / qty;
    return {
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      unit: row.unit as Ingredient["unit"],
      caloriesPer100g: row.calories * factor,
      proteinPer100g: row.protein * factor,
      carbsPer100g: row.carbs * factor,
      fatPer100g: row.fat * factor,
    };
  });
}

export default function AdminRecipeUploadPage() {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("meal-prep");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(20);
  const [servings, setServings] = useState(2);
  const [instructions, setInstructions] = useState("1. ");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    emptyIngredient(),
  ]);

  const nutrition = useMemo(
    () =>
      ingredients.reduce(
        (acc, row) => ({
          calories: acc.calories + Number(row.calories || 0),
          protein: acc.protein + Number(row.protein || 0),
          carbs: acc.carbs + Number(row.carbs || 0),
          fat: acc.fat + Number(row.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [ingredients]
  );

  async function onUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setImageUrl(json.data.url);
      push("Image uploaded", "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function save(status: "draft" | "published") {
    if (!title.trim()) {
      push("Title is required", "error");
      return;
    }
    setSaving(true);
    try {
      await apiSend("/api/admin/recipes", "POST", {
        name: title.trim(),
        description,
        category,
        cuisine: cuisine || undefined,
        difficulty,
        prepTimeMinutes: prepTime,
        cookTimeMinutes: cookTime,
        servings,
        servingSize: 100,
        instructions,
        ingredients: toApiIngredients(ingredients.filter((i) => i.name.trim())),
        totalNutrition: nutrition,
        imageUrl: imageUrl || undefined,
        visibility: "public",
        status,
        ownerType: "admin",
      });
      push(
        status === "published" ? "Recipe published" : "Draft saved",
        "success"
      );
      router.push("/admin/recipes");
    } catch (error) {
      push(error instanceof Error ? error.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  function updateIngredient(id: string, patch: Partial<IngredientRow>) {
    setIngredients((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void save("published");
  }

  return (
    <>
      <PageHeader
        eyebrow="CMS"
        title="Upload recipe"
        description="Create a professional recipe for Discover and the global library."
      />

      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
              <CardDescription>Core details shown across the app.</CardDescription>
            </CardHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Recipe title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={CATEGORY_OPTIONS}
              />
              <Input
                label="Cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g. Mediterranean"
              />
              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={[
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "hard", label: "Hard" },
                ]}
              />
              <Input
                label="Servings"
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
              />
              <Input
                label="Prep time (min)"
                type="number"
                min={0}
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
              />
              <Input
                label="Cook time (min)"
                type="number"
                min={0}
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
              <CardDescription>Upload a cover image for this recipe.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                }}
                className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-500/15 file:px-4 file:py-2 file:text-emerald-300"
              />
              {uploading ? (
                <p className="text-sm text-slate-400">Uploading...</p>
              ) : null}
              {imageUrl ? (
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#2B3548]">
                  <Image
                    src={imageUrl}
                    alt="Recipe preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 640px"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-[#2B3548] text-slate-500">
                  <Upload className="mr-2 h-4 w-4" />
                  Preview appears here
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Ingredients</CardTitle>
                  <CardDescription>
                    Quantities and macros for live nutrition totals.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setIngredients((rows) => [...rows, emptyIngredient()])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <div className="space-y-4">
              {ingredients.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-2xl border border-[#2B3548] bg-[#0A0F1C]/50 p-4 sm:grid-cols-7"
                >
                  <div className="sm:col-span-2">
                    <Input
                      label="Name"
                      value={row.name}
                      onChange={(e) =>
                        updateIngredient(row.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <Input
                    label="Qty"
                    type="number"
                    value={row.quantity}
                    onChange={(e) =>
                      updateIngredient(row.id, {
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                  <Input
                    label="Unit"
                    value={row.unit}
                    onChange={(e) =>
                      updateIngredient(row.id, { unit: e.target.value })
                    }
                  />
                  <Input
                    label="Cal"
                    type="number"
                    value={row.calories}
                    onChange={(e) =>
                      updateIngredient(row.id, {
                        calories: Number(e.target.value),
                      })
                    }
                  />
                  <Input
                    label="Protein"
                    type="number"
                    value={row.protein}
                    onChange={(e) =>
                      updateIngredient(row.id, {
                        protein: Number(e.target.value),
                      })
                    }
                  />
                  <div className="flex items-end gap-2">
                    <Input
                      label="Carbs"
                      type="number"
                      value={row.carbs}
                      onChange={(e) =>
                        updateIngredient(row.id, {
                          carbs: Number(e.target.value),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mb-1"
                      onClick={() =>
                        setIngredients((rows) =>
                          rows.filter((r) => r.id !== row.id)
                        )
                      }
                      aria-label="Remove ingredient"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    label="Fat"
                    type="number"
                    value={row.fat}
                    onChange={(e) =>
                      updateIngredient(row.id, { fat: Number(e.target.value) })
                    }
                    className="sm:col-span-2"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Numbered steps, one per line.</CardDescription>
            </CardHeader>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[180px]"
            />
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Live nutrition</CardTitle>
              <CardDescription>Auto-calculated from ingredients.</CardDescription>
            </CardHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <dt className="text-slate-400">Calories</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {Math.round(nutrition.calories)}
                </dd>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3">
                <dt className="text-slate-400">Protein</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {nutrition.protein.toFixed(1)}g
                </dd>
              </div>
              <div className="rounded-xl bg-violet-500/10 p-3">
                <dt className="text-slate-400">Carbs</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {nutrition.carbs.toFixed(1)}g
                </dd>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3">
                <dt className="text-slate-400">Fat</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {nutrition.fat.toFixed(1)}g
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                isLoading={saving}
                onClick={() => void save("draft")}
              >
                Save as draft
              </Button>
              <Button type="submit" isLoading={saving}>
                Publish recipe
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
