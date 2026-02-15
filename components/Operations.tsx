import React, { useState } from 'react';
import { Play, Lock, Save, Share2, AlertCircle } from 'lucide-react';
import { DailyRecord, MenuItem, DailySaleItem } from '../types';
import { formatCurrency } from '../constants';

interface OperationsProps {
  menu: MenuItem[];
  dailyRecords: DailyRecord[];
  setDailyRecords: (records: DailyRecord[]) => void;
  todayRecord: DailyRecord | undefined;
}

export const Operations: React.FC<OperationsProps> = ({ menu, dailyRecords, setDailyRecords, todayRecord }) => {
  const [target, setTarget] = useState('');
  const [salesInput, setSalesInput] = useState<{ [key: string]: { cooked: string; leftover: string } }>({});

  const handleStartDay = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: DailyRecord = {
      id: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      date: new Date().toISOString(),
      targetProfit: parseFloat(target),
      sales: [],
      totalRevenue: 0,
      totalCost: 0,
      netProfit: 0,
      isClosed: false
    };
    setDailyRecords([...dailyRecords, newRecord]);
  };

  const handleInputChange = (menuId: string, field: 'cooked' | 'leftover', value: string) => {
    setSalesInput(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [field]: value
      }
    }));
  };

  const handleCloseStore = () => {
    if (!todayRecord) return;
    if (!window.confirm("Yakin tutup toko? Data hari ini akan disimpan dan tidak bisa diubah lagi.")) return;

    let totalRev = 0;
    let totalCst = 0;
    const sales: DailySaleItem[] = [];

    menu.forEach(item => {
      const input = salesInput[item.id] || { cooked: '0', leftover: '0' };
      const cooked = parseInt(input.cooked) || 0;
      const leftover = parseInt(input.leftover) || 0;
      const sold = Math.max(0, cooked - leftover);

      totalRev += sold * item.sellingPrice;
      // Cost is based on what was COOKED (wasted food is lost money), plus overhead per item cooked
      totalCst += cooked * item.baseCost;

      sales.push({
        menuItemId: item.id,
        cookedQty: cooked,
        leftoverQty: leftover,
        soldQty: sold
      });
    });

    const netProfit = totalRev - totalCst;

    const updatedRecord: DailyRecord = {
      ...todayRecord,
      sales,
      totalRevenue: totalRev,
      totalCost: totalCst,
      netProfit,
      isClosed: true
    };

    setDailyRecords(dailyRecords.map(r => r.id === todayRecord.id ? updatedRecord : r));
  };

  const handleShareWA = (record: DailyRecord) => {
    const lines = [
      `*Laporan Cuanly - ${new Date(record.date).toLocaleDateString('id-ID')}*`,
      `------------------`,
      `💰 Omzet: ${formatCurrency(record.totalRevenue)}`,
      `📉 HPP & Ops: ${formatCurrency(record.totalCost)}`,
      `💵 *Profit Bersih: ${formatCurrency(record.netProfit)}*`,
      `------------------`,
      `Target: ${formatCurrency(record.targetProfit)}`,
      `Status: ${record.netProfit >= record.targetProfit ? '✅ Tercapai' : '⚠️ Belum Tercapai'}`,
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // --- Views ---

  // 1. Not Started Yet
  if (!todayRecord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600">
          <Play size={48} fill="currentColor" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mulai Jualan Hari Ini?</h2>
          <p className="text-gray-500 mt-2">Tentukan target cuanmu hari ini agar lebih semangat!</p>
        </div>
        <form onSubmit={handleStartDay} className="w-full max-w-xs space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Profit Bersih (Rp)</label>
            <input 
              required 
              type="number" 
              value={target} 
              onChange={e => setTarget(e.target.value)}
              className="w-full bg-white text-gray-900 text-center text-lg py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
              placeholder="200000"
            />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-transform active:scale-95">
            Buka Toko 🚀
          </button>
        </form>
      </div>
    );
  }

  // 2. Closed (Report View)
  if (todayRecord.isClosed) {
    const isTargetMet = todayRecord.netProfit >= todayRecord.targetProfit;
    return (
      <div className="space-y-6 pb-24 animate-fade-in">
        <div className={`p-6 rounded-2xl text-white shadow-lg ${isTargetMet ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-amber-500 to-amber-700'}`}>
          <h2 className="text-lg font-medium opacity-90 mb-1">Profit Bersih Hari Ini</h2>
          <div className="text-4xl font-bold mb-4">{formatCurrency(todayRecord.netProfit)}</div>
          <div className="flex items-center gap-2 text-sm bg-white/20 p-2 rounded-lg w-fit">
            {isTargetMet ? '🎉 Target Tercapai!' : '💪 Besok pasti lebih baik!'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Omzet</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(todayRecord.totalRevenue)}</p>
          </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Biaya (HPP+Ops)</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(todayRecord.totalCost)}</p>
          </div>
        </div>

        <button 
          onClick={() => handleShareWA(todayRecord)}
          className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 hover:bg-[#20bd5a]"
        >
          <Share2 size={20} /> Share Laporan ke WA
        </button>
      </div>
    );
  }

  // 3. Open (Closing Form View)
  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Target Hari Ini</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(todayRecord.targetProfit)}</p>
        </div>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          TOKO BUKA
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={20} className="text-gray-700" />
          <h2 className="text-xl font-bold text-gray-800">Tutup Toko (Input Penjualan)</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Masukkan jumlah yang dimasak dan sisa untuk menghitung profit akurat.</p>

        {menu.map(item => {
           const input = salesInput[item.id] || { cooked: '', leftover: '' };
           const cooked = parseFloat(input.cooked) || 0;
           const leftover = parseFloat(input.leftover) || 0;
           const sold = Math.max(0, cooked - leftover);
           const estimatedProfit = (sold * item.sellingPrice) - (cooked * item.baseCost);

           return (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between mb-3">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <span className="text-xs text-gray-400">Profit/porsi: {formatCurrency(item.sellingPrice - item.baseCost)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Masak (Porsi)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={input.cooked}
                    onChange={e => handleInputChange(item.id, 'cooked', e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Sisa (Porsi)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={input.leftover}
                    onChange={e => handleInputChange(item.id, 'leftover', e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                 <span className="text-gray-600">Terjual: <b>{sold}</b></span>
                 <span className={`${estimatedProfit >= 0 ? 'text-emerald-600' : 'text-red-500'} font-medium`}>
                   Est. Cuan: {formatCurrency(estimatedProfit)}
                 </span>
              </div>
            </div>
           );
        })}
      </div>

      <div className="fixed bottom-20 left-4 right-4 md:static md:bottom-auto md:mx-0">
        <button 
          onClick={handleCloseStore}
          className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-amber-600 flex justify-center items-center gap-2"
        >
          <Save size={24} /> Simpan & Tutup Toko
        </button>
      </div>
    </div>
  );
};