'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk Fitur Edit Profil
  const [isEditing, setIsEditing] = useState(false);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch('https://boardschool-backend-gkin.vercel.app/api/announcements', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        // Set data awal untuk form edit
        setNama(data?.nama || '');
        setEmail(data?.email || '');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  // Handler Submit Edit Profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');

    try {
     const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://boardschool-backend-gkin.vercel.app';

const res = await fetch(`${API_URL}/api/auth/profile`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ nama, email, password }),
});

      const data = await res.json();

      if (res.ok) {
        // Perbarui state user lokal
        setUser((prev: any) => ({ ...prev, nama, email }));
        setMessage({ type: 'success', text: '✅ Profil berhasil diperbarui!' });
        setPassword('');
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal memperbarui profil' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi ke server.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        
        {/* Header Profil */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-700">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase text-white shadow-md">
            {user?.nama ? user.nama.charAt(0) : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.nama}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {user?.role || 'Siswa'}
            </span>
          </div>
        </div>

        {/* Notifikasi Pesan */}
        {message.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Konten Utama (Kondisional: Mode Lihat / Mode Edit) */}
        {!isEditing ? (
          /* --- TAMPILAN DETAIL PROFIL --- */
          <div className="py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detail Informasi Pengguna</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline transition"
              >
                ✏️ Edit Profil
              </button>
            </div>
            
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Nama Lengkap</span>
                <span className="font-medium text-white">{user?.nama}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Email Terdaftar</span>
                <span className="font-medium text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Peran Sistem (Role)</span>
                <span className="font-medium text-blue-400 uppercase">{user?.role}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status Akun</span>
                <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Aktif & Terverifikasi
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* --- TAMPILAN FORM EDIT PROFIL --- */
          <form onSubmit={handleUpdateProfile} className="py-6 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Edit Data Pengguna</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">Email Terdaftar</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">
                  Password Baru <span className="text-slate-500">(Kosongkan jika tidak ingin ganti)</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Tombol Aksi Form Edit */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNama(user?.nama || '');
                  setEmail(user?.email || '');
                  setPassword('');
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 rounded-lg text-sm transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}

        {/* Tombol Navigasi / Aksi Utama */}
        <div className="flex gap-3 pt-2 border-t border-slate-700/60">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 rounded-lg text-sm transition"
          >
            Kembali ke Dashboard
          </button>
          <button
            onClick={() => {
              const konfirmasi = window.confirm('Apakah Anda yakin ingin keluar dari akun?');
              if (konfirmasi) {
                localStorage.clear();
                router.push('/');
              }
            }}
            className="bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-600/30 text-sm font-medium transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}