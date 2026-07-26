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
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
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
    CATEGORY_PLACEHOLDER_COLORS[recipe.category] ??
    "from-muted to-muted";

  return (
    <Card padding="none" className="overflow-hidden">
      <div
        className={`relative h-36 bg-gradient-to-br ${placeholderGradient} flex items-center justify-center`}
      >
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="text-4xl font-bold text-muted-foreground/40">
            {recipe.name.charAt(0).toUpperCase()}
          </span>
        )}
        <button
          type="button"
          onClick={() => onToggleFavourite(recipe)}
          className="absolute top-3 right-3 rounded-full bg-card/90 p-2 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {recipe.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {formatCategoryLabel(recipe.category)}
            </p>
          </div>
        </div>

        <dl className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Calories</dt>
            <dd className="font-medium">{Math.round(perServing.calories)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Protein</dt>
            <dd className="font-medium">{perServing.protein.toFixed(1)}g</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Carbs</dt>
            <dd className="font-medium">{perServing.carbs.toFixed(1)}g</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fat</dt>
            <dd className="font-medium">{perServing.fat.toFixed(1)}g</dd>
          </div>
        </dl>

        <p className="mb-4 text-xs text-muted-foreground">
          {recipe.servingSize}g serving · {recipe.servings} servings
        </p>

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
