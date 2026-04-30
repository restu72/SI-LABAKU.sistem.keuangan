import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Calendar, Tag, Edit2, X } from 'lucide-react';
import { Expense } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface BebanProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
}

const CATEGORIES = [
  'Gaji Karyawan',
  'Sewa Tempat',
  'Listrik & Air',
  'Transportasi',
  'Pemasaran',
  'Perlengkapan',
  'Penyusutan',
  'Lain-lain'
];

export const Beban: React.FC<BebanProps> = ({ expenses, onAddExpense, onDeleteExpense, onUpdateExpense }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    description: '',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateExpense(editingId, formData);
    } else {
      onAddExpense(formData);
    }
    setFormData({ category: CATEGORIES[0], description: '', amount: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount
    });
    setEditingId(expense.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ category: CATEGORIES[0], description: '', amount: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const totalBeban = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-brand-danger" />
          Beban Usaha
        </h2>
        <button 
          onClick={showForm ? resetForm : () => setShowForm(true)}
          className={`p-2 rounded-full shadow-lg transition-all ${
            showForm ? 'bg-gray-200 text-gray-600 rotate-45' : 'bg-brand-danger text-white'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-brand-danger/5 p-6 rounded-[24px] border border-brand-danger/10 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-brand-danger/60 uppercase tracking-widest">Total Pengeluaran</p>
          <p className="text-3xl font-black text-brand-danger font-mono">Rp {totalBeban.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-brand-danger/10 p-4 rounded-2xl">
          <Tag className="w-6 h-6 text-brand-danger" />
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-bg flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-brand-danger" />
                  {editingId ? 'Edit Beban' : 'Tambah Beban Baru'}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-brand-muted" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-4 rounded-2xl border border-brand-border bg-brand-bg focus:bg-white focus:ring-4 focus:ring-brand-danger/10 focus:border-brand-danger focus:outline-none transition-all font-bold"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Deskripsi</label>
                  <input 
                    required
                    type="text" 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Misal: Bayar Listrik"
                    className="w-full p-4 rounded-2xl border border-brand-border bg-brand-bg focus:bg-white focus:ring-4 focus:ring-brand-danger/10 focus:border-brand-danger focus:outline-none transition-all placeholder:text-brand-muted/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Jumlah (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-muted/50">Rp.</span>
                    <input 
                      required
                      type="number" 
                      value={formData.amount || ''}
                      onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      className="w-full p-4 pl-12 rounded-2xl border border-brand-border bg-brand-bg focus:bg-white focus:ring-4 focus:ring-brand-danger/10 focus:border-brand-danger focus:outline-none transition-all font-mono font-bold text-brand-danger"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button type="submit" className="w-full py-4 bg-brand-danger text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-danger/20 hover:opacity-90 active:scale-[0.98] transition-all">
                    {editingId ? 'Simpan Perubahan' : 'Tambah Beban'}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="w-full py-3 text-brand-muted font-bold text-[10px] uppercase tracking-[0.2em] hover:text-brand-text transition-colors"
                  >
                    Batalkan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1">Riwayat Pengeluaran</h3>
        {expenses.length === 0 && (
          <div className="text-center py-12 text-brand-muted italic bg-white rounded-[24px] border border-dashed border-brand-border">
            Belum ada data beban usaha.
          </div>
        )}
        {[...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
          <div key={expense.id} className="bg-white p-4 sm:p-5 rounded-[24px] border border-brand-border flex justify-between items-start sm:items-center hover:shadow-md transition-all group">
            <div className="flex gap-3 sm:gap-4 items-center min-w-0">
              <div className="bg-brand-bg p-2.5 sm:p-3 rounded-xl group-hover:bg-brand-danger/5 transition-colors shrink-0">
                <Calendar className="w-4 h-4 text-brand-muted group-hover:text-brand-danger" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-brand-text leading-tight truncate text-sm sm:text-base">{expense.description || expense.category}</p>
                <div className="flex flex-wrap gap-2 items-center mt-1">
                  <span className="text-[8px] sm:text-[9px] font-black text-brand-danger bg-brand-danger/10 px-2 py-0.5 rounded-full uppercase tracking-tighter whitespace-nowrap">{expense.category}</span>
                  <span className="text-[8px] sm:text-[9px] text-brand-muted font-mono whitespace-nowrap">{new Date(expense.date).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
              <p className="font-mono font-bold text-brand-danger text-sm sm:text-base">Rp {expense.amount.toLocaleString('id-ID')}</p>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => handleEdit(expense)}
                  className="bg-brand-bg border border-brand-border text-brand-muted hover:bg-brand-primary hover:text-white hover:border-brand-primary p-2 rounded-xl transition-all shadow-sm"
                  title="Edit Data"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(expense.id)}
                  className="bg-brand-bg border border-brand-border text-brand-muted hover:bg-brand-danger hover:text-white hover:border-brand-danger p-2 rounded-xl transition-all shadow-sm"
                  title="Hapus Data"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-brand-danger/10 text-brand-danger rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-brand-text uppercase tracking-tight mb-2">Hapus Pengeluaran?</h3>
              <p className="text-brand-muted text-sm mb-8">
                Apakah Anda yakin ingin menghapus catatan <span className="font-bold text-brand-text">"{expenses.find(e => e.id === deleteConfirmId)?.description || 'beban ini'}"</span>?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-3 px-6 bg-brand-bg text-brand-muted rounded-2xl font-bold hover:bg-brand-border transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    if (deleteConfirmId) {
                      onDeleteExpense(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }
                  }}
                  className="py-3 px-6 bg-brand-danger text-white rounded-2xl font-bold shadow-lg shadow-brand-danger/20 hover:opacity-90 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
