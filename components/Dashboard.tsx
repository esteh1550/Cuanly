import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyRecord, ViewState } from '../types';
import { formatCurrency } from '../constants';
import { TrendingUp, AlertCircle, DollarSign, Download, Share, Store, Lock, Play } from 'lucide-react';

interface DashboardProps {
  dailyRecords: DailyRecord[];
  setView: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ dailyRecords, setView }) => {
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosInstall, setShowIosInstall] = useState(false);

  useEffect(() => {
    // 1. Listen for Android install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // 2. Detect iOS for manual instructions
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIos && !isStandalone) {
      setShowIosInstall(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Get last 7 days of closed records
  const data = dailyRecords
    .filter(r => r.isClosed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('id-ID', { weekday: 'short' }),
      profit: r.netProfit,
      revenue: r.totalRevenue
    }));

  const todayStr = new Date().toISOString().split('T')[0];
  const today = dailyRecords.find(r => r.id === todayStr);
  const totalProfit = dailyRecords.reduce((acc, curr) => acc + (curr.isClosed ? curr.netProfit : 0), 0);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      
      {/* ACTION CARD (Top Priority) */}
      <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Status Toko Hari Ini</h2>
        
        {!today ? (
          // Case 1: Store Not Open Yet
          <button 
            onClick={() => setView('operations')}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            <Play size={24} fill="currentColor" />
            <div className="text-left">
              <span className="block font-bold text-lg">Buka Toko Hari Ini</span>
              <span className="text-xs opacity-90 font-normal">Mulai jualan & catat target cuan</span>
            </div>
          </button>
        ) : !today.isClosed ? (
          // Case 2: Store is Open
          <button 
            onClick={() => setView('operations')}
            className="w-full bg-amber-500 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-amber-600 transition-all active:scale-[0.98]"
          >
            <Lock size={24} />
            <div className="text-left">
              <span className="block font-bold text-lg">Tutup Toko & Hitung Cuan</span>
              <span className="text-xs opacity-90 font-normal">Input sisa makanan untuk hitung profit bersih</span>
            </div>
          </button>
        ) : (
          // Case 3: Store is Closed (Report Ready)
          <button 
            onClick={() => setView('operations')}
            className="w-full bg-gray-800 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-gray-900 transition-all active:scale-[0.98]"
          >
            <Store size={24} />
            <div className="text-left">
              <span className="block font-bold text-lg">Lihat Laporan Hari Ini</span>
              <span className="text-xs opacity-90 font-normal">Toko sudah tutup. Klik untuk detail/revisi.</span>
            </div>
          </button>
        )}
      </div>

      {/* PWA Install Banners */}
      {deferredPrompt && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-bold text-emerald-800 text-sm">Install Cuanly</h3>
            <p className="text-xs text-emerald-600">Pasang aplikasi agar lebih mudah diakses!</p>
          </div>
          <button 
            onClick={handleInstallClick}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 flex items-center gap-2"
          >
            <Download size={16} /> Install
          </button>
        </div>
      )}

      {showIosInstall && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <Share className="text-blue-600 shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-blue-800 text-sm">Install di iPhone/iPad</h3>
              <p className="text-xs text-blue-600 mt-1">
                1. Tap tombol <strong>Share</strong> di browser Safari Anda.<br/>
                2. Pilih menu <strong>"Add to Home Screen"</strong> (Tambah ke Utama).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm mb-1">Total Keuntungan (Semua Waktu)</p>
          <h2 className="text-4xl font-bold">{formatCurrency(totalProfit)}</h2>
          {today && !today.isClosed && (
            <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 p-2 rounded-lg w-fit">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Toko sedang buka
            </div>
          )}
        </div>
        <DollarSign className="absolute right-[-20px] bottom-[-20px] text-emerald-500 opacity-50 w-40 h-40" />
      </div>

      {/* Today's Quick Look */}
      {today && today.isClosed && (
        <div className="bg-white border-l-4 border-emerald-500 p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800">Performa Hari Ini</h3>
          <p className="text-sm text-gray-500">Profit: <span className="text-emerald-600 font-bold">{formatCurrency(today.netProfit)}</span></p>
          {today.netProfit < today.targetProfit && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertCircle size={12}/> Target {formatCurrency(today.targetProfit)} belum tercapai.
            </p>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-emerald-600" size={20} />
          <h3 className="font-bold text-gray-800">Tren Profit 7 Hari Terakhir</h3>
        </div>
        
        <div className="h-64 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Profit']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
              <Store size={32} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">Belum ada data penjualan.</p>
              <p className="text-xs mt-1">Tekan tombol "Buka Toko" di atas untuk mulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};