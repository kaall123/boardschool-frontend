'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAnnouncementPage() {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [kategori, setKategori] = useState('Umum');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
      const res = await fetch('https://boardschool-backend-gkin.vercel.app/api/announcements', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat pengumuman');

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl font-bold mb-6">Buat Pengumuman Baru</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Gambar (Opsional)</label>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold p-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Publikasikan'}
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