"use client";

import { useParams } from "next/navigation";
import { RecipeDetailContent } from "./RecipeDetailContent";

export function RecipeDetailPageClient() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return <RecipeDetailContent id={id} />;
}
