import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyRecord } from '../types';
import { formatCurrency } from '../constants';
import { TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

interface DashboardProps {
  dailyRecords: DailyRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ dailyRecords }) => {
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

  const today = dailyRecords.find(r => r.id === new Date().toISOString().split('T')[0]);
  const totalProfit = dailyRecords.reduce((acc, curr) => acc + (curr.isClosed ? curr.netProfit : 0), 0);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
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
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>Belum ada data penjualan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};