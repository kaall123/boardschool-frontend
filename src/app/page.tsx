'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('https://boardschool-backend-gkin.vercel.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal!');
      }

      // Simpan token JWT & role ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);

      // Pindah ke halaman dashboard pengumuman
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">BoardSchool</h1>
        <p className="text-slate-400 text-sm text-center mb-6">Masuk ke akun kamu</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="dika@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="dikakiblatgoldlane"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold p-2.5 rounded-lg transition"
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
  Belum punya akun?{' '}
  <button onClick={() => router.push('/register')} className="text-blue-400 hover:underline font-medium">
    Daftar dulu dongg
  </button>
</p>
      </div>
    </div>
  );
}