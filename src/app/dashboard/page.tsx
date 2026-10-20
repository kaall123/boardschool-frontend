'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk Search dan Filter Kategori
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // 🟢 State untuk Detail Pengumuman (Modal)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

  // 🟢 State untuk Custom Modal Konfirmasi (Logout / Hapus)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'logout' | 'delete' | null;
    targetId: number | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: null,
    targetId: null,
  });

  const router = useRouter();

  const fetchAnnouncements = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    // Ambil data profil user
    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => setUser(userData))
      .catch((err) => console.error(err));

    // Ambil daftar pengumuman
    fetch('http://localhost:5000/api/announcements', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [router]);

  // Fungsi Eksekusi Hapus
  const executeDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus pengumuman');

      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler Tombol Konfirmasi Utama
  const handleConfirmAction = () => {
    if (modalConfig.type === 'logout') {
      localStorage.clear();
      router.push('/');
    } else if (modalConfig.type === 'delete' && modalConfig.targetId !== null) {
      executeDelete(modalConfig.targetId);
    }
    setModalConfig({ isOpen: false, title: '', message: '', type: null, targetId: null });
  };

  // Filter pengumuman berdasarkan pencarian dan kategori
  const filteredAnnouncements = announcements.filter((item: any) => {
    const matchesSearch = 
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.isi.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'Semua' || item.kategori === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between relative">
      <div className="max-w-6xl mx-auto w-full p-6 flex-1">
        
        {/* HEADER / NAVBAR ATAS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BoardSchool</h1>
            <p className="text-slate-400 text-xs">Portal Pengumuman & Informasi Sekolah</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {user?.role === 'guru' && (
              <button
                onClick={() => router.push('/dashboard/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                + Buat Pengumuman
              </button>
            )}

            <button
              onClick={() => router.push('/profile')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Profil Saya
            </button>

            <button
              onClick={() => setModalConfig({
                isOpen: true,
                title: 'Konfirmasi Keluar',
                message: 'Apakah Anda yakin ingin keluar dari sesi akun ini?',
                type: 'logout',
                targetId: null,
              })}
              className="bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-600/30 text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* LANDING / BANNER TEMA */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            
            <h2 className="text-3xl font-extrabold text-white mt-3">Selamat Datang, {user?.nama || 'Pengguna'}!</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              Jendela informasi resmi sekolah. Temukan pengumuman penting, jadwal kegiatan, dan update akademik terbaru seputar lingkungan belajar BoardSchool dengan cepat dan transparan.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* SEARCH BAR & PILIHAN KATEGORI */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="w-full md:w-1/2 relative">
            <input
              type="text"
              placeholder="Cari judul atau isi pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition shadow-inner"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['Semua', 'Akademik', 'Kegiatan', 'Umum'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* DAFTAR KARTU PENGUMUMAN */}
        <h3 className="text-lg font-bold mb-4 text-slate-200">Daftar Pengumuman</h3>

        {loading ? (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400">Memuat pengumuman...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-slate-800/50 p-12 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-base">Tidak ada pengumuman yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAnnouncements.map((item: any) => (
              <div 
                key={item.id} 
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col justify-between hover:border-blue-500/50 hover:shadow-2xl transition cursor-pointer group"
                onClick={() => setSelectedAnnouncement(item)} // 🟢 Buka Modal Detail saat Card dipencet
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {item.kategori || 'Umum'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition">
                    {item.judul}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line line-clamp-3 mb-4">
                    {item.isi}
                  </p>
                  
                  {item.gambar && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-slate-700 h-48">
                      <img
                        src={item.gambar}
                        alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  
                  <span className="text-xs text-blue-400 font-semibold group-hover:underline inline-block mb-2">
                    Klik untuk baca selengkapnya &rarr;
                  </span>
                </div>

                {/* Tombol Aksi Guru */}
                {user?.role === 'guru' && (
                  <div 
                    className="flex items-center gap-2 pt-4 border-t border-slate-700/60 mt-2"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    <button
                      onClick={() => router.push(`/dashboard/edit/${item.id}`)}
                      className="flex-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 py-2 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setModalConfig({
                        isOpen: true,
                        title: 'Hapus Pengumuman',
                        message: `Apakah Anda yakin ingin menghapus pengumuman "${item.judul}"? Tindakan ini tidak dapat dibatalkan.`,
                        type: 'delete',
                        targetId: item.id,
                      })}
                      className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition text-center"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="w-full bg-slate-800/80 border-t border-slate-700/80 py-4 text-center text-slate-400 text-xs mt-12">
        <p>&copy; {new Date().getFullYear()} BoardSchool.</p>
        <p className="text-slate-500 text-[11px] mt-1">Portal Pengumuman & Informasi Sekolah</p>
      </footer>

      
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>

            {/* Kategori & Tanggal */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                {selectedAnnouncement.kategori || 'Umum'}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(selectedAnnouncement.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4 pr-8">
              {selectedAnnouncement.judul}
            </h2>

           
            {selectedAnnouncement.gambar && (
              <div className="mb-6 overflow-hidden rounded-xl border border-slate-700 max-h-96">
                <img
                  src={selectedAnnouncement.gambar}
                  alt={selectedAnnouncement.judul}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Isi Teks Pengumuman Lengkap */}
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 max-h-60 overflow-y-auto">
              {selectedAnnouncement.isi}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              
              <div>
                <h3 className="text-lg font-bold text-white">{modalConfig.title}</h3>
                <p className="text-xs text-slate-400">Konfirmasi tindakan penting</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {modalConfig.message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setModalConfig({ isOpen: false, title: '', message: '', type: null, targetId: null })}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition ${
                  modalConfig.type === 'logout' 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20' 
                    : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
                }`}
              >
                {modalConfig.type === 'logout' ? 'Ya, Keluar' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}