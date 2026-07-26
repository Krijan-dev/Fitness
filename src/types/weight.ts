export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  waistMeasurement?: number;
  notes?: string;
}

export interface WeightSummary {
  currentWeight: number;
  startingWeight: number;
  targetWeight: number;
  totalChange: number;
  weeklyChange: number;
  monthlyChange: number;
  highestWeight: number;
  lowestWeight: number;
}
