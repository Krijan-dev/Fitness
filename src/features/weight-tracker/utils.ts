import type { WeightEntry } from "@/types/weight";

export type WeightChartRange = "week" | "month" | "all";

export interface WeightStats {
  currentWeight: number;
  startingWeight: number;
  targetWeight: number;
  totalChange: number;
  weeklyChange: number;
  monthlyChange: number;
  highestWeight: number;
  lowestWeight: number;
  bmi: number | null;
  progressPercent: number;
}

export function sortWeightEntries(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function filterEntriesByRange(
  entries: WeightEntry[],
  range: WeightChartRange
): WeightEntry[] {
  const sorted = sortWeightEntries(entries);
  if (range === "all" || sorted.length === 0) return sorted;

  const latest = new Date(sorted[sorted.length - 1].date);
  const days = range === "week" ? 7 : 30;
  const cutoff = new Date(latest);
  cutoff.setDate(cutoff.getDate() - days);

  return sorted.filter((e) => new Date(e.date) >= cutoff);
}

export function filterEntriesByDateRange(
  entries: WeightEntry[],
  startDate: string,
  endDate: string
): WeightEntry[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return sortWeightEntries(entries).filter((e) => {
    const t = new Date(e.date).getTime();
    return t >= start && t <= end;
  });
}

function findEntryOnOrBefore(
  entries: WeightEntry[],
  targetDate: Date
): WeightEntry | null {
  const target = targetDate.getTime();
  let match: WeightEntry | null = null;
  for (const entry of entries) {
    if (new Date(entry.date).getTime() <= target) {
      match = entry;
    }
  }
  return match;
}

export function calculateMonthlyWeightChange(entries: WeightEntry[]): number {
  if (entries.length < 2) return 0;
  const sorted = sortWeightEntries(entries);
  const latest = sorted[sorted.length - 1];
  const monthAgo = new Date(latest.date);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const ref = findEntryOnOrBefore(sorted, monthAgo);
  if (!ref) return latest.weight - sorted[0].weight;
  return latest.weight - ref.weight;
}

export function calculateBMI(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateWeightStats(
  entries: WeightEntry[],
  targetWeight: number,
  heightCm?: number
): WeightStats {
  const sorted = sortWeightEntries(entries);

  if (sorted.length === 0) {
    return {
      currentWeight: 0,
      startingWeight: 0,
      targetWeight,
      totalChange: 0,
      weeklyChange: 0,
      monthlyChange: 0,
      highestWeight: 0,
      lowestWeight: 0,
      bmi: null,
      progressPercent: 0,
    };
  }

  const currentWeight = sorted[sorted.length - 1].weight;
  const startingWeight = sorted[0].weight;
  const weights = sorted.map((e) => e.weight);
  const highestWeight = Math.max(...weights);
  const lowestWeight = Math.min(...weights);
  const totalChange = currentWeight - startingWeight;

  const latestDate = new Date(sorted[sorted.length - 1].date);
  const weekAgo = new Date(latestDate);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRef = findEntryOnOrBefore(sorted, weekAgo);
  const weeklyChange = weekRef
    ? currentWeight - weekRef.weight
    : totalChange;

  const monthlyChange = calculateMonthlyWeightChange(sorted);
  const bmi = heightCm ? calculateBMI(currentWeight, heightCm) : null;

  let progressPercent = 0;
  const totalToLose = startingWeight - targetWeight;
  if (totalToLose !== 0) {
    progressPercent = Math.round(
      ((startingWeight - currentWeight) / totalToLose) * 100
    );
    progressPercent = Math.max(0, Math.min(100, progressPercent));
  }

  return {
    currentWeight,
    startingWeight,
    targetWeight,
    totalChange,
    weeklyChange,
    monthlyChange,
    highestWeight,
    lowestWeight,
    bmi,
    progressPercent,
  };
}

export function exportWeightCsv(entries: WeightEntry[]): string {
  const header = "date,weight_kg,waist_cm,notes";
  const rows = sortWeightEntries(entries).map((e) => {
    const notes = (e.notes ?? "").replace(/"/g, '""');
    return `${e.date},${e.weight},${e.waistMeasurement ?? ""},"${notes}"`;
  });
  return [header, ...rows].join("\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType = "text/plain"
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
