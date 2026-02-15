import React from 'react';
import { Home, Package, ChefHat, Store, ShoppingCart } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'inventory', label: 'Bahan', icon: Package },
    { id: 'menu', label: 'Menu', icon: ChefHat },
    { id: 'pos', label: 'Kasir', icon: ShoppingCart },
    { id: 'operations', label: 'Toko', icon: Store },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 px-4 py-3 md:hidden flex justify-between items-center">
        <h1 className="text-xl font-bold text-emerald-600 tracking-tight">Cuanly.</h1>
        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">v1.2</div>
      </header>

      {/* Desktop Sidebar / Content Wrapper */}
      <div className="md:flex md:min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 fixed h-full">
          <h1 className="text-2xl font-bold text-emerald-600 mb-8 tracking-tight">Cuanly.</h1>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-4xl mx-auto w-full mb-20 md:mb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Updated to Grid for better spacing of 5 items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`flex flex-col items-center justify-center w-full h-full active:bg-gray-50 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <div className={`p-1 rounded-full mb-0.5 transition-all ${isActive ? 'bg-emerald-50 translate-y-[-2px]' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};