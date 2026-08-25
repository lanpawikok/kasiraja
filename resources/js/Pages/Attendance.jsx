import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

export default function Attendance({ attendances = [] }) {
  const [currentTime, setCurrentTime] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  // State untuk Custom Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  useEffect(() => {
    setBaseUrl(window.location.origin);

    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Membuka custom modal konfirmasi hapus
  const handleDeleteClick = (id, staffName) => {
    setDeleteModal({ isOpen: true, id, name: staffName });
  };

  // Eksekusi hapus data setelah konfirmasi di modal
  const confirmDelete = () => {
    if (deleteModal.id) {
      router.delete(`/attendance/${deleteModal.id}`, {
        preserveScroll: true,
        onSuccess: () => setDeleteModal({ isOpen: false, id: null, name: '' }),
      });
    }
  };

  const qrUrl = baseUrl ? `${baseUrl}/attendance/scan` : `http://localhost:8000/attendance/scan`;

  return (
    <>
      <style>{`
        body { min-height: max(884px, 100dvh); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col md:flex-row pb-20 md:pb-0">

        {/* NavigationDrawer */}
        <nav className="bg-surface-container-low dark:bg-surface-container h-full w-72 rounded-r-xl fixed left-0 top-0 z-40 hidden md:flex flex-col p-md shadow-sm">
          <div className="flex items-center gap-md mb-xl">
            <img
              className="w-12 h-12 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvNWsdJR8uafCo4xe092PyHKrK3rod3rNmjHiBlUk6aq1Njac47A5_pm-95iR0WTUB06fNYxCQkzjcMbxIHKeZ3OkCD6JpMBS70mATKiHWVVz3iQJE5LXp9kAFwvP2ZUbuy_J6xTMYwr0uGmxJEnHxtIXZ6YwGD-_EISwcEM_53jVNmvHPRNrSTwnPLJqkxk4pJ_HSvlNDDtVO1MUkhKEvf09yWtV8JSNSslYmqD3-Br0hlePVQDkH-A"
              alt="Admin Profile"
            />
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">BrewMaster Admin</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Main Branch</p>
              <p className="font-label-sm text-label-sm text-outline">Shift: Morning</p>
            </div>
          </div>
          <ul className="flex flex-col gap-sm">
            <li>
              <Link href="/" className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
                <span className="material-symbols-outlined">point_of_sale</span>
                <span className="font-label-bold text-label-bold">POS Terminal</span>
              </Link>
            </li>
            <li>
              <Link href="/attendance" className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-full transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
                <span className="font-label-bold text-label-bold">Attendance</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
          <header className="bg-surface sticky top-0 z-30 shadow-sm flex justify-between items-center px-md py-sm">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-headline-md font-bold text-primary">coffee</span>
              <h1 className="text-headline-md font-bold text-primary">BrewMaster Pro</h1>
            </div>
            <div className="hidden md:flex items-center gap-md text-on-surface-variant font-semibold text-sm">
                      <Link href="/dashboard" className="hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded">
                        POS
                      </Link>
                      {/* <Link href="/dashboard" className="hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded">
                        Orders
                      </Link> */}
                      <Link href="/manage-inventory" className="hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded">
                        Inventory
                      </Link>
                      <Link href="/laporan" className="text-primary hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded">
                        Reports
                      </Link>
                      <Link
                                      href="/attendance"
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-emerald-200/50"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">badge</span>
                                      <span>Absen</span>
                                    </Link>
                    </div>
            <div className="flex items-center gap-md">
              <span className="font-label-bold text-label-bold text-on-surface-variant">Kasir</span>
              <img className="w-8 h-8 rounded-full bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfHjY5iwp0cS872iz0x5z3xsUvkZjYxH1lM4GY-vwLBdt_ZeCsPS21fIX1JxH9Z2CFKXiymlDbGxFYSBcFeRSndjmadEWwlxmBkEyh-eDeXflXnqWae-p4Jy1MWoUY87LFPFZ87mbA-k1UEKY_0AKw1n_qeqbxXcifVNwvZWPts8GNGFXNNQxrvjxsUf4Efq09JmaIQ56ddAFhJ6lqfQeVXMXmgMpYT6ZJDC56Rel_PKzeFlDDz2Unxg" alt="Avatar" />
            </div>
          </header>

          <div className="p-lg flex-1 flex flex-col gap-lg max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

              {/* Box QR Code */}
              <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col items-center gap-md text-center">
                <div className="flex items-center gap-sm mb-xs w-full justify-center">
                  <span className="material-symbols-outlined text-secondary">qr_code_2</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">Scan QR untuk Absen</h2>
                </div>

                <div className="text-display-lg font-display-lg text-primary">
                  {currentTime || '08:00 AM'}
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant">
                  <QRCodeSVG value={qrUrl} size={180} />
                </div>
                <p className="text-xs text-on-surface-variant">Arahkan Google Lens HP ke QR Code di atas</p>
                <p className="text-[11px] text-outline break-all bg-surface-container-low px-2 py-1 rounded w-full">
                  Link: {qrUrl}
                </p>
              </div>

              {/* Tabel Riwayat Absensi */}
              <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-sm text-headline-sm text-primary">Daftar Hadir Hari Ini</h2>
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold">
                    Total: {attendances.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant text-on-surface-variant">
                        <th className="py-2 px-3">Nama Staf</th>
                        <th className="py-2 px-3">Waktu Absen</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.length > 0 ? (
                        attendances.map((item) => (
                          <tr key={item.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                            <td className="py-2 px-3 font-bold text-primary">{item.staff_id}</td>
                            <td className="py-2 px-3">{item.time}</td>
                            <td className="py-2 px-3">
                              <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleDeleteClick(item.id, item.staff_id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Hapus Absen"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-outline">
                            Belum ada staf yang absen hari ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* === CUSTOM MODAL KONFIRMASI HAPUS (KEREN & MODERN) === */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100 transform transition-all scale-100">

            {/* Icon Peringatan */}
            <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            {/* Judul & Deskripsi */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Absensi?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Yakin ingin menghapus data kehadiran untuk <span className="font-bold text-gray-700">"{deleteModal.name}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md shadow-red-200 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
