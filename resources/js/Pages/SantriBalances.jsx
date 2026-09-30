import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import PageSidebar from '@/Components/PageSidebar';

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
}).format(Number(value) || 0);

export default function SantriBalances({ santris = [] }) {
    const [search, setSearch] = useState('');
    const [selectedSantri, setSelectedSantri] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');

    useEffect(() => {
        const interval = window.setInterval(() => {
            router.reload({ only: ['santris'], preserveScroll: true, preserveState: true });
        }, 5000);

        return () => window.clearInterval(interval);
    }, []);

    const filteredSantris = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return santris.filter((santri) => santri.name.toLowerCase().includes(keyword));
    }, [santris, search]);

    const totalBalance = santris.reduce((total, santri) => total + Number(santri.balance || 0), 0);
    const debtCount = santris.filter((santri) => Number(santri.balance) < 0).length;

    const openHistory = async (santri) => {
        setSelectedSantri(santri);
        setHistory([]);
        setHistoryError('');
        setHistoryLoading(true);

        try {
            const response = await fetch(`${route('santri.history')}?name=${encodeURIComponent(santri.name)}`, {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Riwayat jajan tidak dapat dimuat.');
            }
            const data = await response.json();
            setHistory(data.entries || []);
        } catch (error) {
            setHistoryError(error.message);
        } finally {
            setHistoryLoading(false);
        }
    };

    const purchaseHistory = history.filter((entry) => entry.type === 'purchase');
    const todayTotal = purchaseHistory.reduce((total, entry) => total + Math.abs(Number(entry.amount || 0)), 0);

    const historyItems = purchaseHistory.flatMap((entry) => (entry.details?.items || []).map((item) => ({
        ...item,
        createdAt: entry.created_at,
    })));

    return (
        <>
            <Head title="Saldo Santri" />
            <div className="min-h-screen bg-surface text-on-background font-body-md lg:pl-72">
                <PageSidebar />
                <main className="min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Keuangan Santri</p>
                                <h1 className="mt-1 text-2xl font-bold text-on-surface sm:text-3xl">Saldo Semua Santri</h1>
                                <p className="mt-2 text-sm text-on-surface-variant">
                                    Pantau saldo deposit dan utang seluruh santri secara realtime.
                                </p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">search</span>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Cari nama santri..."
                                    className="w-full rounded-xl border border-outline-variant bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="mb-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl bg-primary p-5 text-on-primary shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Total Santri</p>
                                <p className="mt-2 text-3xl font-bold">{santris.length}</p>
                                <p className="mt-1 text-xs opacity-75">Akun aktif terdaftar</p>
                            </div>
                            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-outline-variant/30">
                                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total Saldo Bersih</p>
                                <p className={`mt-2 text-2xl font-bold ${totalBalance < 0 ? 'text-red-600' : 'text-primary'}`}>{formatRupiah(totalBalance)}</p>
                                <p className="mt-1 text-xs text-on-surface-variant">Deposit dikurangi utang</p>
                            </div>
                            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-outline-variant/30">
                                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Santri Berutang</p>
                                <p className="mt-2 text-3xl font-bold text-red-600">{debtCount}</p>
                                <p className="mt-1 text-xs text-on-surface-variant">Saldo di bawah Rp 0</p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-outline-variant/30">
                            <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
                                <div>
                                    <h2 className="font-bold text-on-surface">Daftar Saldo Santri</h2>
                                    <p className="mt-1 text-xs text-on-surface-variant">{filteredSantris.length} santri ditemukan</p>
                                </div>
                                <span className="material-symbols-outlined text-primary">sync</span>
                            </div>
                            {filteredSantris.length === 0 ? (
                                <div className="px-5 py-16 text-center text-sm text-on-surface-variant">
                                    Belum ada santri yang sesuai pencarian.
                                </div>
                            ) : (
                                <div className="divide-y divide-outline-variant/15">
                                    {filteredSantris.map((santri, index) => {
                                        const balance = Number(santri.balance || 0);
                                        const isDebt = balance < 0;

                                        return (
                                            <button
                                                type="button"
                                                key={santri.id}
                                                onClick={() => openHistory(santri)}
                                                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-surface-container-low sm:gap-4 sm:px-5"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-primary">
                                                    {santri.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold text-on-surface">{santri.name}</p>
                                                    <p className="text-xs text-on-surface-variant">Santri #{String(index + 1).padStart(3, '0')}</p>
                                                </div>
                                                <div className="max-w-[45%] text-right">
                                                    <p className={`break-words text-sm font-bold sm:text-base ${isDebt ? 'text-red-600' : 'text-primary'}`}>{formatRupiah(balance)}</p>
                                                    <span className={`text-[11px] font-semibold ${isDebt ? 'text-red-500' : 'text-emerald-600'}`}>
                                                        {isDebt ? 'Utang' : 'Saldo aktif'}
                                                    </span>
                                                </div>
                                                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {selectedSantri && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/20 px-4 py-4 sm:px-6 sm:py-5">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-primary">Riwayat Hari Ini</p>
                                <h2 className="mt-1 break-words text-lg font-bold text-on-surface sm:text-xl">{selectedSantri.name}</h2>
                                <p className="mt-1 text-sm text-on-surface-variant">Saldo saat ini: {formatRupiah(selectedSantri.balance)}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedSantri(null)} className="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-low" aria-label="Tutup detail">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                            {historyLoading ? (
                                <div className="py-12 text-center text-sm text-on-surface-variant">Memuat riwayat jajan...</div>
                            ) : historyError ? (
                                <div className="py-12 text-center text-sm text-red-600">{historyError}</div>
                            ) : historyItems.length === 0 ? (
                                <div className="py-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
                                    <p className="mt-2 text-sm text-on-surface-variant">Belum ada jajan hari ini.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 rounded-xl bg-primary-container/40 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total jajan hari ini</p>
                                        <p className="mt-1 text-2xl font-bold text-primary">{formatRupiah(todayTotal)}</p>
                                        <p className="mt-1 text-xs text-on-surface-variant">{purchaseHistory.length} transaksi</p>
                                    </div>
                                    <div className="divide-y divide-outline-variant/15 rounded-xl border border-outline-variant/20">
                                        {historyItems.map((item, index) => (
                                            <div key={`${item.createdAt}-${item.name}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-on-surface">{item.name}</p>
                                                    <p className="text-xs text-on-surface-variant">
                                                        {item.qty} x {formatRupiah(item.price)} · {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 font-semibold text-on-surface">{formatRupiah(Number(item.price) * Number(item.qty))}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
                            <button type="button" onClick={() => setSelectedSantri(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low">Tutup</button>
                            <a
                                href={`${route('santri.history.export')}?name=${encodeURIComponent(selectedSantri.name)}&today=1`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download Laporan Hari Ini
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
