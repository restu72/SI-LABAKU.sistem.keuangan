/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  FileText,
  ChevronRight,
  Settings as SettingsIcon,
  LogOut,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Dashboard } from './components/Dashboard';
import { Kasir } from './components/Kasir';
import { Persediaan } from './components/Persediaan';
import { Beban } from './components/Beban';
import { Laporan } from './components/Laporan';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { 
    products, 
    sales, 
    expenses, 
    businessProfile,
    archivedReports,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addSale, 
    addExpense, 
    deleteExpense,
    updateExpense,
    updateBusinessProfile,
    resetAllData
  } = useLocalStorage();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard sales={sales} products={products} expenses={expenses} archivedReports={archivedReports} businessProfile={businessProfile} onNavigate={setView} />;
      case 'kasir':
        return <Kasir products={products} onAddSale={addSale} />;
      case 'persediaan':
        return (
          <Persediaan 
            products={products} 
            onAddProduct={addProduct} 
            onUpdateProduct={updateProduct} 
            onDeleteProduct={deleteProduct} 
          />
        );
      case 'beban':
        return (
          <Beban 
            expenses={expenses} 
            onAddExpense={addExpense} 
            onDeleteExpense={deleteExpense} 
            onUpdateExpense={updateExpense}
          />
        );
      case 'laporan':
        return <Laporan sales={sales} expenses={expenses} businessProfile={businessProfile} archivedReports={archivedReports} />;
      case 'laporan-archive':
        return <Laporan sales={sales} expenses={expenses} businessProfile={businessProfile} archivedReports={archivedReports} defaultShowArchive={true} />;
      case 'settings':
        return <Settings profile={businessProfile} onUpdateProfile={updateBusinessProfile} onResetData={resetAllData} />;
      default:
        return <Dashboard sales={sales} products={products} expenses={expenses} onNavigate={setView} />;
    }
  };

  const navItems = [
    { id: 'dashboard' as AppView, label: 'Beranda', icon: BarChart3 },
    { id: 'kasir' as AppView, label: 'Kasir', icon: ShoppingCart },
    { id: 'persediaan' as AppView, label: 'Stok', icon: Package },
    { id: 'beban' as AppView, label: 'Beban', icon: CreditCard },
    { id: 'settings' as AppView, label: 'Pengaturan', icon: SettingsIcon },
  ];

  const currentNavItem = navItems.find(n => n.id === view);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center">
      {/* Sidebar for Desktop / Container for mobile feel */}
      <div className="w-full max-w-7xl min-h-screen bg-brand-card md:bg-transparent relative flex flex-col md:flex-row md:gap-4 md:p-4">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-brand-card border border-brand-border p-8 h-[calc(100vh-2rem)] sticky top-4 rounded-[32px] shadow-sm">
          <div className="brand mb-4 text-2xl font-black tracking-tighter flex items-center gap-2">
             <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary-20">
               <BarChart3 className="w-6 h-6" />
             </div>
             <div className="flex flex-col -gap-1">
               <div className="flex items-center">
                 <span className="text-[#f97316]">SI</span>
                 <span className="text-brand-primary ml-1.5 text-xl">LABAKU</span>
               </div>
               <span className="text-[7px] text-brand-muted font-bold uppercase tracking-[0.1em] opacity-60">Sistem Informasi Laba Rugi</span>
             </div>
          </div>
          <div className="h-[1px] w-full bg-brand-border mb-8 shrink-0 opacity-50"></div>
          <nav className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all shrink-0 ${
                    isActive ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary-20' : 'text-brand-muted hover:bg-brand-accent hover:text-brand-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-8 pt-4 border-t border-brand-border/30 shrink-0">
            <div className="p-3 rounded-xl bg-brand-accent border border-brand-primary-10">
               <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">Status Sistem</p>
               <p className="text-[10px] text-brand-muted font-bold flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>
                 Operasional Normal
               </p>
            </div>
            <p className="mt-4 text-[9px] text-brand-muted font-black opacity-30 uppercase tracking-[0.3em] text-center">
              V 1.0.0 SI-LABA
            </p>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
          {/* Header */}
          <header className="p-6 md:px-4 bg-brand-card md:bg-transparent flex items-center justify-between sticky top-0 md:static z-40 backdrop-blur-md">
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black tracking-tighter flex items-center">
                <span className="text-[#f97316]">SI</span>
                <span className="text-brand-primary ml-1">LABAKU</span>
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-brand-text capitalize tracking-tight">{currentNavItem?.label || view}</h2>
                <p className="text-xs text-brand-muted font-medium">Manajemen Laba Rugi Akuntansi</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 md:p-2.5 rounded-xl bg-brand-accent text-brand-primary border border-brand-primary-10 hover:bg-brand-primary-10 transition-all active:scale-90"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <div 
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand-card border border-brand-border shadow-sm overflow-hidden p-0.5 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setView('settings')}
              >
                <img 
                  src={user?.photoURL || 'https://picsum.photos/seed/accountant/100/100'} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-[10px] md:rounded-[14px]" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 md:p-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto md:mx-0"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-brand-card-90 backdrop-blur-xl border border-brand-border p-2 rounded-[24px] flex justify-between items-center shadow-2xl mobile-nav-shadow z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-2xl transition-all ${
                  isActive ? 'text-brand-primary' : 'text-brand-muted hover:text-gray-600'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-brand-accent' : 'bg-transparent'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'fill-brand-primary-10' : ''}`} />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}



