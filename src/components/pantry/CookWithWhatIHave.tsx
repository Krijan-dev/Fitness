"use client";

import Link from "next/link";
import { ChefHat, ShoppingCart } from "lucide-react";
import type { RecipePantryMatch } from "@/features/pantry/utils";
import { Card, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ProgressBar } from "@/components/common/ProgressBar";

interface CookWithWhatIHaveProps {
  canMakeNow: RecipePantryMatch[];
  missingOne: RecipePantryMatch[];
  missingTwo: RecipePantryMatch[];
  onAddMissingToShopping: (match: RecipePantryMatch) => void;
}

function MatchCard({
  match,
  onAddMissingToShopping,
}: {
  match: RecipePantryMatch;
  onAddMissingToShopping: (match: RecipePantryMatch) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/recipes/${match.recipe.id}`}
            className="font-medium text-sm hover:text-primary"
          >
            {match.recipe.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {match.availableCount} of {match.totalCount} ingredients on hand
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium text-primary">
          {match.matchPercentage}%
        </span>
      </div>
      <ProgressBar
        label="Ingredients available"
        value={match.availableCount}
        max={match.totalCount}
        color="success"
      />
      {match.missingIngredients.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1">Missing:</p>
          <p className="text-sm">{match.missingIngredients.join(", ")}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => onAddMissingToShopping(match)}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add missing to list
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function MatchSection({
  title,
  matches,
  onAddMissingToShopping,
}: {
  title: string;
  matches: RecipePantryMatch[];
  onAddMissingToShopping: (match: RecipePantryMatch) => void;
}) {
  if (matches.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((match) => (
          <MatchCard
            key={match.recipe.id}
            match={match}
            onAddMissingToShopping={onAddMissingToShopping}
          />
        ))}
      </div>
    </div>
  );
}

export function CookWithWhatIHave({
  canMakeNow,
  missingOne,
  missingTwo,
  onAddMissingToShopping,
}: CookWithWhatIHaveProps) {
  const hasMatches =
    canMakeNow.length > 0 || missingOne.length > 0 || missingTwo.length > 0;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Cook With What I Have
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Recipes matched against your pantry using ingredient name matching.
        </p>
      </CardHeader>

      {!hasMatches ? (
        <EmptyState
          icon={ChefHat}
          title="No recipe matches yet"
          description="Add pantry items and save recipes to see what you can cook."
          actionLabel="Create a recipe"
          onAction={() => window.location.assign("/meal-calculator")}
        />
      ) : (
        <div className="space-y-6">
          <MatchSection
            title="Ready to cook"
            matches={canMakeNow}
            onAddMissingToShopping={onAddMissingToShopping}
          />
          <MatchSection
            title="Missing one ingredient"
            matches={missingOne}
            onAddMissingToShopping={onAddMissingToShopping}
          />
          <MatchSection
            title="Missing two ingredients"
            matches={missingTwo}
            onAddMissingToShopping={onAddMissingToShopping}
          />
        </div>
      )}
    </Card>
  );
}
