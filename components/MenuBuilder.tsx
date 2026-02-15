import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, AlertTriangle, ChevronRight, Check, Edit2, Users, Info } from 'lucide-react';
import { Ingredient, MenuItem, RecipeIngredient } from '../types';
import { formatCurrency } from '../constants';

interface MenuBuilderProps {
  ingredients: Ingredient[];
  menu: MenuItem[];
  setMenu: (menu: MenuItem[]) => void;
}

export const MenuBuilder: React.FC<MenuBuilderProps> = ({ ingredients, menu, setMenu }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [batchYield, setBatchYield] = useState('1'); // New: Yield per batch
  const [overhead, setOverhead] = useState(''); // Per Portion
  const [margin, setMargin] = useState('30');
  const [sellingPrice, setSellingPrice] = useState('');

  // Temp state for adding ingredient
  const [tempIngId, setTempIngId] = useState('');
  const [tempAmount, setTempAmount] = useState('');

  useEffect(() => {
    // Auto calculate Selling Price whenever inputs change
    const hpp = calculatePerPortionHPP();
    const marginPercent = parseFloat(margin) || 0;
    const recommended = hpp + (hpp * (marginPercent / 100));
    // Note: We don't auto-set sellingPrice here to allow manual override, 
    // but we could if we wanted strictly guided pricing.
  }, [selectedIngredients, batchYield, overhead, margin]);

  const resetForm = () => {
    setName('');
    setSelectedIngredients([]);
    setBatchYield('1');
    setOverhead('');
    setMargin('30');
    setSellingPrice('');
    setEditingId(null);
    setView('list');
  };

  const calculateBatchCost = () => {
    return selectedIngredients.reduce((total, sel) => {
      const ing = ingredients.find(i => i.id === sel.ingredientId);
      return total + (ing ? ing.costPerSmallestUnit * sel.amountUsed : 0);
    }, 0);
  };

  const calculatePerPortionHPP = () => {
    const totalBatchCost = calculateBatchCost();
    const yieldCount = parseFloat(batchYield) || 1;
    const foodCostPerPortion = totalBatchCost / (yieldCount > 0 ? yieldCount : 1);
    const ovhd = parseFloat(overhead) || 0;
    
    return foodCostPerPortion + ovhd;
  };

  const handleAddIngredient = () => {
    if (!tempIngId || !tempAmount) return;
    const exists = selectedIngredients.find(i => i.ingredientId === tempIngId);
    if (exists) {
      setSelectedIngredients(selectedIngredients.map(i => 
        i.ingredientId === tempIngId ? { ...i, amountUsed: i.amountUsed + parseFloat(tempAmount) } : i
      ));
    } else {
      setSelectedIngredients([...selectedIngredients, { ingredientId: tempIngId, amountUsed: parseFloat(tempAmount) }]);
    }
    setTempIngId('');
    setTempAmount('');
  };

  const removeIngredient = (id: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.ingredientId !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseCost = calculatePerPortionHPP(); // Final HPP per portion
    const marginPct = parseFloat(margin);
    const recommended = baseCost + (baseCost * (marginPct / 100));
    const finalPrice = parseFloat(sellingPrice) || recommended;
    const yieldCount = parseFloat(batchYield) || 1;

    const newItem: MenuItem = {
      id: editingId || Date.now().toString(),
      name,
      ingredients: selectedIngredients,
      batchYield: yieldCount,
      overheadCost: parseFloat(overhead) || 0,
      marginPercentage: marginPct,
      baseCost, // Storing unit cost for operations
      recommendedPrice: recommended,
      sellingPrice: finalPrice
    };

    if (editingId) {
      setMenu(menu.map(m => m.id === editingId ? newItem : m));
    } else {
      setMenu([...menu, newItem]);
    }
    resetForm();
  };

  const handleEdit = (item: MenuItem) => {
    setName(item.name);
    setSelectedIngredients(item.ingredients);
    setBatchYield(item.batchYield ? item.batchYield.toString() : '1');
    setOverhead(item.overheadCost.toString());
    setMargin(item.marginPercentage.toString());
    setSellingPrice(item.sellingPrice.toString());
    setEditingId(item.id);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus menu ini?')) {
      setMenu(menu.filter(m => m.id !== id));
    }
  };

  // Calculations for display in form
  const currentBatchCost = calculateBatchCost();
  const currentYield = parseFloat(batchYield) || 1;
  const currentFoodCostPerPortion = currentBatchCost / (currentYield > 0 ? currentYield : 1);
  const currentHPP = calculatePerPortionHPP();
  const currentRecommended = currentHPP + (currentHPP * ((parseFloat(margin) || 0) / 100));
  const currentActualMargin = sellingPrice ? ((parseFloat(sellingPrice) - currentHPP) / currentHPP) * 100 : parseFloat(margin);
  const isLowMargin = currentActualMargin < 10;

  if (view === 'form') {
    return (
      <div className="pb-24">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">Batal</button>
          <ChevronRight size={16} className="text-gray-400" />
          <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Resep' : 'Resep Baru'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Identity */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Info Produk
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Nasi Goreng Spesial" />
            </div>
          </div>

          {/* Step 2: Ingredients (Batch) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Bahan (Masakan Besar)
              </h3>
            </div>
            <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg mb-4 flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>Masukkan total bahan yang dipakai untuk satu kali masak (Batch). <br/>Contoh: 5 Kg Beras, 1 Liter Kecap.</p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <select 
                value={tempIngId} 
                onChange={e => setTempIngId(e.target.value)}
                className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg p-2 text-sm"
              >
                <option value="">Pilih Bahan...</option>
                {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.purchaseUnit})</option>)}
              </select>
              <input 
                type="number" 
                value={tempAmount} 
                onChange={e => setTempAmount(e.target.value)}
                placeholder="Jml"
                className="w-20 bg-white text-gray-900 border border-gray-300 rounded-lg p-2 text-sm"
              />
              <button type="button" onClick={handleAddIngredient} className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {selectedIngredients.map((sel, idx) => {
                const ing = ingredients.find(i => i.id === sel.ingredientId);
                if (!ing) return null;
                return (
                  <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded border border-gray-100">
                    <span>{ing.name} ({sel.amountUsed})</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{formatCurrency(ing.costPerSmallestUnit * sel.amountUsed)}</span>
                      <button type="button" onClick={() => removeIngredient(sel.ingredientId)} className="text-red-400"><Trash2 size={14}/></button>
                    </div>
                  </div>
                );
              })}
              {selectedIngredients.length === 0 && <p className="text-sm text-gray-400 italic text-center py-2">Belum ada bahan</p>}
            </div>

            {/* Total Batch Cost Display */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm font-medium text-gray-600">Total Modal Masak:</span>
              <span className="text-lg font-bold text-gray-800">{formatCurrency(currentBatchCost)}</span>
            </div>
          </div>

          {/* Step 3: Yield & Overhead */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Porsi & Biaya Lain
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <Users size={16} className="text-emerald-600"/> 
                  Jadi Berapa Porsi?
                </label>
                <input 
                  required
                  type="number" 
                  value={batchYield} 
                  onChange={e => setBatchYield(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-medium" 
                  placeholder="Contoh: 50" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Modal Bahan per Porsi: <span className="font-bold text-emerald-600">{formatCurrency(currentFoodCostPerPortion)}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Lain <span className="text-red-500">per Porsi</span></label>
                  <input 
                    type="number" 
                    value={overhead} 
                    onChange={e => setOverhead(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:border-emerald-500" 
                    placeholder="Kemasan/Gas (Rp)" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Target Margin (%)</label>
                  <input 
                    type="number" 
                    value={margin} 
                    onChange={e => setMargin(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:border-emerald-500" 
                    placeholder="%" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg my-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">HPP Final (per Porsi):</span>
                <span className="font-semibold text-gray-800">{formatCurrency(currentHPP)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Saran Harga Jual:</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(currentRecommended)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Harga Jual Menu</label>
              <input required type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                className={`w-full bg-white border-2 rounded-lg p-3 text-lg font-semibold ${isLowMargin ? 'border-red-300 focus:border-red-500 text-red-700' : 'border-emerald-300 focus:border-emerald-500 text-emerald-700'}`} 
                placeholder={currentRecommended.toString()} />
              {isLowMargin && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> Hati-hati! Margin keuntungan di bawah 10%
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-700 transition-all">
            Simpan Menu
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Menu</h2>
        <button 
          onClick={() => setView('form')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Buat Resep</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {menu.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            <Calculator size={48} className="mx-auto mb-2 opacity-20" />
            <p>Belum ada menu. Buat resep pertamamu!</p>
          </div>
        ) : (
          menu.map((item) => {
            const actualMargin = ((item.sellingPrice - item.baseCost) / item.baseCost) * 100;
            const isRisky = actualMargin < 10;
            const yieldCount = item.batchYield || 1;

            return (
              <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex flex-col justify-between ${isRisky ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    {isRisky && (
                      <div title="Margin Rendah">
                        <AlertTriangle size={16} className="text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs bg-gray-50 text-gray-500 p-1.5 rounded mb-2 inline-block">
                    Resep Masak: {yieldCount} Porsi
                  </div>

                  <div className="text-sm space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">HPP / Porsi</span>
                      <span className="text-gray-700">{formatCurrency(item.baseCost)}</span>
                    </div>
                     <div className="flex justify-between font-medium">
                      <span className="text-gray-500">Harga Jual</span>
                      <span className="text-emerald-700 text-base">{formatCurrency(item.sellingPrice)}</span>
                    </div>
                     <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Margin</span>
                      <span className={`${isRisky ? 'text-red-500' : 'text-emerald-600'}`}>{actualMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                  <button onClick={() => handleEdit(item)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};