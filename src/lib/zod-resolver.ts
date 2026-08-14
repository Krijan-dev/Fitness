import { z } from "zod";
import type { FieldValues, Resolver } from "react-hook-form";

/** Minimal Zod resolver so we don't depend on @hookform/resolvers vs Zod 4. */
export function zodResolver<T extends z.ZodType>(
  schema: T
): Resolver<z.infer<T> & FieldValues> {
  return (async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data as z.infer<T> & FieldValues, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.length ? String(issue.path[0]) : "root";
      if (!errors[path]) {
        errors[path] = { type: String(issue.code), message: issue.message };
      }
    }

    return { values: {}, errors };
  }) as Resolver<z.infer<T> & FieldValues>;
}
