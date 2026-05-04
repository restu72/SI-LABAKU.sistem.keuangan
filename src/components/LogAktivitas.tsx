import React, { useState, useEffect } from 'react';
import { Activity, User, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Tipe data buat log
interface LogItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  timestamp: any;
}

export const LogAktivitas: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data log dari Firebase
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        const logData: LogItem[] = [];
        querySnapshot.forEach((doc) => {
          logData.push({ 
            id: doc.id, 
            ...doc.data() 
          } as LogItem);
        });

        setLogs(logData);
      } catch (error) {
        console.error("Error mengambil log:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Format tanggal biar enak dibaca
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate();
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Log Aktivitas</h1>
          <p className="text-sm text-gray-500 font-medium">Riwayat penggunaan aplikasi oleh semua user</p>
        </div>
      </div>

      {/* Card Utama */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="font-bold text-gray-700">Daftar Aktivitas Terbaru</span>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              Total: {logs.length} data
            </span>
          </div>
        </div>

        {/* Isi Tabel */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Sedang memuat data...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">Belum ada data aktivitas</p>
              <p className="text-sm">Data akan muncul ketika user mulai menggunakan aplikasi</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pengguna</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aktivitas</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-brand-primary">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{log.userName || 'User'}</p>
                          <p className="text-xs text-gray-500">{log.userEmail || 'email@example.com'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {log.action || 'Aktivitas'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};