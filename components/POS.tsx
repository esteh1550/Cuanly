import React, { useState } from 'react';
import { ShoppingCart, Trash2, Printer, Plus, Minus, X, Coffee, Send, Phone } from 'lucide-react';
import { MenuItem } from '../types';
import { formatCurrency, APP_NAME } from '../constants';

interface POSProps {
  menu: MenuItem[];
}

export const POS: React.FC<POSProps> = ({ menu }) => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    setCustomerPhone('');
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find(m => m.id === id);
    return sum + (item ? item.sellingPrice * (qty as number) : 0);
  }, 0);

  const handleSendWA = () => {
    let phone = customerPhone.trim();
    
    // Validasi sederhana
    if (!phone) {
      alert("Mohon masukkan nomor WhatsApp pembeli");
      return;
    }

    // Auto format 08 -> 628
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    }
    
    // Clean non-numeric just in case
    phone = phone.replace(/[^0-9]/g, '');

    const date = new Date().toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    // Construct WhatsApp Message
    let message = `*STRUK DIGITAL ${APP_NAME.toUpperCase()}*\n`;
    message += `${date}\n`;
    message += `--------------------------------\n`;
    
    Object.entries(cart).forEach(([id, qty]) => {
      const item = menu.find(m => m.id === id);
      if (item) {
        message += `${item.name} x${qty}\n`;
        message += `Rp${(item.sellingPrice * (qty as number)).toLocaleString('id-ID')}\n`;
      }
    });

    message += `--------------------------------\n`;
    message += `*TOTAL: ${formatCurrency(cartTotal)}*\n`;
    message += `--------------------------------\n`;
    message += `Terima kasih sudah jajan! 🙏\n`;
    message += `Simpan nomor ini untuk order lagi ya!`;

    // Open WhatsApp
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Receipt Content Component for Preview
  const ReceiptPreview = () => (
    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm leading-tight text-gray-700 border border-gray-200 mb-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase text-gray-900">{APP_NAME}</h2>
        <p className="text-xs text-gray-500">{new Date().toLocaleString('id-ID')}</p>
        <p className="text-xs text-gray-300">--------------------------------</p>
      </div>
      <div className="space-y-2 mb-4">
        {Object.entries(cart).map(([id, qty]) => {
          const item = menu.find(m => m.id === id);
          if (!item) return null;
          return (
            <div key={id} className="flex justify-between">
              <span>{item.name} x{qty}</span>
              <span>{formatCurrency(item.sellingPrice * (qty as number))}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-300 border-dashed pt-2 mb-2">
        <div className="flex justify-between font-bold text-lg text-gray-900">
          <span>TOTAL</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-24 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Kasir</h2>
        {Object.keys(cart).length > 0 && (
           <button 
             onClick={clearCart} 
             className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full"
           >
             <Trash2 size={16} /> Reset
           </button>
        )}
      </div>

      {/* Menu Grid */}
      {menu.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Coffee size={48} className="mb-2 opacity-50" />
          <p>Belum ada menu yang dibuat.</p>
          <p className="text-xs">Masuk ke tab "Menu" untuk membuat produk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pb-24">
          {menu.map(item => {
            const qty = cart[item.id] || 0;
            return (
              <button 
                key={item.id}
                onClick={() => addToCart(item.id)}
                className={`bg-white p-3 rounded-xl border shadow-sm text-left active:scale-95 transition-all flex flex-col h-full justify-between relative overflow-hidden ${qty > 0 ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}
              >
                {qty > 0 && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                    {qty}x
                  </div>
                )}
                <span className="font-semibold text-gray-800 line-clamp-2 text-sm">{item.name}</span>
                <span className="text-emerald-600 font-bold mt-2">{formatCurrency(item.sellingPrice)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cart Sheet (Sticky Bottom) */}
      {Object.keys(cart).length > 0 && !showReceipt && (
        <div className="fixed bottom-[70px] md:bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white rounded-xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100 p-4 z-50 animate-slide-up">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={18} /> Pesanan</h3>
            <span className="font-bold text-emerald-600 text-lg">{formatCurrency(cartTotal)}</span>
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-2 mb-3 pr-1">
             {Object.entries(cart).map(([id, qty]) => {
               const item = menu.find(m => m.id === id);
               if (!item) return null;
               return (
                 <div key={id} className="flex justify-between items-center text-sm">
                   <div className="flex-1 truncate pr-2 text-gray-700">{item.name}</div>
                   <div className="flex items-center gap-3">
                     <button onClick={() => removeFromCart(id)} className="bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 active:bg-gray-200">
                       <Minus size={14} />
                     </button>
                     <span className="w-4 text-center font-medium">{qty}</span>
                     <button onClick={() => addToCart(id)} className="bg-emerald-100 w-8 h-8 rounded-lg flex items-center justify-center text-emerald-700 active:bg-emerald-200">
                       <Plus size={14} />
                     </button>
                   </div>
                 </div>
               )
             })}
          </div>

          <button 
            onClick={() => setShowReceipt(true)}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-transform"
          >
            Bayar & Kirim Struk
          </button>
        </div>
      )}

      {/* Payment / WhatsApp Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Konfirmasi Pembayaran</h3>
              <button onClick={() => setShowReceipt(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={24} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <ReceiptPreview />
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-emerald-600"/>
                  Nomor WhatsApp Pembeli
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium text-lg">🇮🇩</span>
                  </div>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                    placeholder="08xxxxxxxxxx"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Otomatis membuka WhatsApp dengan struk yang sudah diketik.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => {
                  setCart({});
                  setCustomerPhone('');
                  setShowReceipt(false);
                }}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium active:bg-gray-50"
              >
                Selesai (Tanpa WA)
              </button>
              <button 
                onClick={handleSendWA}
                className="flex-1 py-3 bg-[#25D366] text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 active:bg-[#20bd5a] hover:bg-[#20bd5a]"
              >
                <Send size={18} /> Kirim WA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};