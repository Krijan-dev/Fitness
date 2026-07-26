"use client";

import { useParams } from "next/navigation";
import { DiscoverDetailContent } from "./DiscoverDetailContent";

export function DiscoverDetailPageClient() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return <DiscoverDetailContent id={id} />;
}
