import React, { useState } from 'react';
import { User, Shield, LogOut, Mail, Calendar, Key, AlertCircle, Building2, MapPin, Briefcase, Camera, Upload, X, Trash2, RotateCcw } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { BusinessProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  profile: BusinessProfile;
  onUpdateProfile: (profile: BusinessProfile) => void;
  onResetData?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile, onResetData }) => {
  const user = auth.currentUser;
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleResetData = () => {
    if (onResetData) {
      onResetData();
      setShowResetDialog(false);
      alert('Seluruh data berhasil dihapus.');
    }
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
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl px-1">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-brand-text tracking-tight uppercase">Pengaturan & Keamanan</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Business Profile Section */}
        <div className="bento-card border-brand-border/60 overflow-hidden relative group">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Profil Usaha</h3>
           </div>
           
           <form onSubmit={handleSaveProfile} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Nama Usaha</label>
                    <div className="relative">
                       <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                       <input 
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                          placeholder="Contoh: Toko Berkah Jaya"
                          className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Nama Pemilik</label>
                    <div className="relative">
                       <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                       <input 
                          type="text"
                          value={formData.ownerName}
                          onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                          placeholder="Nama Pemilik Usaha"
                          className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 transition-all"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Alamat Usaha</label>
                 <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-brand-muted" />
                    <textarea 
                       value={formData.address}
                       onChange={(e) => setFormData({...formData, address: e.target.value})}
                       placeholder="Alamat Lengkap Usaha"
                       rows={3}
                       className="w-full bg-brand-bg border border-brand-border rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                    ></textarea>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Logo Usaha</label>
                 <div className="flex gap-4 items-start">
                   <div className="w-24 h-24 rounded-2xl bg-brand-bg border-2 border-dashed border-brand-border flex items-center justify-center overflow-hidden flex-shrink-0 relative group shadow-sm transition-all hover:border-brand-primary/50">
                     {formData.logoUrl ? (
                       <>
                         <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                         <button 
                           type="button"
                           onClick={() => setFormData({...formData, logoUrl: ''})}
                           className="absolute inset-0 bg-brand-danger/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                         >
                           <X className="w-6 h-6" />
                         </button>
                       </>
                     ) : (
                       <Camera className="w-8 h-8 text-brand-muted/40" />
                     )}
                   </div>
                   <div className="flex-1 space-y-3">
                     <div className="flex gap-2">
                       <label className="flex-1 cursor-pointer bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 hover:border-brand-primary hover:bg-brand-primary/10 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all text-brand-primary uppercase tracking-tighter">
                         <Upload className="w-4 h-4" />
                         <span>Upload Logo (Galeri)</span>
                         <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                       </label>
                     </div>
                     <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
                        <input 
                           type="url"
                           value={formData.logoUrl}
                           onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                           placeholder="Atau tempel Link URL logo"
                           className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        />
                     </div>
                   </div>
                 </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                  isSaved ? 'bg-brand-success text-white' : 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isSaved ? 'PROFIL TERSIMPAN ✅' : 'SIMPAN PERUBAHAN'}
              </button>
           </form>

           <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors"></div>
        </div>

        {/* User Account Details */}
        <div className="bento-card border-brand-border/60">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Akun Pengguna</h3>
           </div>
          <div className="flex items-center gap-4 mb-6 pt-2">
            <div className="w-16 h-16 rounded-[24px] bg-brand-accent border-2 border-white shadow-md overflow-hidden p-0.5">
              <img 
                src={user?.photoURL || 'https://picsum.photos/seed/user/100/100'} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-[20px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-xl font-black text-brand-text leading-none">{user?.displayName || 'Pengguna SI LABAKU'}</p>
              <p className="text-xs text-brand-muted font-bold tracking-widest uppercase mt-1 opacity-60">
                {user?.email || 'Belum Terverifikasi'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-bg transition-colors hover:bg-brand-accent/30">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-muted" />
                <span className="text-sm font-bold text-brand-text">E-mail Terdaftar</span>
              </div>
              <span className="text-xs font-mono text-brand-muted">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-bg transition-colors hover:bg-brand-accent/30">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-brand-muted" />
                <span className="text-sm font-bold text-brand-text">ID Pengguna</span>
              </div>
              <span className="text-xs font-mono text-brand-muted">{user?.uid.slice(0, 12).toUpperCase() || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bento-card border-brand-border/60">
          <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Keamanan Login</h3>
           </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-brand-border bg-brand-card shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-success/10 flex items-center justify-center text-brand-success">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-text">Metode Autentikasi</p>
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Google OAuth 2.0</p>
              </div>
              <div className="ml-auto">
                <span className="px-2 py-1 bg-brand-success/10 text-brand-success text-[10px] font-black rounded-lg uppercase">Aktif</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-danger/5 border border-brand-danger/10">
              <AlertCircle className="w-5 h-5 text-brand-danger" />
              <div>
                <p className="text-xs font-bold text-brand-danger">Data Persisten</p>
                <p className="text-[10px] text-brand-danger/70 font-medium leading-tight">Sesi Anda dilindungi oleh enkripsi Firebase standar.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bento-card bg-brand-danger/5 border-brand-danger/10 space-y-4">
          <h3 className="text-[10px] font-black text-brand-danger uppercase tracking-[0.2em] mb-2 pl-1">Bahaya</h3>
          
          <button 
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center justify-center gap-3 p-4 bg-brand-danger text-white rounded-2xl font-black shadow-lg shadow-brand-danger/20 hover:bg-brand-danger/90 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>KELUAR APLIKASI</span>
          </button>

          <button 
            onClick={() => setShowResetDialog(true)}
            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-brand-danger text-brand-danger rounded-2xl font-black hover:bg-brand-danger hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RESET DATA</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutDialog && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutDialog(false)}
              className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-brand-card rounded-[32px] shadow-2xl relative z-[160] overflow-hidden"
            >
              <div className="p-8 text-center bg-brand-card">
                <div className="w-20 h-20 rounded-[28px] bg-brand-danger/10 flex items-center justify-center text-brand-danger mx-auto mb-6">
                  <LogOut className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-brand-text uppercase tracking-tight mb-2">Konfirmasi Keluar</h3>
                <p className="text-sm font-medium text-brand-muted leading-relaxed">
                  Apakah Anda yakin ingin mengakhiri sesi digital ini dan keluar dari aplikasi?
                </p>
              </div>

              <div className="p-6 bg-brand-card border-t border-brand-bg flex flex-col gap-3">
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-brand-danger text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-danger/20 hover:opacity-90 transition-all"
                >
                  Ya, Keluar Sekarang
                </button>
                <button 
                  onClick={() => setShowLogoutDialog(false)}
                  className="w-full py-4 bg-brand-card border border-brand-border text-brand-muted rounded-2xl font-black uppercase tracking-widest hover:bg-brand-card/80 transition-all"
                >
                  Batalkan
                </button>
              </div>
              
              <div className="py-3 text-center bg-brand-bg/50">
                 <p className="text-[8px] font-black text-brand-muted/40 uppercase tracking-[0.4em]">SI LABAKU ESSENTIALS</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetDialog && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetDialog(false)}
              className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-brand-card rounded-[32px] shadow-2xl relative z-[160] overflow-hidden border border-brand-danger/20"
            >
              <div className="p-8 text-center bg-brand-card">
                <div className="w-20 h-20 rounded-[28px] bg-brand-danger/10 flex items-center justify-center text-brand-danger mx-auto mb-6">
                  <Trash2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-brand-text uppercase tracking-tight mb-2">Hapus Seluruh Data?</h3>
                <p className="text-sm font-medium text-brand-muted leading-relaxed">
                  Tindakan ini akan <span className="text-brand-danger font-bold">MENGHAPUS SEMUA DATA</span> (Produk, Penjualan, Beban, dan Profil) secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="p-6 bg-brand-card border-t border-brand-bg flex flex-col gap-3">
                <button 
                  onClick={handleResetData}
                  className="w-full py-4 bg-brand-danger text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-danger/20 hover:opacity-90 transition-all"
                >
                  Ya, Hapus Semua Data
                </button>
                <button 
                  onClick={() => setShowResetDialog(false)}
                  className="w-full py-4 bg-brand-bg text-brand-muted rounded-2xl font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                >
                  Batalkan
                </button>
              </div>
              
              <div className="py-3 text-center bg-brand-danger/5">
                 <p className="text-[8px] font-black text-brand-danger/60 uppercase tracking-[0.4em]">PERINGATAN KERAS</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
