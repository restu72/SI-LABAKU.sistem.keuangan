import React, { useState } from 'react';
import { LogIn, ShieldCheck, BarChart3 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup
} from 'firebase/auth';

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-brand-primary rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-brand-primary/20 transition-transform hover:scale-110 duration-500 relative">
            <div className="absolute inset-0 bg-white/10 rounded-[40px] animate-pulse"></div>
            <BarChart3 className="w-12 h-12 relative z-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter flex items-center justify-center">
              <span className="text-[#f97316]">SI</span>
              <span className="text-brand-primary ml-2">LABAKU</span>
            </h1>
            <p className="text-brand-muted font-bold tracking-[0.1em] uppercase text-[12px]">SISTEM INFORMASI LABA RUGI KEUANGAN</p>
          </div>
        </div>

        <div className="bento-card bg-brand-card border-brand-border/60 p-8 md:p-12 space-y-6 flex flex-col items-stretch">
          <div className="space-y-2 text-center pb-4">
            <h2 className="text-2xl font-black text-brand-text tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-sm text-brand-muted font-medium">
              Silahkan Masuk ke Sistem Akuntansi SI LABAKU
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-brand-danger/5 border border-brand-danger/20 text-brand-danger text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-5 px-6 border border-brand-border hover:border-brand-primary bg-brand-card text-brand-text rounded-[24px] font-black flex items-center justify-center gap-4 transition-all active:scale-95 group shadow-lg shadow-brand-primary/5"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
              <LogIn className="w-5 h-5" />
            </div>
            <span className="text-lg">MASUK DENGAN GOOGLE</span>
          </button>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-accent/50 border border-brand-primary/10">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            <p className="text-[10px] text-brand-muted leading-tight font-bold">
              Autentikasi terenkripsi ujung-ke-ujung melalui Google. Data Anda aman dan terikat pada akun Google Anda.
            </p>
          </div>
        </div>
        {/* <div className="text-center mt-4">
  <a 
    href="/SI-LABAKU.apk"
    download
    className="inline-block px-6 py-3 bg-green-600 text-white rounded-full"
  >
    Download APK
  </a>
</div> */}

        <p className="text-center text-[10px] text-brand-muted font-black opacity-30 uppercase tracking-[0.4em]">
          V 1.0.0 SI-LABA
        </p>
      </div>
    </div>
  );
};
