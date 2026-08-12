"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Activity,
  CalendarDays,
  ShoppingCart,
} from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  formatCategoryLabel,
  getPerServingNutrition,
} from "@/features/recipes/utils";
import { CATEGORY_PLACEHOLDER_COLORS } from "@/features/recipes/constants";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDuplicate: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onToggleFavourite: (recipe: Recipe) => void;
  onAddToTracker: (recipe: Recipe) => void;
  onAddToPlanner: (recipe: Recipe) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
}

export function RecipeCard({
  recipe,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavourite,
  onAddToTracker,
  onAddToPlanner,
  onAddToShoppingList,
}: RecipeCardProps) {
  const perServing = getPerServingNutrition(recipe);
  const placeholderGradient =
    CATEGORY_PLACEHOLDER_COLORS[recipe.category] ?? "from-muted to-muted";

  return (
    <Card
      padding="none"
      hover
      className="overflow-hidden group"
    >
      <div
        className={`relative h-44 bg-gradient-to-br ${placeholderGradient} flex items-center justify-center`}
      >
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="text-5xl font-semibold text-muted-foreground/30">
            {recipe.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="success">{Math.round(perServing.calories)} kcal</Badge>
          <Badge tone="info">{perServing.protein.toFixed(0)}g protein</Badge>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavourite(recipe)}
          className="absolute top-3 right-3 rounded-full bg-card/90 p-2.5 transition-all hover:bg-card hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={
            recipe.isFavourite ? "Remove from favourites" : "Add to favourites"
          }
        >
          <Heart
            className={`h-4 w-4 ${
              recipe.isFavourite
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="mb-3 min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
            {recipe.name}
          </h3>
          <p className="text-xs text-muted-foreground capitalize">
            {formatCategoryLabel(recipe.category)} · {recipe.servings} servings
          </p>
        </div>

        <dl className="mb-4 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl bg-muted/60 px-2.5 py-2">
            <dt className="text-[11px] text-text-muted">Carbs</dt>
            <dd className="font-medium">{perServing.carbs.toFixed(0)}g</dd>
          </div>
          <div className="rounded-xl bg-muted/60 px-2.5 py-2">
            <dt className="text-[11px] text-text-muted">Fat</dt>
            <dd className="font-medium">{perServing.fat.toFixed(0)}g</dd>
          </div>
          <div className="rounded-xl bg-muted/60 px-2.5 py-2">
            <dt className="text-[11px] text-text-muted">Serve</dt>
            <dd className="font-medium">{recipe.servingSize}g</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Link href={`/recipes/${recipe.id}`}>
            <Button variant="secondary" size="sm">
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onEdit(recipe)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(recipe)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddToTracker(recipe)}
            aria-label="Add to daily tracker"
          >
            <Activity className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddToPlanner(recipe)}
            aria-label="Add to meal planner"
          >
            <CalendarDays className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddToShoppingList(recipe)}
            aria-label="Add to shopping list"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(recipe)}
            aria-label="Delete recipe"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
