export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  lowStockThreshold?: number;
  expiryDate?: string;
  notes?: string;
}
