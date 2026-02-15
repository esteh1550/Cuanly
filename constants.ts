export const APP_NAME = "Cuanly";
export const CURRENCY_LOCALE = "id-ID";
export const CURRENCY_CURRENCY = "IDR";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const INITIAL_INGREDIENTS = [
  { id: '1', name: 'Ayam Potong', purchasePrice: 45000, purchaseUnit: 'kg', purchaseAmount: 1000, costPerSmallestUnit: 45 },
  { id: '2', name: 'Minyak Goreng', purchasePrice: 18000, purchaseUnit: 'liter', purchaseAmount: 1000, costPerSmallestUnit: 18 },
  { id: '3', name: 'Tepung Bumbu', purchasePrice: 12000, purchaseUnit: 'pack', purchaseAmount: 500, costPerSmallestUnit: 24 },
  { id: '4', name: 'Beras', purchasePrice: 13000, purchaseUnit: 'kg', purchaseAmount: 1000, costPerSmallestUnit: 13 },
  { id: '5', name: 'Telur Ayam', purchasePrice: 52500, purchaseUnit: 'tray', purchaseAmount: 30, costPerSmallestUnit: 1750 },
  { id: '6', name: 'Bumbu Halus (Bawang/Cabai)', purchasePrice: 75000, purchaseUnit: 'kg', purchaseAmount: 1000, costPerSmallestUnit: 75 },
  { id: '7', name: 'Tepung Terigu', purchasePrice: 12000, purchaseUnit: 'kg', purchaseAmount: 1000, costPerSmallestUnit: 12 },
  { id: '8', name: 'Bahan Sambal', purchasePrice: 60000, purchaseUnit: 'kg', purchaseAmount: 1000, costPerSmallestUnit: 60 },
  { id: '9', name: 'Teh Celup', purchasePrice: 10000, purchaseUnit: 'box', purchaseAmount: 25, costPerSmallestUnit: 400 },
  { id: '10', name: 'Gula Pasir', purchasePrice: 18000, purchaseUnit: 'kg', purchaseAmount: 1000, costPerSmallestUnit: 18 },
  { id: '11', name: 'Es Batu Kristal', purchasePrice: 10000, purchaseUnit: 'pack', purchaseAmount: 5000, costPerSmallestUnit: 2 },
  { id: '12', name: 'Cup & Sedotan', purchasePrice: 40000, purchaseUnit: 'pack', purchaseAmount: 50, costPerSmallestUnit: 800 },
];

export const INITIAL_MENU = [
  {
    id: '1',
    name: 'Ayam Goreng Spesial',
    ingredients: [
      { ingredientId: '1', amountUsed: 1000 }, // 1kg Chicken (Batch)
      { ingredientId: '2', amountUsed: 250 },  // 250ml Oil (Batch)
      { ingredientId: '3', amountUsed: 200 }   // 200g Flour (Batch)
    ],
    batchYield: 8, // Yields 8 portions
    overheadCost: 2000, // Packaging + Gas per portion
    marginPercentage: 40,
    baseCost: 9370, // Will be recalculated by logic, placeholder
    recommendedPrice: 13118,
    sellingPrice: 15000
  },
  {
    id: '2',
    name: 'Nasi Goreng Telur',
    ingredients: [
      { ingredientId: '4', amountUsed: 230 }, // Beras ~3000
      { ingredientId: '5', amountUsed: 1 },   // Telur 1750
      { ingredientId: '2', amountUsed: 15 },  // Minyak 270
      { ingredientId: '6', amountUsed: 20 },  // Bumbu 1500
    ],
    batchYield: 1,
    overheadCost: 2000,
    marginPercentage: 45,
    baseCost: 8520,
    recommendedPrice: 12354,
    sellingPrice: 15500
  },
  {
    id: '3',
    name: 'Ayam Geprek',
    ingredients: [
      { ingredientId: '1', amountUsed: 125 }, // Ayam 125g (cost 5625 @ 45k/kg)
      { ingredientId: '7', amountUsed: 50 },  // Terigu 600
      { ingredientId: '8', amountUsed: 20 },  // Sambal 1200
      { ingredientId: '2', amountUsed: 30 },  // Minyak 540
    ],
    batchYield: 1,
    overheadCost: 1500,
    marginPercentage: 50,
    baseCost: 9465,
    recommendedPrice: 14197,
    sellingPrice: 18000
  },
  {
    id: '4',
    name: 'Es Teh Manis',
    ingredients: [
      { ingredientId: '9', amountUsed: 1 },   // Teh 400
      { ingredientId: '10', amountUsed: 20 }, // Gula 360
      { ingredientId: '11', amountUsed: 250 },// Es 500
      { ingredientId: '12', amountUsed: 1 },  // Cup 800
    ],
    batchYield: 1,
    overheadCost: 0,
    marginPercentage: 142,
    baseCost: 2060,
    recommendedPrice: 3000,
    sellingPrice: 5000
  }
];