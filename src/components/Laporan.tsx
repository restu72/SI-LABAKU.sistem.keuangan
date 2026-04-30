import React, { useRef, useState, useMemo } from 'react';
import { FileText, TrendingUp, TrendingDown, BarChart3, MapPin, User, Building2, SquareArrowDown, History, X, Calendar } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Sale, Expense, BusinessProfile, ArchivedReport } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface LaporanProps {
  sales: Sale[];
  expenses: Expense[];
  businessProfile: BusinessProfile;
  archivedReports: ArchivedReport[];
  defaultShowArchive?: boolean;
}

export const Laporan: React.FC<LaporanProps> = ({ sales, expenses, businessProfile, archivedReports, defaultShowArchive = false }) => {
  const [showArchive, setShowArchive] = useState(defaultShowArchive);
  const [archiveView, setArchiveView] = useState<'monthly' | 'yearly'>('monthly');

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalCOGS = sales.reduce((acc, sale) => acc + sale.totalCost, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const currentPeriod = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  const reportRef = useRef<HTMLDivElement>(null);

  // Aggregation for Yearly Archive
  const yearlyArchives = useMemo(() => {
    const years: Record<string, ArchivedReport[]> = {};
    archivedReports.forEach(report => {
      const year = report.month.split('-')[0];
      if (!years[year]) years[year] = [];
      years[year].push(report);
    });

    return Object.entries(years).map(([year, reports]) => ({
      year,
      totalRevenue: reports.reduce((sum, r) => sum + r.totalRevenue, 0),
      totalExpenses: reports.reduce((sum, r) => sum + r.totalExpenses, 0),
      netProfit: reports.reduce((sum, r) => sum + r.netProfit, 0),
      salesCount: reports.reduce((sum, r) => sum + r.salesCount, 0),
      expensesCount: reports.reduce((sum, r) => sum + r.expensesCount, 0),
      monthsCount: reports.length
    })).sort((a, b) => parseInt(b.year) - parseInt(a.year));
  }, [archivedReports]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const element = reportRef.current;
    if (!element || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const worker = html2pdf();
      const opt = {
        margin: [15, 15, 15, 15], // Margin lebih pas
        filename: `SI_LABAKU_${businessProfile.businessName?.replace(/\s+/g, '_') || 'Laporan'}_${currentPeriod.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, // Skala lebih pas biar gak pecah
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1000, // Lebar standar A4
          windowWidth: 1000,
          onclone: (clonedDoc: Document) => {
            // 1. Remove non-print elements
            clonedDoc.querySelectorAll('.no-print').forEach(el => el.remove());

            // 2. Identify and setup target container
            const target = clonedDoc.querySelector('.pdf-export-style') as HTMLElement;
            if (target) {
              target.style.width = '1000px';
              target.style.margin = '0 auto';
              target.style.padding = '20px';
              target.style.boxShadow = 'none';
              target.style.border = 'none';
              target.style.backgroundColor = '#ffffff';
              target.style.borderRadius = '0';
              target.style.minHeight = '100vh';
            }

            // 3. Cleanup styles
            const modernColorRegex = /(?:oklch|oklab|color-mix|light-dark|hwb|lab|lch|cascade|clamp|color\([^)]+\))\s*\([^)]*\)/gi;
            const varRegex = /var\([^)]+\)/gi;

            const styles = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styles.length; i++) {
              const styleTag = styles[i];
              if (styleTag.textContent) {
                styleTag.textContent = styleTag.textContent
                  .replace(modernColorRegex, '#333333')
                  .replace(varRegex, '#333333');
              }
            }

            clonedDoc.querySelectorAll('*').forEach(el => {
              const htmlEl = el as HTMLElement;
              const styleAttr = htmlEl.getAttribute('style');
              if (styleAttr && (styleAttr.includes('okl') || styleAttr.includes('color') || styleAttr.includes('var'))) {
                htmlEl.setAttribute('style', styleAttr
                  .replace(modernColorRegex, '#333333')
                  .replace(varRegex, '#333333')
                );
              }

              // Fix Colors Manual
              if (htmlEl.classList.contains('text-brand-primary')) htmlEl.style.setProperty('color', '#0d9488', 'important');
              if (htmlEl.classList.contains('bg-brand-primary')) htmlEl.style.setProperty('background-color', '#0d9488', 'important');
              if (htmlEl.classList.contains('text-brand-success')) htmlEl.style.setProperty('color', '#059669', 'important');
              if (htmlEl.classList.contains('bg-brand-success')) htmlEl.style.setProperty('background-color', '#059669', 'important');
              if (htmlEl.classList.contains('text-brand-danger')) htmlEl.style.setProperty('color', '#e11d48', 'important');
              if (htmlEl.classList.contains('bg-brand-danger')) htmlEl.style.setProperty('background-color', '#e11d48', 'important');
              if (htmlEl.classList.contains('text-brand-text')) htmlEl.style.setProperty('color', '#0f172a', 'important');
              if (htmlEl.classList.contains('bg-brand-text')) htmlEl.style.setProperty('background-color', '#0f172a', 'important');
              if (htmlEl.classList.contains('bg-brand-bg')) htmlEl.style.setProperty('background-color', '#fcfaf6', 'important');
              if (htmlEl.classList.contains('bg-brand-card')) htmlEl.style.setProperty('background-color', '#ffffff', 'important');
              if (htmlEl.classList.contains('text-brand-muted')) htmlEl.style.setProperty('color', '#64748b', 'important');
              if (htmlEl.classList.contains('border-brand-border')) htmlEl.style.setProperty('border-color', '#e2e8f0', 'important');

              htmlEl.style.setProperty('transition', 'none', 'important');
              htmlEl.style.setProperty('animation', 'none', 'important');
              htmlEl.style.setProperty('transform', 'none', 'important');
            });
          }
        },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait', compress: true }
      };

      await worker.set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 printable">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-2xl font-black flex items-center gap-3 text-brand-text uppercase tracking-tight">
          <FileText className="w-7 h-7 text-brand-primary" />
          Laporan Laba Rugi
        </h2>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setShowArchive(true)}
            className="bg-brand-accent text-brand-primary px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-black text-[9px] border border-brand-primary/10 hover:bg-brand-primary/5 transition-all no-print"
          >
            <History className="w-3.5 h-3.5" />
            ARSIP
          </button>
          <button 
            type="button"
            disabled={isGenerating}
            onClick={(e) => { e.preventDefault(); handleDownload(); }}
            className={`bg-brand-text text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-black text-[9px] shadow-lg hover:scale-105 transition-all no-print ${isGenerating ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SquareArrowDown className="w-3.5 h-3.5 text-brand-primary" />
            )}
            {isGenerating ? 'MEMPROSES...' : 'PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        {/* Income Card */}
        <div className="bento-card shadow-sm border-brand-border/50 !p-4 md:!p-6 !rounded-[24px] md:!rounded-[32px]">
          <div className="flex justify-between items-start mb-1 md:mb-4">
            <div className="bg-brand-success-10 p-1.5 md:p-2 rounded-lg md:rounded-xl">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-brand-success" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-brand-muted uppercase tracking-widest">Pendapatan</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-brand-text font-mono truncate">Rp {totalRevenue.toLocaleString('id-ID')}</p>
          <p className="text-[10px] md:text-xs text-brand-muted mt-0.5 md:mt-1 uppercase tracking-tighter font-bold">Total Penjualan Kotor</p>
        </div>
      </div>

      <div className="bento-card shadow-sm border-brand-border/50 !p-4 md:!p-6 !rounded-[24px] md:!rounded-[32px]">
        <div className="flex justify-between items-start mb-1 md:mb-4">
          <div className="bg-brand-danger-10 p-1.5 md:p-2 rounded-lg md:rounded-xl">
            <TrendingDown className="w-4 h-4 md:w-6 md:h-6 text-brand-danger" />
          </div>
          <span className="text-[9px] md:text-[10px] font-bold text-brand-muted uppercase tracking-widest">Beban Usaha</span>
        </div>
        <p className="text-2xl md:text-3xl font-black text-brand-text font-mono truncate">Rp {totalExpenses.toLocaleString('id-ID')}</p>
        <p className="text-[10px] md:text-xs text-brand-muted mt-0.5 md:mt-1 uppercase tracking-tighter font-bold">Total Biaya Operasional</p>
      </div>
    </div>

    <div className="overflow-x-auto -mx-6 px-4 md:mx-0 md:px-0">
      <div 
        ref={reportRef} 
        className="bg-brand-card rounded-[24px] md:rounded-[40px] border border-brand-border overflow-hidden print:border-none print:shadow-none min-w-[320px] md:min-w-0 pdf-export-style"
      >
        <div className="bg-brand-text text-white p-5 md:p-6 text-left relative overflow-hidden border-b-4 border-brand-primary">
          <div className="relative z-10 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-lg shrink-0">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter flex items-center leading-none">
                  <span className="text-[#f97316]">SI</span>
                  <span className="text-brand-primary ml-1 italic uppercase">LABAKU</span>
                </h1>
                <p className="text-[#ffffff44] text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Report System</p>
              </div>
            </div>

            <div className="hidden lg:block flex-1 text-center">
              <p className="text-[#ffffff99] text-[9px] font-black uppercase tracking-[0.2em]">Laporan Laba Rugi</p>
              <p className="text-brand-primary font-black text-sm uppercase tracking-widest">{currentPeriod.toUpperCase()}</p>
            </div>

            <div className="bg-[#ffffff0d] p-3 md:p-4 rounded-xl border border-[#ffffff1a] flex items-center gap-3 max-w-[200px] md:max-w-xs shrink-0 cursor-default">
               {businessProfile.logoUrl ? (
                 <img src={businessProfile.logoUrl} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-md shrink-0" />
               ) : (
                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-[#ffffff1a] flex items-center justify-center shrink-0">
                   <Building2 className="w-5 h-5 md:w-6 md:h-6 text-[#ffffff33]" />
                 </div>
               )}
               <div className="flex flex-col min-w-0 pr-1">
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-tight text-white truncate">{businessProfile.businessName || 'USAHA ANDA'}</p>
                  <p className="text-[8px] md:text-[9px] text-[#ffffff66] font-medium flex items-center gap-1 truncate mt-0.5">
                    <MapPin className="w-2 h-2 shrink-0" />
                    {businessProfile.address || 'Alamat -'}
                  </p>
               </div>
            </div>
          </div>
          <div className="lg:hidden mt-4 pt-3 border-t border-[#ffffff1a] flex justify-between items-center relative z-10">
             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ffffff88]">Periode {currentPeriod.toUpperCase()}</p>
             <div className="flex items-center gap-2 opacity-30">
               <span className="text-[7px] font-black uppercase">{new Date().toLocaleDateString('id-ID')}</span>
             </div>
          </div>
          <FileText className="absolute -bottom-16 -right-16 w-64 h-64 text-[#ffffff08] rotate-12" />
        </div>

        <div className="p-8 md:p-12 space-y-10 md:space-y-12">
          <section className="space-y-8">
            <div className="flex justify-between items-center border-b-2 border-brand-bg pb-4">
              <h3 className="font-black text-brand-muted uppercase text-[10px] md:text-xs tracking-[0.2em] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                Deskripsi Pos Keuangan
              </h3>
              <h3 className="font-black text-brand-muted uppercase text-[10px] md:text-xs tracking-[0.2em]">Nilai (IDR)</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-success/10 flex items-center justify-center text-brand-success">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-brand-text font-bold text-sm md:text-lg">Pendapatan Penjualan</span>
                </div>
                <span className="font-mono font-bold tracking-tighter text-sm md:text-xl text-brand-text">{totalRevenue.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3 ml-11">
                  <span className="text-xs md:text-base text-brand-danger/80 italic font-medium">Harga Pokok Penjualan (HPP)</span>
                </div>
                <span className="font-mono text-xs md:text-lg text-brand-danger/80">({totalCOGS.toLocaleString('id-ID')})</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-bg/40 rounded-2xl border border-brand-bg mt-6">
                <span className="text-brand-text font-black uppercase text-[10px] md:text-xs tracking-widest">Laba Kotor</span>
                <span className="font-mono text-base md:text-2xl font-black text-brand-primary">
                  {grossProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-brand-danger/10 flex items-center justify-center text-brand-danger">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <h4 className="font-black text-brand-text text-[10px] md:text-xs uppercase tracking-[0.2em]">Beban Operasional</h4>
              </div>
              
              <div className="space-y-2">
                {
                  Array.from(new Set(expenses.map(e => e.category))).map(cat => {
                    const amount = expenses.filter(e => e.category === cat).reduce((acc, exp) => acc + exp.amount, 0);
                    return (
                      <div key={cat} className="flex justify-between items-center text-xs md:text-sm border-b border-brand-bg/50 pb-3 pl-11 pr-2">
                        <span className="text-brand-muted font-medium">{cat}</span>
                        <span className="font-mono text-brand-text font-bold">{amount.toLocaleString('id-ID')}</span>
                      </div>
                    );
                  })
                }
                {expenses.length === 0 && (
                  <div className="p-4 bg-brand-bg/20 rounded-xl border border-dashed border-brand-border text-center ml-11">
                    <p className="text-xs text-brand-muted italic">Tidak ada catatan beban.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center p-4 bg-brand-danger/[0.03] rounded-2xl border border-brand-danger/5 font-bold text-brand-danger mt-4">
                <span className="uppercase text-[10px] tracking-widest font-black">Total Seluruh Beban</span>
                <span className="font-mono font-black text-sm md:text-xl">{totalExpenses.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-4">
              <div className={`p-4 md:p-6 rounded-[20px] md:rounded-[28px] border-2 transition-all shadow-md ${netProfit >= 0 ? 'bg-brand-success/5 border-brand-success/20' : 'bg-brand-danger/5 border-brand-danger/20'}`}>
                <div className="flex flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-[16px] md:rounded-[20px] ${netProfit >= 0 ? 'bg-brand-success' : 'bg-brand-danger'} text-white shadow-lg flex items-center justify-center font-black text-base md:text-xl tracking-tighter shrink-0`}>
                      Rp
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mb-0.5 block">Hasil Penutup</span>
                      <h2 className="text-[11px] md:text-lg font-black uppercase tracking-tight text-brand-text leading-tight truncate">Laba (Rugi) Bersih</h2>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-lg md:text-3xl font-black font-mono tracking-tighter leading-none ${netProfit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                      {netProfit < 0 ? '-' : ''}{Math.abs(netProfit).toLocaleString('id-ID')}
                    </p>
                    <p className="text-[7px] md:text-[9px] text-brand-muted uppercase tracking-[0.2em] font-black mt-1">Laporan Final</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-brand-bg p-8 md:p-10 flex flex-col items-center border-t border-brand-border rounded-[24px]">
              <p className="text-[10px] text-brand-muted font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-8">Otorisasi Akuntan</p>
              <div className="flex flex-col items-center">
                <div className="h-[1px] w-48 bg-brand-border mb-3"></div>
                <p className="text-xs md:text-sm text-brand-text font-black uppercase tracking-tighter">Mahasiswa Akuntansi</p>
                <p className="text-[9px] md:text-[10px] text-brand-muted italic mt-1">SI LABAKU System Certified</p>
              </div>
          </div>
        </div>
      </div>
    </div>

    
    <style>{`
      /* PDF specific overrides to prevent oklab/oklch errors in html2canvas and maintain consistency */
      .pdf-export-style {
        background-color: #ffffff !important;
        color: #0f172a !important;
        color-scheme: light !important;
        font-family: "Inter", ui-sans-serif, system-ui, sans-serif !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      .pdf-export-style * {
        border-color: #f2eee8 !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        outline-color: #f2eee8 !important;
        transition: none !important;
        animation: none !important;
        text-shadow: none !important;
      }

      /* Essential Color Sync */
      .pdf-export-style .text-brand-primary { color: #0d9488 !important; }
      .pdf-export-style .text-brand-success { color: #059669 !important; }
      .pdf-export-style .text-brand-danger { color: #e11d48 !important; }
      .pdf-export-style .text-brand-text { color: #0f172a !important; }
      .pdf-export-style .text-brand-muted { color: #64748b !important; }
      .pdf-export-style .text-brand-orange { color: #f97316 !important; }
      .pdf-export-style .text-white { color: #ffffff !important; }
      
      /* Arbitrary color fixes */
      .pdf-export-style .text-\[\#f97316\] { color: #f97316 !important; }
      .pdf-export-style .text-\[\#ffffff44\] { color: rgba(255, 255, 255, 0.2) !important; }
      .pdf-export-style .text-\[\#ffffff99\] { color: rgba(255, 255, 255, 0.6) !important; }
      .pdf-export-style .text-\[\#ffffff66\] { color: rgba(255, 255, 255, 0.4) !important; }
      .pdf-export-style .text-\[\#ffffff0d\] { color: rgba(255, 255, 255, 0.05) !important; }
      
      .pdf-export-style .bg-brand-primary { background-color: #0d9488 !important; }
      .pdf-export-style .bg-brand-success { background-color: #059669 !important; }
      .pdf-export-style .bg-brand-danger { background-color: #e11d48 !important; }
      .pdf-export-style .bg-brand-text { background-color: #0f172a !important; }
      .pdf-export-style .bg-brand-bg { background-color: #fcfaf6 !important; }
      .pdf-export-style .bg-brand-card { background-color: #ffffff !important; }
      .pdf-export-style .bg-\[\#ffffff0d\] { background-color: rgba(255, 255, 255, 0.05) !important; }
      .pdf-export-style .bg-\[\#ffffff1a\] { background-color: rgba(255, 255, 255, 0.1) !important; }
      
      .pdf-export-style .border-brand-border { border-color: #f2eee8 !important; }
      .pdf-export-style .border-brand-primary { border-color: #0d9488 !important; }
      .pdf-export-style .border-brand-bg { border-color: #fcfaf6 !important; }

      /* Component specific fixes */
      .pdf-export-style .bg-brand-success\/10 { background-color: rgba(5, 150, 105, 0.1) !important; }
      .pdf-export-style .bg-brand-danger\/10 { background-color: rgba(225, 29, 72, 0.1) !important; }
      .pdf-export-style .bg-brand-primary\/10 { background-color: rgba(13, 148, 136, 0.1) !important; }
      .pdf-export-style .bg-brand-bg\/40 { background-color: rgba(252, 250, 246, 0.4) !important; }
      .pdf-export-style .bg-brand-bg\/20 { background-color: rgba(252, 250, 246, 0.2) !important; }
      .pdf-export-style .bg-brand-danger\/\[0.03\] { background-color: rgba(225, 29, 72, 0.03) !important; }
      .pdf-export-style .bg-brand-success\/5 { background-color: rgba(5, 150, 105, 0.05) !important; }
      .pdf-export-style .bg-brand-danger\/5 { background-color: rgba(225, 29, 72, 0.05) !important; }
      
      /* Ensure table-like rows don't break mid-way */
      .pdf-export-style section { page-break-inside: avoid; }
      
      @media print {
        .no-print { display: none !important; }
        body { background: white !important; }
      }
    `}</style>

      {/* Archive Modal */}
      <AnimatePresence>
        {showArchive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-bg rounded-[28px] w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] border border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-card rounded-t-[28px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-10 flex items-center justify-center text-brand-primary">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-brand-text tracking-tight uppercase">Arsip Laporan</h3>
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => setArchiveView('monthly')}
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${archiveView === 'monthly' ? 'bg-brand-primary text-white' : 'bg-brand-bg text-brand-muted opacity-60'}`}
                      >
                        Bulanan
                      </button>
                      <button 
                        onClick={() => setArchiveView('yearly')}
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${archiveView === 'yearly' ? 'bg-brand-primary text-white' : 'bg-brand-bg text-brand-muted opacity-60'}`}
                      >
                        Tahunan
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowArchive(false)} className="p-2 hover:bg-brand-bg rounded-xl transition-colors">
                  <X className="w-5 h-5 text-brand-muted" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {archiveView === 'monthly' ? (
                  archivedReports.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="w-10 h-10 text-brand-primary opacity-20" />
                      </div>
                      <p className="text-brand-muted font-bold italic text-sm">Belum ada laporan bulanan.</p>
                    </div>
                  ) : (
                    archivedReports.map((report, idx) => {
                      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(report.month + '-01'));
                      return (
                        <div key={idx} className="bg-brand-card p-6 rounded-[24px] border border-brand-border shadow-sm group hover:border-brand-primary/30 transition-all">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-brand-bg flex flex-col items-center justify-center border border-brand-border group-hover:bg-brand-primary group-hover:text-white transition-all">
                                 <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1 group-hover:opacity-100">{report.month.split('-')[1]}</span>
                                 <span className="text-sm font-black leading-none">{report.month.split('-')[0].slice(-2)}</span>
                               </div>
                               <div>
                                 <h4 className="font-black text-brand-text uppercase tracking-tight">{monthName}</h4>
                                 <div className="flex gap-3 mt-1">
                                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter bg-brand-bg px-2 py-0.5 rounded-lg border border-brand-border">
                                      {report.salesCount} Transaksi
                                    </span>
                                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter bg-brand-bg px-2 py-0.5 rounded-lg border border-brand-border">
                                      {report.expensesCount} Beban
                                    </span>
                                 </div>
                               </div>
                            </div>
                            
                            <div className="flex gap-8 justify-between md:justify-end items-center border-t md:border-t-0 border-brand-border pt-4 md:pt-0">
                               <div className="text-right">
                                 <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest opacity-60 mb-0.5">Laba Bersih</p>
                                 <p className={`text-lg font-black font-mono tracking-tighter ${report.netProfit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                                   {report.netProfit < 0 && '- '}Rp {Math.abs(report.netProfit).toLocaleString('id-ID')}
                                 </p>
                               </div>
                               <div className="w-[1px] h-10 bg-brand-border hidden md:block"></div>
                               <div className="text-right">
                                 <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest opacity-60 mb-0.5">Pendapatan</p>
                                 <p className="text-sm font-black font-mono text-brand-text">Rp {report.totalRevenue.toLocaleString('id-ID')}</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  yearlyArchives.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="w-10 h-10 text-brand-primary opacity-20" />
                      </div>
                      <p className="text-brand-muted font-bold italic text-sm">Belum ada data tahunan.</p>
                    </div>
                  ) : (
                    yearlyArchives.map((archive, idx) => (
                      <div key={idx} className="bg-brand-card p-6 rounded-[24px] border border-brand-border shadow-sm group hover:border-brand-primary/30 transition-all">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                               <span className="text-sm font-black">{archive.year}</span>
                             </div>
                             <div>
                               <h4 className="font-black text-brand-text uppercase tracking-tight">Tahun {archive.year}</h4>
                               <div className="flex gap-3 mt-1">
                                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-tighter bg-brand-primary/10 px-2 py-0.5 rounded-lg">
                                    {archive.monthsCount} Bulan
                                  </span>
                                  <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter bg-brand-bg px-2 py-0.5 rounded-lg border border-brand-border">
                                    {archive.salesCount} Transaksi
                                  </span>
                               </div>
                             </div>
                          </div>
                          
                          <div className="flex gap-8 justify-between md:justify-end items-center border-t md:border-t-0 border-brand-border pt-4 md:pt-0">
                             <div className="text-right">
                               <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest opacity-60 mb-0.5">Total Laba</p>
                               <p className={`text-lg font-black font-mono tracking-tighter ${archive.netProfit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                                 {archive.netProfit < 0 && '- '}Rp {Math.abs(archive.netProfit).toLocaleString('id-ID')}
                               </p>
                             </div>
                             <div className="w-[1px] h-10 bg-brand-border hidden md:block"></div>
                             <div className="text-right">
                               <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest opacity-60 mb-0.5">Pendapatan</p>
                               <p className="text-sm font-black font-mono text-brand-text">Rp {archive.totalRevenue.toLocaleString('id-ID')}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
              
              <div className="p-6 border-t border-brand-border bg-brand-card rounded-b-[28px] flex justify-center">
                 <p className="text-[9px] text-brand-muted font-bold uppercase tracking-[0.2em] opacity-40">SI LABAKU Archival System</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};