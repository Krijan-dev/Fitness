"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, BookmarkPlus } from "lucide-react";
import type { DiscoveredRecipe } from "@/types/recipe";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { getTotalCookTime } from "@/features/recipe-discovery/utils";

interface DiscoveredRecipeCardProps {
  recipe: DiscoveredRecipe;
  onSave: (recipe: DiscoveredRecipe) => void;
}

export function DiscoveredRecipeCard({
  recipe,
  onSave,
}: DiscoveredRecipeCardProps) {
  const totalTime = getTotalCookTime(recipe);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="text-3xl font-bold text-muted-foreground/40">
            {recipe.title.charAt(0)}
          </span>
        )}
        {recipe.source ? (
          <span className="absolute bottom-2 left-2 rounded bg-card/90 px-2 py-0.5 text-xs text-muted-foreground">
            {recipe.source}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1">
          {recipe.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {recipe.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {totalTime > 0 ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {totalTime} min
            </span>
          ) : null}
          {recipe.caloriesPerServing > 0 ? (
            <span>{Math.round(recipe.caloriesPerServing)} cal</span>
          ) : (
            <span>Nutrition n/a</span>
          )}
          {recipe.proteinPerServing > 0 ? (
            <span>{recipe.proteinPerServing}g protein</span>
          ) : null}
          <span>{recipe.servings} servings</span>
        </div>

        {recipe.dietaryTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground"
              >
                {tag.replace("-", " ")}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/discover/${recipe.id}`}>
            <Button variant="secondary" size="sm">View Recipe</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onSave(recipe)}>
            <BookmarkPlus className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
