import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Profile() {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [photoPreview, setPhotoPreview] = useState(null);
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        profile_photo: null,
    });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showEndShiftConfirm, setShowEndShiftConfirm] = useState(false);
    const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);

    const profilePhotoUrl = user.profile_photo_path
        ? `/storage/${user.profile_photo_path}`
        : null;

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setData('profile_photo', file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const submitPhoto = (event) => {
        event.preventDefault();
        post(route('profile.photo.update'), {
            forceFormData: true,
            onSuccess: () => setPhotoPreview(null),
        });
    };

    const handleEndShift = () => {
        setShowEndShiftConfirm(true);
    };

    const confirmEndShift = () => {
        setShowEndShiftConfirm(false);
        alert('Membuka laci kasir (Cash Drawer)... Silakan masukkan penghitungan fisik uang tunai.');
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        router.post(route('logout'));
    };

    const confirmDeletePhoto = () => {
        setShowDeletePhotoConfirm(false);
        router.delete(route('profile.photo.delete'));
    };

    return (
        <>
            <Head title="Profile" />
            
            <AuthenticatedLayout
            >
                <div className="flex flex-col w-full px-md gap-md py-4 bg-surface min-h-screen">
                    {/* Profile Header Card */}
                    <div className="w-full bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-md">
                        <div className="flex items-center gap-md">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-surface-container">
                                {photoPreview || profilePhotoUrl ? (
                                    <img
                                        className="w-full h-full object-cover"
                                        alt={`Foto profil ${user.name}`}
                                        src={photoPreview || profilePhotoUrl}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <span className="w-2 h-2 rounded-full bg-primary-fixed"></span>
                                </div>
                            </div>
                            <form onSubmit={submitPhoto} className="flex flex-col gap-2">
                                    <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium cursor-pointer hover:opacity-90">
                                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                        Ganti Foto
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {data.profile_photo && (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="text-xs text-primary underline disabled:opacity-50"
                                        >
                                            {processing ? 'Mengunggah...' : 'Simpan Foto'}
                                        </button>
                                    )}
                                    {!photoPreview && profilePhotoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setShowDeletePhotoConfirm(true)}
                                            disabled={processing}
                                            className="text-xs text-red-600 underline disabled:opacity-50"
                                        >
                                            Hapus Foto
                                        </button>
                                    )}
                                    {errors.profile_photo && (
                                        <p className="text-xs text-red-600">{errors.profile_photo}</p>
                                    )}
                                    {(flash?.status === 'profile-photo-updated' || recentlySuccessful) && (
                                        <p className="text-xs text-green-600">Foto berhasil diperbarui.</p>
                                    )}
                                    {flash?.status === 'profile-photo-deleted' && (
                                        <p className="text-xs text-green-600">Foto profil berhasil dihapus.</p>
                                    )}
                            </form>
                            <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-xs">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                                        {user.name}
                                    </h2>
                                    <span 
                                        className="material-symbols-outlined text-primary text-[18px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        verified
                                    </span>
                                </div>
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    Kasir Utama • ID #CSH-024
                                </span>
                                <div className="mt-xs inline-flex items-center gap-xs px-sm py-0.5 rounded-full bg-primary-fixed w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                    <span className="font-label-sm text-label-sm text-on-primary-fixed">
                                        Sedang Bertugas
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Shift Banner */}
                        <div className="w-full bg-surface-container-low rounded-lg p-sm flex items-center justify-between">
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-primary text-[20px]">
                                    schedule
                                </span>
                                <span className="font-label-bold text-label-bold text-on-surface">
                                    Shift Pagi
                                </span>
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                                08:00 – 16:00 WIB
                            </span>
                        </div>
                    </div>

                    {/* Today's Shift Metrics */}
                    <div className="flex flex-col gap-xs">
                        <div className="flex items-center justify-between px-xs">
                            <span className="font-label-bold text-label-bold text-on-surface">
                                Statistik Shift Hari Ini
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                                Realtime POS
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
                            {/* Penjualan */}
                            <div className="col-span-2 bg-primary-container text-on-primary rounded-xl p-md shadow-sm flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-label-sm text-label-sm text-on-primary-container">
                                        Total Nilai Penjualan
                                    </span>
                                    <span className="font-display-lg text-display-lg font-bold tracking-tight">
                                        Rp 1.450.000
                                    </span>
                                    <span className="font-label-sm text-label-sm text-primary-fixed mt-xs flex items-center gap-xs">
                                        <span className="material-symbols-outlined text-[16px]">
                                            trending_up
                                        </span>
                                        +14% vs rata-rata shift
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary-fixed text-[26px]">
                                        payments
                                    </span>
                                </div>
                            </div>

                            {/* Transaksi Selesai */}
                            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col justify-between min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center mb-sm">
                                    <span className="material-symbols-outlined text-primary text-[20px]">
                                        receipt_long
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display-lg text-headline-md font-bold text-on-surface">
                                        42
                                    </span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                                        Transaksi Diproses
                                    </span>
                                </div>
                            </div>

                            {/* Clock In */}
                            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col justify-between min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center mb-sm">
                                    <span className="material-symbols-outlined text-secondary text-[20px]">
                                        timer
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-headline-sm text-headline-sm text-on-surface">
                                        07:58 <span className="text-label-sm font-normal">WIB</span>
                                    </span>
                                    <span className="font-label-sm text-label-sm text-primary-container flex items-center gap-xs">
                                        <span className="material-symbols-outlined text-[14px]">
                                            check_circle
                                        </span>
                                        Tepat Waktu
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Bento */}
                    <div className="flex flex-col gap-xs">
                        <span className="font-label-bold text-label-bold text-on-surface px-xs">
                            Aksi Cepat Operasional
                        </span>
                        <div className="grid grid-cols-1 gap-sm">
                            {/* Tutup Kasir Primary CTA */}
                            <button 
                                onClick={handleEndShift}
                                className="w-full h-pos-touch-target bg-primary text-on-primary rounded-xl px-md flex items-center justify-between shadow-sm active:opacity-95 transition-opacity"
                            >
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-[22px] text-primary-fixed">
                                        point_of_sale
                                    </span>
                                    <span className="font-label-bold text-label-bold">
                                        Tutup Kasir / Setor Tunai
                                    </span>
                                </div>
                                <div className="flex items-center gap-xs">
                                    <span className="font-label-sm text-label-sm text-on-primary-container">
                                        Hitung laci
                                    </span>
                                    <span className="material-symbols-outlined text-[18px]">
                                        chevron_right
                                    </span>
                                </div>
                            </button>

                            <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
                                {/* Riwayat Transaksi */}
                                <button className="w-full bg-surface-container-lowest rounded-xl p-md flex flex-col gap-xs items-start shadow-sm active:bg-surface-container-low transition-colors text-left">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[20px]">
                                            history
                                        </span>
                                    </div>
                                    <span className="font-label-bold text-label-bold text-on-surface">
                                        Riwayat Struk
                                    </span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                                        42 pesanan hari ini
                                    </span>
                                </button>

                                {/* Ekspor Absensi */}
                                <button className="w-full bg-surface-container-lowest rounded-xl p-md flex flex-col gap-xs items-start shadow-sm active:bg-surface-container-low transition-colors text-left">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                                        <span className="material-symbols-outlined text-[20px]">
                                            table_chart
                                        </span>
                                    </div>
                                    <span className="font-label-bold text-label-bold text-on-surface">
                                        Ekspor Absensi
                                    </span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                                        File Excel (.xlsx)
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cashier Permissions Section */}
                    <div className="w-full bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-primary text-[20px]">
                                    lock_open
                                </span>
                                <span className="font-label-bold text-label-bold text-on-surface">
                                    Hak Akses Kasir Aktif
                                </span>
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                                Tier Standard
                            </span>
                        </div>

                        {/* Active Permissions */}
                        <div className="flex flex-col gap-sm">
                            {[
                                'Input Pesanan & Checkout POS',
                                'Cetak Salinan Struk (Hingga 4x)',
                                'Scan Absensi & Ekspor Riwayat',
                                'Pembayaran QRIS Statis & Tunai'
                            ].map((permission, index) => (
                                <div key={index} className="flex items-center justify-between py-xs">
                                    <div className="flex items-center gap-sm">
                                        <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center">
                                            <span className="material-symbols-outlined text-on-primary-fixed text-[16px]">
                                                check
                                            </span>
                                        </div>
                                        <span className="font-body-md text-body-md text-on-surface">
                                            {permission}
                                        </span>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-primary px-sm py-0.5 rounded-full bg-surface-container-low">
                                        Aktif
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Restriced Notice Box */}
                        <div className="w-full bg-surface-container-low rounded-lg p-sm flex flex-col gap-xs">
                            <div className="flex items-center gap-xs text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px]">
                                    security
                                </span>
                                <span className="font-label-bold text-label-bold">
                                    Batasan Otorisasi Kasir
                                </span>
                            </div>
                            <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
                                Tidak memiliki akses ubah harga jual manual, penghapusan data stok inventaris gudang, 
                                maupun melihat pembukuan laba bersih kafe. Wewenang berada di Supervisor.
                            </p>
                        </div>
                    </div>

                    {/* Account & Device Settings */}
                    <div className="w-full bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-md">
                        <span className="font-label-bold text-label-bold text-on-surface">
                            Keamanan & Perangkat
                        </span>
                        <div className="flex flex-col gap-xs">
                            {/* Ubah PIN Kasir */}
                            <button className="w-full h-pos-touch-target flex items-center justify-between px-xs active:bg-surface-container-low rounded-lg transition-colors">
                                <div className="flex items-center gap-sm">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                                        <span className="material-symbols-outlined text-[20px]">
                                            pin
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="font-label-bold text-label-bold text-on-surface">
                                            PIN Cepat Kasir
                                        </span>
                                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                                            4 digit • Terakhir diganti 12 hari lalu
                                        </span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                                    chevron_right
                                </span>
                            </button>

                            {/* Ganti Sandi Akun */}
                            <button className="w-full h-pos-touch-target flex items-center justify-between px-xs active:bg-surface-container-low rounded-lg transition-colors">
                                <div className="flex items-center gap-sm">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                                        <span className="material-symbols-outlined text-[20px]">
                                            key
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="font-label-bold text-label-bold text-on-surface">
                                            Kata Sandi Akun
                                        </span>
                                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                                            Sandi masuk aplikasi KASIR
                                        </span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                                    chevron_right
                                </span>
                            </button>

                            {/* Printer Bluetooth Setting */}
                            <div className="w-full flex items-center justify-between p-sm bg-surface-container-low rounded-xl">
                                <div className="flex items-center gap-sm">
                                    <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-primary-fixed">
                                        <span className="material-symbols-outlined text-[20px]">
                                            print
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="font-label-bold text-label-bold text-on-surface">
                                            Thermal POS-58B
                                        </span>
                                        <div className="flex items-center gap-xs">
                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                                                Bluetooth Terhubung • 58mm
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="h-8 px-sm bg-surface-container-lowest text-primary rounded-lg font-label-sm text-label-sm font-semibold active:bg-surface-container-high transition-colors">
                                    Tes Cetak
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Logout Action */}
                    <div className="w-full pt-xs pb-md flex flex-col items-center gap-sm">
                        <button 
                            onClick={handleLogout}
                            className="w-full h-pos-touch-target rounded-xl bg-error-container text-on-error-container font-label-bold text-label-bold flex items-center justify-center gap-xs active:opacity-90 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                logout
                            </span>
                            Keluar dari Sesi Kasir
                        </button>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                        </span>
                    </div>
                </div>

                {/* Modal Konfirmasi End Shift */}
                {showEndShiftConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shrink-0">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Konfirmasi Tutup Kasir
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Konfirmasi Tutup Kasir dan cetak laporan setor tunai shift pagi?
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setShowEndShiftConfirm(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmEndShift}
                                    className="bg-primary text-on-primary px-6 py-2 rounded-xl font-medium shadow-sm shadow-primary/20 transition-all"
                                >
                                    Konfirmasi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Konfirmasi Logout */}
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-error-container rounded-xl flex items-center justify-center shrink-0">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Konfirmasi Logout
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Yakin ingin logout dari akun kasir Sarah Wijaya? Pastikan semua transaksi shift telah tersimpan.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium shadow-sm shadow-red-200 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeletePhotoConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="mb-6 flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-error-container">
                                    <span className="material-symbols-outlined text-error">delete</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Hapus Foto Profil?</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Foto profil akan dihapus dan avatar akan kembali menggunakan inisial nama.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDeletePhotoConfirm(false)}
                                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeletePhoto}
                                    className="rounded-xl bg-red-600 px-6 py-2 font-medium text-white shadow-sm shadow-red-200 transition-all"
                                >
                                    Hapus Foto
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}