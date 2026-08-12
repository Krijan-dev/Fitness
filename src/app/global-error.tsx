"use client";

import { useEffect } from "react";
import { Button } from "@/components/common/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en" data-theme="light">
      <body className="flex min-h-screen items-center justify-center bg-background-muted p-4 text-foreground">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <h1 className="text-xl font-semibold">Application error</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            MealPrep Pro encountered an unexpected problem.
          </p>
          <Button className="mt-6" onClick={reset}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
