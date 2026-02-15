import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Ingredient } from '../types';
import { formatCurrency } from '../constants';

interface InventoryProps {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ ingredients, setIngredients }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('gram');
  const [amount, setAmount] = useState('');

  const resetForm = () => {
    setName('');
    setPrice('');
    setUnit('gram');
    setAmount('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (ing: Ingredient) => {
    setName(ing.name);
    setPrice(ing.purchasePrice.toString());
    setUnit(ing.purchaseUnit);
    setAmount(ing.purchaseAmount.toString());
    setEditingId(ing.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus bahan ini? Ini akan mempengaruhi resep yang menggunakan bahan ini.')) {
      setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  // Logic otomatis untuk satuan
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = e.target.value;
    setUnit(selectedUnit);

    // Otomatis isi 1000 jika kg/liter
    if (selectedUnit === 'kg' || selectedUnit === 'liter') {
      setAmount('1000');
    } else if (selectedUnit === 'gram' || selectedUnit === 'ml') {
      // Jika balik ke gram/ml, opsional: bisa direset atau biarkan
      // Disini kita biarkan user isi manual jika bukan kg/l, atau default 1 jika kosong
      if (!amount) setAmount('1');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pPrice = parseFloat(price);
    const pAmount = parseFloat(amount);
    
    // Auto calculate cost per smallest unit
    const costPerSmallestUnit = pPrice / pAmount;

    const newIngredient: Ingredient = {
      id: editingId || Date.now().toString(),
      name,
      purchasePrice: pPrice,
      purchaseUnit: unit,
      purchaseAmount: pAmount,
      costPerSmallestUnit
    };

    if (editingId) {
      setIngredients(ingredients.map(i => i.id === editingId ? newIngredient : i));
    } else {
      setIngredients([...ingredients, newIngredient]);
    }
    resetForm();
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Master Bahan</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Tambah</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-emerald-800">{editingId ? 'Edit Bahan' : 'Bahan Baru'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                placeholder="Contoh: Ayam Fillet"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Rp)</label>
                <input 
                  required 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan Beli</label>
                <select 
                  value={unit} 
                  onChange={handleUnitChange}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="liter">Liter (l)</option>
                  <option value="gram">Gram (gr)</option>
                  <option value="ml">MiliLiter (ml)</option>
                  <option value="pcs">Pcs / Buah</option>
                  <option value="pack">Pack / Bungkus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Isi per Pembelian 
                <span className="text-xs text-gray-500 ml-1">(Total gram/ml yg didapat)</span>
              </label>
              <input 
                required 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                placeholder="Contoh: 1000 jika beli 1kg"
              />
              <p className="text-xs text-emerald-600 mt-1">
                {unit === 'kg' && "Tips: 1 Kg = 1000 gram."}
                {unit === 'liter' && "Tips: 1 Liter = 1000 ml."}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={resetForm}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm font-medium"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ingredients.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            <Package size={48} className="mx-auto mb-2 opacity-20" />
            <p>Belum ada bahan baku. Tambahkan sekarang!</p>
          </div>
        ) : (
          ingredients.map((ing) => (
            <div key={ing.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-emerald-200 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{ing.name}</h3>
                  <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                    {formatCurrency(ing.costPerSmallestUnit)} / unit
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Beli: {formatCurrency(ing.purchasePrice)} per {ing.purchaseAmount} {ing.purchaseUnit}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50">
                <button 
                  onClick={() => handleEdit(ing)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(ing.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};