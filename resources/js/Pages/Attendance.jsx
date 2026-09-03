import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

export default function Attendance({ auth, attendances = [], stats }) {
    const todayCount = stats?.todayCount ?? attendances.length;
    const totalStaff = stats?.totalStaff ?? 10;
    const attendancePercentage = stats?.percentage ?? 0;
    const lateCount = stats?.lateCount ?? 0;
    const onTimeCount = stats?.onTimeCount ?? 0;

    const PC_IP_ADDRESS = "192.168.110.185:8000";
    const scanUrl = `http://${PC_IP_ADDRESS}/attendance/scan`;

    // State Modal Konfirmasi Hapus
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Polling data
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['attendances', 'stats'], 
                preserveScroll: true,
                preserveState: true 
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Buka Modal
    const openDeleteModal = (id) => {
        setSelectedDeleteId(id);
    };

    // Tutup Modal
    const closeDeleteModal = () => {
        setSelectedDeleteId(null);
    };

    // Eksekusi Hapus Data
    const confirmDelete = () => {
        if (!selectedDeleteId) return;

        setIsDeleting(true);
        router.delete(`/attendance/${selectedDeleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                closeDeleteModal();
            }
        });
    };

    return (
        <>
            <Head title="Staff Attendance - BrewMaster Pro" />

            <div className="bg-background font-body-md text-on-surface flex flex-col min-h-screen overflow-hidden h-screen">
                {/* Header Navbar */}
                <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
                    <div className="h-16 px-md flex items-center justify-between">
                        <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-primary">coffee_maker</span>
                            <h1 className="font-headline-sm text-headline-sm text-primary">Mie Ghacor</h1>
                        </div>
                        <div className="hidden md:flex gap-md">
                            <nav className="flex gap-sm">
                                <Link className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold font-label-bold" href={route("dashboard")}>
                                    POS
                                </Link>
                                <Link className="px-md py-sm rounded-full text-on-primary-container text-label-bold font-label-bold" href={route("manage-inventory")}>
                                    Inventory
                                </Link>
                                <Link className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200" href={route("laporan.index")}>
                                    Reports
                                </Link>
                                <Link href="/attendance" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-emerald-200/50">
                                    <span className="material-symbols-outlined text-[18px]">badge</span>
                                    <span>Absen</span>
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-sm">
                            <span className="font-label-bold text-label-bold text-on-surface-variant">
                                {auth?.user?.name || 'Admin'}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 pt-20 pb-32 bg-background overflow-y-auto min-h-0">
                    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 gap-6">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-primary-container p-4 rounded-xl shadow-md flex flex-col gap-2 relative overflow-hidden">
                                <span className="font-label-sm text-label-sm text-on-primary-container">Today's Presence</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-display-lg text-display-lg text-on-primary-container">{todayCount}</span>
                                    <span className="font-body-md text-body-md text-on-primary-container">/ {totalStaff}</span>
                                </div>
                                <span className="font-label-sm text-label-sm text-on-primary-container opacity-80">{attendancePercentage}% Attendance</span>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100 flex flex-col gap-1">
                                <span className="font-label-sm text-label-sm text-emerald-700 font-semibold">Tepat Waktu (≤ 10:00)</span>
                                <div className="flex items-baseline gap-2 mt-auto">
                                    <span className="font-headline-sm text-headline-sm text-emerald-600 font-bold">{onTimeCount}</span>
                                    <span className="font-label-sm text-label-sm text-emerald-600">Karyawan</span>
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100 flex flex-col gap-1">
                                <span className="font-label-sm text-label-sm text-red-700 font-semibold">Telat (&gt; 10:00)</span>
                                <div className="flex items-baseline gap-2 mt-auto">
                                    <span className="font-headline-sm text-headline-sm text-red-600 font-bold">{lateCount}</span>
                                    <span className="font-label-sm text-label-sm text-red-600">Karyawan</span>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic QR Code Section */}
                        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface">Scan QR untuk Absen</h3>
                            </div>

                            <div className="w-full max-w-[240px] aspect-square bg-white p-4 rounded-xl border border-outline-variant flex items-center justify-center shadow-inner">
                                <QRCodeSVG value={scanUrl} size={200} level="H" />
                            </div>

                            <p className="font-body-md text-body-md text-on-surface-variant text-center">Arahkan Google Lens HP ke QR Code di atas (Batas Waktu Jam 10:00 WIB)</p>
                        </div>

                        {/* Staff Attendance List */}
                        <div className="flex flex-col gap-3">
                            <h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider mb-2">Daftar Kehadiran Realtime</h3>

                            {attendances.length === 0 ? (
                                <div className="bg-surface-container-lowest p-6 rounded-xl text-center text-on-surface-variant">
                                    Belum ada data absensi masuk hari ini.
                                </div>
                            ) : (
                                attendances.map((item) => (
                                    <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex justify-between items-center relative overflow-hidden transition-all hover:shadow-md">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.status === 'Tepat Waktu' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        
                                        <div className="flex flex-col pl-2">
                                            <span className="font-label-bold text-label-bold text-on-surface">{item.staff_id}</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant">{item.date}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className={`px-2.5 py-1 rounded-md font-label-sm text-[10px] uppercase font-bold tracking-wider ${
                                                    item.status === 'Tepat Waktu' 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status}
                                                </span>
                                                <span className="font-label-bold text-label-bold text-on-surface-variant text-xs mt-1">{item.time} WIB</span>
                                            </div>

                                            {/* Tombol Hapus */}
                                            <button 
                                                onClick={() => openDeleteModal(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                title="Hapus Absen"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </main>
            </div>

            {/* Custom Modal Delete */}
            {selectedDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl flex flex-col items-center text-center gap-4 transform transition-all scale-100">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="font-bold text-lg text-gray-800">Hapus Data Absensi?</h3>
                            <p className="text-sm text-gray-500">Tindakan ini tidak bisa dibatalkan. Data absensi karyawan akan dihapus secara permanen.</p>
                        </div>

                        <div className="flex gap-3 w-full mt-2">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}