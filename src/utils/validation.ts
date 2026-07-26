export function isValidNumber(value: unknown): boolean {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

export function isPositiveNumber(value: unknown): boolean {
  return isValidNumber(value) && (value as number) > 0;
}

export function isNonNegativeNumber(value: unknown): boolean {
  return isValidNumber(value) && (value as number) >= 0;
}

export function isValidString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function safeParseArray<T>(
  value: unknown,
  validator: (item: unknown) => boolean
): T[] {
  if (!isArray(value)) return [];
  return value.filter(validator) as T[];
}
