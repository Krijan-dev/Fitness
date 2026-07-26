export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre?: number;
  sugar?: number;
  sodium?: number;
}

export interface NutritionGoals {
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
}

export interface DailyNutritionSummary extends Nutrition {
  calorieGoal: number;
  proteinGoal: number;
  caloriesRemaining: number;
  mealsLogged: number;
}
