import React, { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  ShoppingCart,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
  X,
  ChevronRight,
  History,
  Search,
  Archive,
} from "lucide-react";
import {
  Sale,
  Product,
  Expense,
  AppView,
  ArchivedReport,
  BusinessProfile,
} from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  archivedReports: ArchivedReport[];
  businessProfile: BusinessProfile;
  onNavigate?: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  sales,
  products,
  expenses,
  archivedReports,
  businessProfile,
  onNavigate,
}) => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTunaiModal, setShowTunaiModal] = useState(false);
  const [showKreditModal, setShowKreditModal] = useState(false);
  const [kreditSearchQuery, setKreditSearchQuery] = useState("");

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Tunai vs Kredit Calculation
  const totalTunai = sales
    .filter((s) => s.paymentMethod === "tunai")
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const totalKredit = sales
    .filter((s) => s.paymentMethod === "kredit")
    .reduce((acc, s) => acc + s.totalAmount, 0);

  // Profit/Loss Calculation
  const totalCOGS = sales.reduce((acc, sale) => acc + sale.totalCost, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  // Calculate items with stock <= 20% of their initial amount
  const lowStockProducts = products.filter((p) => {
    const initial = p.initialStock ?? p.stock;
    if (initial === 0) return false;
    return p.stock <= initial * 0.2;
  });

  // Calculate Profit Comparison with Last Month
  const lastMonthProfit =
    archivedReports.length > 0 ? archivedReports[0].netProfit : 0;
  let profitComparison = 0;
  if (lastMonthProfit !== 0) {
    profitComparison =
      ((netProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100;
  } else if (netProfit !== 0) {
    profitComparison = 100;
  }

  const isProfitGrowing = profitComparison >= 0;

  // Prepare Chart Data (Last 6 Months Archive + Current)
  const chartData = [
    ...archivedReports
      .slice(0, 6)
      .reverse()
      .map((r) => r.netProfit),
    netProfit,
  ];
  const maxVal = Math.max(...chartData.map(Math.abs), 100000);
  const chartHeights = chartData.map(
    (val) => (Math.abs(val) / maxVal) * 85 + 5,
  ); // min 5% height

  // Recent activities
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const handleNav = (v: AppView) => onNavigate && onNavigate(v);

  return (
    <div className="space-y-6 md:space-y-8 pb-24">
      {/* Header Profile Section */}
      <div className="bg-brand-card p-6 md:p-8 rounded-[32px] border border-brand-border shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-xl shadow-brand-primary-20">
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase leading-none">
                <span className="text-brand-orange">SI</span>
                <span className="text-brand-primary ml-1">LABAKU</span>
              </h1>
              <p className="text-[10px] md:text-sm text-brand-muted font-bold mt-1 uppercase tracking-widest opacity-60">
                {businessProfile.name || "Dashboard Bisnis Anda"}
              </p>
            </div>
          </div>
          <div className="bg-brand-accent px-4 py-2 rounded-2xl border border-brand-primary-10 self-start md:self-center">
            <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">
              Status Laporan
            </p>
            <p className="text-xs font-black text-brand-text">
              Terverifikasi Digital ✅
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>

      {/* Bento Grid Layout */}
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Row 1: Action Buttons Grid (4 columns on mobile) */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 md:gap-4">
          <button
            onClick={() => handleNav("kasir")}
            className="bento-btn bg-brand-primary text-white p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/10"
          >
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Kasir
            </span>
          </button>
          <button
            onClick={() => handleNav("persediaan")}
            className="bento-btn bg-white text-brand-primary border border-brand-border p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-text/5"
          >
            <Package className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 text-brand-primary" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Stok
            </span>
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bento-btn bg-brand-orange text-white p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-orange/10"
          >
            <History className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Riwayat
            </span>
          </button>
          <button
            onClick={() => handleNav("laporan")}
            className="bento-btn bg-brand-primary text-white p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/10"
          >
            <FileText className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Laporan
            </span>
          </button>
          <button
            onClick={() => setShowTunaiModal(true)}
            className="bento-btn bg-brand-primary text-white p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/10"
          >
            <Wallet className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Tunai
            </span>
          </button>
          <button
            onClick={() => setShowKreditModal(true)}
            className="bento-btn bg-brand-orange text-white p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-orange/10"
          >
            <CreditCard className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Kredit
            </span>
          </button>
          <button
            onClick={() => handleNav("settings")}
            className="bento-btn bg-brand-accent text-brand-primary border border-brand-primary-20 p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/5"
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Profil
            </span>
          </button>
          <button
            onClick={() => handleNav("laporan-archive")}
            className="bento-btn bg-white text-brand-primary border border-brand-border p-3 md:p-4 rounded-2xl aspect-square flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-text/5"
          >
            <Archive className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 text-brand-primary" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">
              Arsip
            </span>
          </button>
        </div>

        {/* Row 2: Basic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bento-card bg-brand-card p-3 md:p-4 rounded-2xl border border-brand-border shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[8px] font-black text-brand-muted uppercase tracking-[0.15em] mb-0.5">
                  Total Pendapatan
                </p>
                <h3 className="text-lg md:text-xl font-black text-brand-primary font-mono tracking-tighter leading-none">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
            <div className="hidden md:block">
              <ChevronRight className="w-3.5 h-3.5 text-brand-muted opacity-20" />
            </div>
          </div>
          <div className="bento-card bg-brand-card p-3 md:p-4 rounded-2xl border border-brand-border shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-danger/10 flex items-center justify-center text-brand-danger shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[8px] font-black text-brand-muted uppercase tracking-[0.15em] mb-0.5">
                  Total Pengeluaran
                </p>
                <h3 className="text-lg md:text-xl font-black text-brand-danger font-mono tracking-tighter leading-none">
                  Rp {totalExpenses.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
            <div className="hidden md:block">
              <ChevronRight className="w-3.5 h-3.5 text-brand-muted opacity-20" />
            </div>
          </div>
        </div>

        {/* Row 3: Profit Performance (FULL WIDTH on mobile/desktop) */}
        <div className="bento-card bg-brand-card p-6 md:p-8 rounded-[32px] border border-brand-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-[12px] font-black text-brand-muted uppercase tracking-[0.2em]">
                Performa Laba Bersih
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`${isProfitGrowing ? "bg-brand-success" : "bg-brand-danger"} text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}
              >
                {isProfitGrowing ? "+" : ""}
                {Math.round(profitComparison)}%
              </span>
              <span className="text-[9px] text-brand-muted font-bold mt-1 uppercase opacity-40 tracking-wider">
                vs bln lalu
              </span>
            </div>
          </div>

          <div className="flex items-end gap-2 md:gap-4 h-48 md:h-64 mb-8">
            {chartHeights.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-xl transition-all duration-1000 origin-bottom hover:opacity-80 relative group ${i === chartHeights.length - 1 ? "bg-brand-primary shadow-lg shadow-brand-primary/20" : "bg-brand-border"}`}
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-text text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Rp {chartData[i].toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-brand-border flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
              <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-1">
                Total Laba Bersih Saat Ini
              </p>
              <h4
                className={`text-2xl md:text-4xl font-black font-mono tracking-tighter leading-none ${netProfit >= 0 ? "text-brand-success" : "text-brand-danger"}`}
              >
                {netProfit < 0 && "- "}Rp{" "}
                {Math.abs(netProfit).toLocaleString("id-ID")}
              </h4>
            </div>
            <button
              onClick={() => handleNav("laporan")}
              className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-1.5 border-b-2 border-brand-primary pb-0.5"
            >
              Lihat Detail Laporan <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 4: Low Stock Panel */}
        <div className="bento-card bg-brand-card p-6 md:p-8 rounded-[32px] border border-brand-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-danger" />
              <h3 className="text-[12px] font-black text-brand-muted uppercase tracking-[0.2em]">
                Stok Menipis (Hampir Habis)
              </h3>
            </div>
            <p className="text-[10px] font-black text-brand-danger uppercase bg-brand-danger/10 px-3 py-1 rounded-full">
              {lowStockProducts.length} Produk
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {lowStockProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-sm font-bold text-brand-muted uppercase tracking-widest opacity-40 italic">
                  Semua stok aman terkendali ✅
                </p>
              </div>
            ) : (
              lowStockProducts.slice(0, 8).map((product) => {
                const initial = product.initialStock || product.stock;
                const percentage =
                  initial > 0 ? (product.stock / initial) * 100 : 0;
                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl bg-brand-bg border border-brand-border group hover:border-brand-danger/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-black text-brand-text uppercase leading-none truncate mb-1">
                        {product.name}
                      </p>
                      <p className="text-[9px] text-brand-muted font-bold uppercase opacity-60">
                        Sisa: {product.stock} {product.unit}
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="h-1 bg-white rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-brand-danger transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-[8px] font-black text-brand-danger uppercase">
                        {Math.round(percentage)}% Tersisa
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div className="bg-brand-text p-8 md:p-12 rounded-[40px] text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 group">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-brand-orange"></div>
            Inspirasi Akuntan
          </h3>
          <p className="text-lg md:text-xl font-medium italic text-brand-accent-80 leading-relaxed">
            "Akuntansi bukan cuma soal angka, tapi soal membangun fondasi
            kejujuran dan transparansi yang kokoh bagi logika bisnis yang
            sehat."
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center md:items-end gap-3">
          <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-2xl">
            <BarChart3 className="w-10 h-10 text-brand-orange" />
          </div>
          <span className="text-[10px] font-black tracking-[0.5em] text-white/30 uppercase">
            SI LABAKU v1.0
          </span>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-orange/10 to-transparent opacity-50"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-brand-card rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-orange-10 text-brand-orange flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">
                      Riwayat Transaksi
                    </h3>
                    <p className="text-[9px] font-bold text-brand-muted uppercase opacity-60">
                      Aktivitas Terbaru
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-brand-bg rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-brand-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {recentSales.map((sale) => (
                  <button
                    key={sale.id}
                    onClick={() => {
                      setSelectedSale(sale);
                      setShowHistoryModal(false);
                    }}
                    className="w-full p-4 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-primary transition-all flex justify-between items-center text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-brand-text uppercase">
                          INV-{sale.id.slice(0, 6).toUpperCase()}
                        </p>
                        <p className="text-[9px] text-brand-muted font-bold opacity-60">
                          {new Date(sale.date).toLocaleDateString("id-ID")} •{" "}
                          {new Date(sale.date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black font-mono text-brand-primary">
                      Rp {sale.totalAmount.toLocaleString("id-ID")}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tunai Modal */}
      <AnimatePresence>
        {showTunaiModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTunaiModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-brand-bg rounded-[32px] w-full max-w-lg max-h-[80vh] shadow-2xl overflow-hidden flex flex-col relative"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary-20">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">
                      Transaksi Tunai
                    </h3>
                    <p className="text-[9px] font-bold text-brand-muted uppercase opacity-60">
                      Total: Rp {totalTunai.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTunaiModal(false)}
                  className="p-2 hover:bg-brand-accent rounded-full transition-colors text-brand-muted hover:text-brand-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {sales.filter((s) => s.paymentMethod === "tunai").length ===
                0 ? (
                  <div className="py-20 text-center text-sm font-bold text-brand-muted opacity-40 uppercase">
                    Belum ada transaksi tunai
                  </div>
                ) : (
                  sales
                    .filter((s) => s.paymentMethod === "tunai")
                    .reverse()
                    .map((sale) => (
                      <div
                        key={sale.id}
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowTunaiModal(false);
                        }}
                        className="p-4 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-between group cursor-pointer hover:border-brand-primary transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-primary-10 text-brand-primary flex items-center justify-center font-black text-xs">
                            {sale.items.reduce((acc, i) => acc + i.quantity, 0)}
                            x
                          </div>
                          <div>
                            <p className="font-black text-brand-text leading-tight uppercase text-xs">
                              INV-{sale.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-[9px] text-brand-muted font-bold mt-0.5">
                              {new Date(sale.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="font-mono font-black text-brand-primary text-sm">
                          Rp {sale.totalAmount.toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))
                )}
              </div>
              <div className="p-4 border-t border-brand-border bg-brand-card shrink-0">
                <button
                  onClick={() => setShowTunaiModal(false)}
                  className="w-full py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Tutup Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kredit Modal */}
      <AnimatePresence>
        {showKreditModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKreditModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-brand-bg rounded-[32px] w-full max-w-lg max-h-[80vh] shadow-2xl overflow-hidden flex flex-col relative"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-brand-orange-20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">
                      Transaksi Kredit
                    </h3>
                    <p className="text-[9px] font-bold text-brand-muted uppercase opacity-60">
                      {kreditSearchQuery ? "Total Hasil Cari: " : "Total: "}
                      Rp{" "}
                      {(() => {
                        const filtered = sales
                          .filter((s) => s.paymentMethod === "kredit")
                          .filter(
                            (s) =>
                              !kreditSearchQuery ||
                              (s.customerName &&
                                s.customerName
                                  .toLowerCase()
                                  .includes(kreditSearchQuery.toLowerCase())),
                          );
                        return filtered
                          .reduce((acc, s) => acc + s.totalAmount, 0)
                          .toLocaleString("id-ID");
                      })()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKreditModal(false)}
                  className="p-2 hover:bg-brand-accent rounded-full transition-colors text-brand-muted hover:text-brand-orange"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-brand-border bg-brand-bg shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    placeholder="Cari nama pelanggan..."
                    value={kreditSearchQuery}
                    onChange={(e) => setKreditSearchQuery(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:border-brand-orange transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {(() => {
                  const filteredSales = sales
                    .filter((s) => s.paymentMethod === "kredit")
                    .filter(
                      (s) =>
                        !kreditSearchQuery ||
                        (s.customerName &&
                          s.customerName
                            .toLowerCase()
                            .includes(kreditSearchQuery.toLowerCase())),
                    );
                  if (filteredSales.length === 0)
                    return (
                      <div className="py-20 text-center text-sm font-bold text-brand-muted opacity-40 uppercase">
                        Tidak ditemukan
                      </div>
                    );

                  const totalsPerCustomer: Record<string, number> = {};
                  sales
                    .filter((s) => s.paymentMethod === "kredit")
                    .forEach((s) => {
                      const name = s.customerName || "Tanpa Nama";
                      totalsPerCustomer[name] =
                        (totalsPerCustomer[name] || 0) + s.totalAmount;
                    });

                  return filteredSales.reverse().map((sale) => (
                    <div
                      key={sale.id}
                      onClick={() => {
                        setSelectedSale(sale);
                        setShowKreditModal(false);
                      }}
                      className="p-4 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-between group cursor-pointer hover:border-brand-orange transition-all"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-black text-brand-text leading-tight uppercase text-xs truncate">
                          {sale.customerName || "Tanpa Nama"}
                        </p>
                        <p className="text-[9px] text-brand-muted font-bold mt-0.5 truncate">
                          INV-{sale.id.slice(0, 8).toUpperCase()}
                        </p>
                        {sale.customerName && (
                          <div className="mt-1">
                            <p className="text-[8px] text-brand-muted font-bold opacity-70 truncate">
                              {sale.customerAddress}
                            </p>
                            <p className="text-[8px] font-black text-brand-orange uppercase tracking-tighter mt-0.5">
                              Total Hutang: Rp{" "}
                              {totalsPerCustomer[
                                sale.customerName
                              ].toLocaleString("id-ID")}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="font-mono font-black text-brand-orange text-sm shrink-0">
                        Rp {sale.totalAmount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ));
                })()}
              </div>
              <div className="p-4 border-t border-brand-border bg-brand-card shrink-0">
                <button
                  onClick={() => setShowKreditModal(false)}
                  className="w-full py-3 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Tutup Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sale Detail Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSale(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-card rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden relative"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${selectedSale.paymentMethod === 'tunai' ? 'text-brand-primary' : 'text-brand-orange'}`} />
                  <div>
                    <h3 className="text-sm font-black text-brand-text uppercase">
                      Detail Transaksi
                    </h3>
                    <p className="text-[10px] font-bold text-brand-muted uppercase opacity-60">
                      Total transaksi {selectedSale.paymentMethod}: Rp{" "}
                      {selectedSale.paymentMethod === "tunai"
                        ? totalTunai.toLocaleString("id-ID")
                        : totalKredit.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-2 hover:bg-brand-bg rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar max-h-[60vh]">
                <div className="bg-brand-bg p-6 rounded-2xl border border-brand-border">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-black text-brand-muted uppercase">
                      Tanggal
                    </span>
                    <span className="text-xs font-bold">
                      {new Date(selectedSale.date).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-black text-brand-muted uppercase">
                      Metode
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${selectedSale.paymentMethod === "tunai" ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-orange/10 text-brand-orange"}`}
                    >
                      {selectedSale.paymentMethod}
                    </span>
                  </div>
                  {selectedSale.paymentMethod === "kredit" && (
                    <div className="mb-4 pt-4 border-t border-brand-border">
                      <p className="text-[10px] font-black text-brand-muted uppercase mb-1">
                        Pelanggan
                      </p>
                      <p className="text-sm font-black uppercase leading-none">
                        {selectedSale.customerName}
                      </p>
                      <p className="text-[10px] text-brand-muted font-bold mt-1">
                        {selectedSale.customerAddress}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t border-brand-border">
                    <span className="text-sm font-black text-brand-muted uppercase">
                      Total Akhir
                    </span>
                    <span className={`text-2xl font-black font-mono ${selectedSale.paymentMethod === 'tunai' ? 'text-brand-primary' : 'text-brand-orange'}`}>
                      Rp {selectedSale.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedSale.items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="flex justify-between items-center p-3 rounded-xl bg-brand-bg border border-brand-border"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase leading-none">
                          {item.name}
                        </p>
                        <p className="text-[9px] text-brand-muted font-bold mt-1">
                          {item.quantity}x @ Rp{" "}
                          {item.priceAtSale.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-xs font-black font-mono">
                        Rp{" "}
                        {(item.priceAtSale * item.quantity).toLocaleString(
                          "id-ID",
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-brand-border bg-brand-card shrink-0">
                <button
                  onClick={() => setSelectedSale(null)}
                  className={`w-full py-3 ${selectedSale.paymentMethod === 'tunai' ? 'bg-brand-primary shadow-brand-primary/20' : 'bg-brand-orange shadow-brand-orange/20'} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
