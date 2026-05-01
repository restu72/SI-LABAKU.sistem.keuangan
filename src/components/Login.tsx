import React, { useState } from 'react';
 import { LogIn, ShieldCheck, BarChart3 } from 'lucide-react';
 import { auth } from '../lib/firebase';
 import { 
   GoogleAuthProvider, 
   signInWithRedirect,
   getRedirectResult
 } from 'firebase/auth';
 import { useNavigate } from 'react-router-dom'; // <-- TAMBAH INI
 export const Login: React.FC = () => {
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate(); // <-- TAMBAH INI
   React.useEffect(() => {
     const checkRedirectResult = async () => {
       try {
         const result = await getRedirectResult(auth);
         if (result) {
           console.log('Login success:', result.user);
           navigate('/dashboard'); // <-- TAMBAH INI
         }
       } catch (error: any) {
         console.error('Error:', error);
         setError(error.message);
       }
     };
     checkRedirectResult();
   }, [navigate]); // <-- TAMBAH INI
   const handleGoogleLogin = async () => {
     const provider = new GoogleAuthProvider();
     provider.addScope('profile');
     provider.addScope('email');
     
     setError(null);
     try {
       await signInWithRedirect(auth, provider);
     } catch (error: any) {
       console.error('Error:', error);
       setError(error.message);
     }
    };

  return (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
    <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Bagian Logo & Judul */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ 
          width: '96px', 
          height: '96px', 
          backgroundColor: '#059669', 
          borderRadius: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto',
          position: 'relative',
          boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.2)'
        }}>
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '40px' 
          }}></div>
          <img src="/logo-baru.png" alt="Logo SI LABAKU" style={{ width: '64px', height: '64px', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#f97316' }}>SI</span>
            <span style={{ color: '#059669', marginLeft: '0.5rem' }}>LABAKU</span>
          </h1>
          <p style={{ color: '#64748b', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '12px' }}>
            SISTEM INFORMASI LABA RUGI KEUANGAN
          </p>
        </div>
      </div>

      {/* Kotak Login */}
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e2e8f0', 
        borderRadius: '24px', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem' 
      }}>
        
        <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
            Selamat Datang
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
            Silahkan Masuk ke Sistem Akuntansi SI LABAKU
          </p>
        </div>

        {error && (
          <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            backgroundColor: 'white',
            color: '#0f172a',
            borderRadius: '24px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.1)'
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <LogIn size={20} />
          </div>
          <span style={{ fontSize: '1.125rem' }}>MASUK DENGAN GOOGLE</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <ShieldCheck size={20} style={{ color: '#059669', flexShrink: 0 }} />
          <p style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.2', fontWeight: 'bold' }}>
            Autentikasi terenkripsi ujung-ke-ujung melalui Google. Data Anda aman dan terikat pada akun Google Anda.
          </p>
        </div>

      </div>

      {/* Tombol Download APK */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a 
          href="/SI-LABAKU.apk"
          download
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#16a34a',
            color: 'white',
            borderRadius: '9999px',
            fontWeight: 'bold'
          }}
        >
          Download APK
        </a>
      </div>

      <p style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', fontWeight: '900', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.4em' }}>
        V 1.0.0 SI-LABAKU
      </p>

    </div>
  </div>
);
};