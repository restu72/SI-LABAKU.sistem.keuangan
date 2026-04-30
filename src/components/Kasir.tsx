import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, Search, CreditCard, Wallet, Percent, X } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface KasirProps {
  products: Product[];
  onAddSale: (
    items: { productId: string; quantity: number }[], 
    discountPercent: number, 
    paymentMethod: 'tunai' | 'kredit',
    customerName?: string,
    customerAddress?: string
  ) => void;
}

export const Kasir: React.FC<KasirProps> = ({ products, onAddSale }) => {
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'kredit'>('tunai');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      const product = products.find(p => p.id === productId);
      if (!product) return prev;

      if (existing) {
        let newQuantity = existing.quantity;
        if (newQuantity >= 1) {
          newQuantity += 1;
        } else {
          newQuantity = Number((newQuantity + 0.1).toFixed(1));
        }

        if (newQuantity <= product.stock) {
          return prev.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item);
        }
        return prev;
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (!existing) return prev;

      let newQuantity = existing.quantity;
      if (newQuantity > 1) {
        newQuantity -= 1;
      } else if (newQuantity > 0.1) {
        newQuantity = Number((newQuantity - 0.1).toFixed(1));
      } else {
        return prev.filter(item => item.productId !== productId);
      }

      return prev.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item);
    });
  };

  const removeCompletely = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = cart.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + Math.round((product?.sellingPrice || 0) * item.quantity);
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const confirmPayment = () => {
    try {
      if (paymentMethod === 'kredit' && (!customerName.trim() || !customerAddress.trim())) {
        alert('Nama dan alamat pelanggan wajib diisi untuk pembayaran kredit.');
        return;
      }

      onAddSale(
        cart, 
        discountPercent, 
        paymentMethod, 
        paymentMethod === 'kredit' ? customerName : undefined, 
        paymentMethod === 'kredit' ? customerAddress : undefined
      );
      setCart([]);
      setDiscountPercent(0);
      setCustomerName('');
      setCustomerAddress('');
      setShowCheckoutModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          Kasir
        </h2>
      </div>

      <div className="flex flex-col space-y-6 pb-20">
        {/* 1. Search Panel */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1">Cari Produk</h3>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              placeholder="Cari produk atau SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-card border border-brand-border rounded-2xl py-4 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none shadow-sm"
            />
          </div>
        </div>

        {/* 2. Cart Panel */}
        <div className="space-y-2">
          <div className="bento-card shadow-xl shadow-brand-primary/5 bg-brand-card border-brand-border">
            <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-2">
              <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Keranjang Belanja</h3>
              <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                {cart.length} Item
              </span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {cart.length === 0 && (
                <div className="flex flex-col items-center py-6 opacity-40">
                  <ShoppingCart className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Keranjang Kosong</p>
                </div>
              )}
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                    <div key={item.productId} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-brand-bg border border-brand-border transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-brand-text truncate">{product.name}</p>
                        <p className="text-[10px] text-brand-muted font-mono">Rp {product.sellingPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-brand-card border border-brand-border rounded-xl">
                          <button onClick={() => removeFromCart(item.productId)} className="p-1.5 hover:bg-brand-accent text-brand-muted active:scale-95">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-bold text-xs">
                            {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1).replace('.', ',')}
                          </span>
                          <button onClick={() => addToCart(item.productId)} className="p-1.5 hover:bg-brand-accent text-brand-muted active:scale-95">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button onClick={() => removeCompletely(item.productId)} className="p-2 text-brand-muted hover:text-brand-danger bg-brand-card border border-brand-border rounded-xl transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                );
              })}
            </div>

            {cart.length > 0 && (
              <div className="mt-6 pt-4 border-t border-dashed border-brand-border space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-brand-muted">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1">
                      <Percent className="w-3 h-3" /> Diskon (%)
                    </span>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={discountPercent === 0 ? '' : discountPercent} 
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        placeholder="0"
                        className="w-20 bg-brand-bg border border-brand-border rounded-lg py-1 px-2 text-right text-xs font-black focus:border-brand-primary outline-none transition-all"
                      />
                      <span className="ml-1 text-[10px] font-black text-brand-muted">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-brand-border">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-tight">Total Akhir</span>
                    <span className="text-xl md:text-2xl font-black font-mono text-brand-primary tracking-tighter">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="px-5 py-3 md:px-8 md:py-4 bg-brand-primary text-white rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-widest shadow-lg shadow-brand-primary-20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    BAYAR SEKARANG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Product List Panel */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pl-1">Daftar Produk</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-sm font-bold text-brand-muted uppercase tracking-widest opacity-40 italic">
                  {products.length === 0 ? 'Belum ada produk' : 'Produk tidak ditemukan'}
                </p>
              </div>
            )}
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product.id)}
                disabled={product.stock <= 0}
                className={`p-4 rounded-[32px] border text-left transition-all flex items-center gap-4 group ${
                  product.stock <= 0 
                  ? 'bg-brand-bg border-brand-border opacity-60 cursor-not-allowed' 
                  : 'bg-brand-card border-brand-border hover:border-brand-primary h-shadow-md active:scale-95'
                }`}
              >
                <div className="w-16 h-16 rounded-[20px] bg-brand-card border border-brand-border overflow-hidden flex-shrink-0 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted/20">
                      <Plus className="w-6 h-6" />
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter -rotate-12">Habis</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-brand-text leading-tight truncate group-hover:text-brand-primary transition-colors">{product.name}</p>
                  <p className="text-[10px] text-brand-muted font-mono mt-1 opacity-60">{product.sku}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-mono text-brand-primary font-black text-sm tracking-tighter">
                      Rp {product.sellingPrice.toLocaleString('id-ID')}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black tracking-tighter uppercase ${
                      product.stock < 10 ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-success/10 text-brand-success'
                    }`}>
                      {product.stock} {product.unit || 'Unit'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>


      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-brand-bg rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-card">
                <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Konfirmasi Bayar</h3>
                <button onClick={() => setShowCheckoutModal(false)} className="p-1 hover:bg-brand-accent rounded-full text-brand-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="bg-brand-primary/5 rounded-2xl p-4 border border-brand-primary/10 text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total yang Harus Dibayar</p>
                  <p className="text-2xl font-black text-brand-primary font-mono tracking-tighter">Rp {total.toLocaleString('id-ID')}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Metode Pembayaran</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentMethod('tunai')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                        paymentMethod === 'tunai' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-[1.02]' 
                        : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-primary/30'
                      }`}
                    >
                      <Wallet className={`w-6 h-6 ${paymentMethod === 'tunai' ? 'text-white' : 'text-brand-primary'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tunai</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('kredit')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                        paymentMethod === 'kredit' 
                        ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20 scale-[1.02]' 
                        : 'bg-brand-card border-brand-border text-brand-muted hover:border-brand-orange/30'
                      }`}
                    >
                      <CreditCard className={`w-6 h-6 ${paymentMethod === 'kredit' ? 'text-white' : 'text-brand-orange'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Kredit</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'kredit' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-3 pt-2"
                  >
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Informasi Pelanggan</p>
                    <div className="space-y-3">
                      <input 
                        type="text"
                        placeholder="Nama Pelanggan"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white border border-brand-border rounded-xl py-3 px-4 text-xs font-bold focus:border-brand-orange outline-none transition-all shadow-sm"
                      />
                      <textarea 
                        placeholder="Alamat Pelanggan"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-brand-border rounded-xl py-3 px-4 text-xs font-bold focus:border-brand-orange outline-none transition-all shadow-sm resize-none"
                      ></textarea>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={confirmPayment}
                  className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                    paymentMethod === 'tunai' ? 'bg-brand-primary shadow-brand-primary/20' : 'bg-brand-orange shadow-brand-orange/20'
                  }`}
                >
                  Konfirmasi Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-success text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl z-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Transaksi Berhasil!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
