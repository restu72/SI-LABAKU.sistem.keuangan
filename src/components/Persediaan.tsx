import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, Edit2, Trash2, X, Upload, Camera } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getBaseName } from '../lib/productUtils';

interface PersediaanProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export const Persediaan: React.FC<PersediaanProps> = ({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    unit: 'Unit',
    imageUrl: ''
  });

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const nameA = getBaseName(a.name).toLowerCase();
      const nameB = getBaseName(b.name).toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      
      const skuA = a.sku.toLowerCase();
      const skuB = b.sku.toLowerCase();
      if (skuA < skuB) return -1;
      if (skuA > skuB) return 1;

      return b.sellingPrice - a.sellingPrice;
    });
  }, [products]);

  const filteredProducts = sortedProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateProduct(editingId, formData);
    } else {
      onAddProduct(formData);
    }
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit for LocalStorage safety
        alert('File terlalu besar! Maksimal 1MB untuk performa terbaik.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', costPrice: 0, sellingPrice: 0, stock: 0, unit: 'Unit', imageUrl: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      ...product,
      name: product.name.replace(/ - Grade [A-Z]+$/, '')
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-primary" />
          Persediaan Barang
        </h2>
        <button 
          onClick={() => setShowForm(true)}
          className="p-2 rounded-full shadow-lg transition-all bg-brand-primary text-white hover:opacity-90 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-card rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-bg flex justify-between items-center bg-brand-card/50">
                <h3 className="text-sm font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-brand-primary" />
                  {editingId ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-brand-muted" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-bg space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Nama Produk</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={e => {
                          const newName = e.target.value;
                          const updates: Partial<typeof formData> = { name: newName };
                          
                          // Auto-generate SKU for NEW products only if SKU is empty
                          if (!editingId && newName.trim() && !formData.sku) {
                            const prefix = newName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
                            const random = Math.floor(1000 + Math.random() * 9000);
                            updates.sku = `${prefix}-${random}`;
                          } else if (!newName.trim() && !editingId) {
                            updates.sku = '';
                          }
                          
                          setFormData({ ...formData, ...updates });
                        }}
                        placeholder="Masukkan nama produk..."
                        className="w-full p-4 rounded-2xl border border-brand-border bg-brand-bg focus:bg-brand-card focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-muted/30" 
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">SKU / Kode Produk</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.sku}
                        onChange={e => setFormData({...formData, sku: e.target.value})}
                        placeholder="Kode SKU..."
                        className="w-full p-4 rounded-2xl border border-brand-border bg-brand-bg focus:bg-brand-card focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none transition-all font-mono text-sm uppercase" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Satuan</label>
                      <select 
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                        className="w-full p-4 rounded-2xl border border-brand-border bg-brand-bg focus:bg-brand-card focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none transition-all font-bold"
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Unit">Unit</option>
                        <option value="Box">Box</option>
                        <option value="Pack">Pack</option>
                        <option value="Botol">Botol</option>
                        <option value="Kg">Kg</option>
                        <option value="Liter">Liter</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Harga Beli (Modal)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-muted/40">Rp.</span>
                        <input 
                          required 
                          type="number" 
                          value={formData.costPrice || ''}
                          onChange={e => setFormData({...formData, costPrice: parseInt(e.target.value) || 0})}
                          className="w-full p-4 pl-12 rounded-2xl border border-brand-border bg-brand-bg focus:bg-brand-card focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none transition-all font-mono" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Harga Jual</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-muted/40">Rp.</span>
                        <input 
                          required 
                          type="number" 
                          value={formData.sellingPrice || ''}
                          onChange={e => setFormData({...formData, sellingPrice: parseInt(e.target.value) || 0})}
                          className="w-full p-4 pl-12 rounded-2xl border border-brand-border bg-brand-bg focus:bg-brand-card focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none transition-all font-mono font-bold text-brand-primary" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Stok Saat Ini</label>
                      <input 
                        required 
                        type="number" 
                        value={formData.stock || ''}
                        onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        className="w-full p-4 rounded-2xl border border-brand-border bg-brand-bg focus:bg-brand-card focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none transition-all font-bold" 
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1 text-left block">Foto Produk</label>
                      <div className="flex gap-6 items-center bg-brand-bg/50 p-4 rounded-2xl border border-brand-border/50">
                        <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                          {formData.imageUrl ? (
                            <>
                              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => setFormData({...formData, imageUrl: ''})}
                                className="absolute inset-0 bg-brand-danger/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <Camera className="w-6 h-6 text-brand-muted/30" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="inline-flex cursor-pointer bg-white border border-brand-border hover:border-brand-primary px-4 py-2.5 rounded-xl items-center gap-2 text-[10px] font-bold transition-all shadow-sm">
                            <Upload className="w-4 h-4 text-brand-primary" />
                            <span>Ambil dari Galeri</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                          <input 
                            type="url" 
                            placeholder="Atau tempel URL gambar..."
                            value={formData.imageUrl}
                            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            className="w-full p-3 text-[10px] rounded-xl border border-brand-border bg-white focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Daftarkan Produk'}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari nama atau SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-border bg-brand-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-sm"
        />
      </div>

      {/* Table/List View */}
      <div className="bg-brand-card rounded-[24px] border border-brand-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-brand-bg border-b border-brand-border text-brand-muted uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4 text-center">Persentase</th>
                <th className="px-6 py-4 text-center">Biaya</th>
                <th className="px-6 py-4 text-center">Harga Jual</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-muted/40">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-brand-text leading-tight">{product.name}</p>
                        <p className="text-[10px] text-brand-muted font-mono mt-0.5">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                      {(() => {
                        const initial = product.initialStock || product.stock;
                        const percentage = initial > 0 ? (product.stock / initial) * 100 : 0;
                        const isLow = percentage <= 20;
                        
                        return (
                          <>
                            <div className="flex justify-between w-full text-[9px] font-black uppercase tracking-tighter">
                              <span className={isLow ? 'text-brand-danger' : 'text-brand-muted opacity-60'}>Sisa</span>
                              <span className={isLow ? 'text-brand-danger' : 'text-brand-primary'}>{Math.round(percentage)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden border border-brand-border/50">
                              <div 
                                className={`h-full transition-all duration-1000 ${isLow ? 'bg-brand-danger' : 'bg-brand-primary'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-mono text-xs opacity-70">Rp {product.costPrice.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-5 text-center font-mono text-brand-primary font-bold">Rp {product.sellingPrice.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-tight ${
                      product.stock < 10 ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-success/10 text-brand-success'
                    }`}>
                      {product.stock} {product.unit?.toUpperCase() || 'UNIT'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button 
                        onClick={() => handleEdit(product)} 
                        title="Edit Produk"
                        className="p-2.5 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all border border-transparent hover:border-brand-primary/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(product.id)} 
                        title="Hapus Produk"
                        className="p-2.5 text-brand-danger/60 hover:text-brand-danger hover:bg-brand-danger/5 rounded-xl transition-all border border-transparent hover:border-brand-danger/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 italic">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-card rounded-[32px] w-full max-sm shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-brand-danger/10 text-brand-danger rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-brand-text uppercase tracking-tight mb-2">Hapus Produk?</h3>
              <p className="text-brand-muted text-sm mb-8">
                Apakah Anda yakin ingin menghapus <span className="font-bold text-brand-text">"{products.find(p => p.id === deleteConfirmId)?.name}"</span>? Tindakan ini tidak dapat dibatalkan.
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
                      onDeleteProduct(deleteConfirmId);
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
