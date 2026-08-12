import { redirect } from "next/navigation";

/** Standalone recipe pricing page removed — pricing lives on Discover recipe detail. */
export default function RecipePricingPage() {
  redirect("/discover");
}
