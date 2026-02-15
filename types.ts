export interface Ingredient {
  id: string;
  name: string;
  purchasePrice: number; // Harga Beli (e.g., 15000)
  purchaseUnit: string; // Satuan Beli (e.g., 'kg', 'liter', 'pack')
  purchaseAmount: number; // Isi/Volume per pembelian (e.g., 1000 for 1kg)
  costPerSmallestUnit: number; // Calculated automatically
}

export interface RecipeIngredient {
  ingredientId: string;
  amountUsed: number; // Amount used in the recipe (Batch amount)
}

export interface MenuItem {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  batchYield: number; // Hasil porsi dari resep di atas (New Field)
  overheadCost: number; // Biaya tak terlihat PER PORSI
  marginPercentage: number;
  baseCost: number; // HPP Per Porsi (Calculated)
  recommendedPrice: number;
  sellingPrice: number;
}

export interface DailySaleItem {
  menuItemId: string;
  cookedQty: number;
  leftoverQty: number;
  soldQty: number;
}

export interface DailyRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  targetProfit: number;
  sales: DailySaleItem[];
  totalRevenue: number;
  totalCost: number; // COGS + Overhead
  netProfit: number;
  isClosed: boolean;
  notes?: string;
}

export type ViewState = 'dashboard' | 'inventory' | 'menu' | 'pos' | 'operations';