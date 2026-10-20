'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  // Mengambil parameter id dari URL dinamis Next.js App Router
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [kategori, setKategori] = useState('Umum');
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Ambil data pengumuman berdasarkan ID saat halaman pertama kali dibuka
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://boardschool-backend-gkin.vercel.app';

    // WAJIB PAKAI /${id} agar backend tahu pengumuman mana yang diambil
    fetch(`${API_URL}/api/announcements/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data pengumuman');
        return res.json();
      })
      .then((data) => {
        setJudul(data.judul || '');
        setIsi(data.isi || '');
        setKategori(data.kategori || 'Umum');
        setExistingImage(data.gambar || '');
        setFetching(false);
      })
      .catch((err) => {
        setError(err.message);
        setFetching(false);
      });
  }, [id, router]);

  // Fungsi saat tombol simpan / update ditekan
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('isi', isi);
    formData.append('kategori', kategori);
    if (image) {
      formData.append('gambar', image);
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://boardschool-backend-gkin.vercel.app';

      // WAJIB PAKAI /${id} pada method PUT
      const res = await fetch(`${API_URL}/api/announcements/${id}`, {
        method: 'PUT', 
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui pengumuman');

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Memuat data pengumuman...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold mb-6">Edit Pengumuman</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Judul Pengumuman</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              <option value="Umum">Umum</option>
              <option value="Akademik">Akademik</option>
              <option value="Kegiatan">Kegiatan Sekolah</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Isi Pengumuman</label>
            <textarea
              required
              rows={5}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Ganti Gambar (Opsional)</label>
            {existingImage && !image && (
              <div className="mb-2">
                <p className="text-xs text-slate-400 mb-1">Gambar saat ini:</p>
                <img src={existingImage} alt="Preview" className="h-20 rounded-lg border border-slate-700 object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 font-semibold p-2.5 rounded-lg transition disabled:opacity-50 text-white"
            >
              {loading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="bg-slate-700 hover:bg-slate-600 font-semibold px-4 py-2.5 rounded-lg transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}