import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function Welcome() {
  const [formData, setFormData] = useState({
    email: 'admin@gmail.com', // Diubah dari username ke email
    password: 'admin123',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    router.post('/login', formData, {
      onError: (errors) => {
        setLoading(false);
        console.error('Login Error:', errors);
      },
      onFinish: () => setLoading(false),
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl mb-4 shadow-inner">
            <span className="material-symbols-outlined text-3xl">local_cafe</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Mie Gachor </h1>
          <p className="text-slate-500 text-sm mt-1">Login to access operations.</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Username / Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                person
              </span>
              <input
                type="text"
                name="email" // Diubah dari username ke email
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                placeholder="Masukkan email/username"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                lock
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
            Hak akses ditentukan oleh akun yang terdaftar.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#1A382B] hover:bg-[#12281E] text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            <span>{loading ? 'Memproses...' : 'Masuk'}</span>
            {!loading && (
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
