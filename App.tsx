import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { MenuBuilder } from './components/MenuBuilder';
import { Operations } from './components/Operations';
import { POS } from './components/POS';
import { useLocalStorage } from './services/storage';
import { Ingredient, MenuItem, DailyRecord, ViewState } from './types';
import { INITIAL_INGREDIENTS, INITIAL_MENU } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<ViewState>('dashboard');
  
  // Data Persistence
  const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>('cuanly_ingredients', INITIAL_INGREDIENTS);
  const [menu, setMenu] = useLocalStorage<MenuItem[]>('cuanly_menu', INITIAL_MENU);
  const [dailyRecords, setDailyRecords] = useLocalStorage<DailyRecord[]>('cuanly_records', []);

  // Check if today has a record
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = dailyRecords.find(r => r.id === todayStr);

  // Simple routing logic based on view state
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard dailyRecords={dailyRecords} />;
      case 'inventory':
        return <Inventory ingredients={ingredients} setIngredients={setIngredients} />;
      case 'menu':
        return <MenuBuilder ingredients={ingredients} menu={menu} setMenu={setMenu} />;
      case 'pos':
        return <POS menu={menu} />;
      case 'operations':
        return (
          <Operations 
            menu={menu} 
            dailyRecords={dailyRecords} 
            setDailyRecords={setDailyRecords}
            todayRecord={todayRecord}
          />
        );
      default:
        return <Dashboard dailyRecords={dailyRecords} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;