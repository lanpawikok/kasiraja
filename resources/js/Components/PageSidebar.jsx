import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const navigation = [
    { label: 'Dashboard', href: '/dashboard', match: 'dashboard', icon: 'dashboard' },
    { label: 'Inventory', href: '/manage-inventory', match: 'manage-inventory', icon: 'inventory_2' },
    { label: 'Reports', href: '/laporan', match: 'laporan*', icon: 'bar_chart' },
    { label: 'Saldo Santri', href: '/santri/balances', match: 'santri.balances', icon: 'account_balance_wallet' },
    { label: 'Absen', href: '/attendance', match: 'attendance*', icon: 'badge' },
];

export default function PageSidebar({ onAddMenu, onQueue, queueCount = 0, showActions = true }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const user = auth?.user;
    const profilePhotoUrl = user?.profile_photo_path
        ? `/storage/${user.profile_photo_path}?v=${encodeURIComponent(user.updated_at || '')}`
        : null;

    const links = () => (
        <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        route().current(item.match)
                            ? 'bg-emerald-300 text-[#10291f]'
                            : 'text-emerald-50/75 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
                    {item.label}
                </Link>
            ))}
        </nav>
    );

    const content = (mobile = false) => (
        <aside className={`${mobile ? 'h-full w-[min(18rem,calc(100vw-1rem))] max-w-full' : 'hidden lg:flex w-72 fixed inset-y-0 left-0 z-50'} shrink-0 flex-col bg-[#10291f] text-white`}>
            <div className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 sm:px-6">
                <span className="material-symbols-outlined text-emerald-300 text-3xl">storefront</span>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-lg">Kanakana</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/60">Kantin Santri</p>
                </div>
                {mobile && (
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-emerald-50 hover:bg-white/10"
                        aria-label="Tutup menu"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {links()}
                {showActions && (
                    <div className="space-y-2 px-4 pb-6">
                        {onAddMenu ? (
                            <button onClick={onAddMenu} className="flex w-full items-center gap-3 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-[#10291f] hover:bg-emerald-300">
                                <span className="material-symbols-outlined">add_circle</span>
                                Tambah Menu
                            </button>
                        ) : (
                            <Link href="/dashboard" className="flex w-full items-center gap-3 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-[#10291f] hover:bg-emerald-300">
                                <span className="material-symbols-outlined">add_circle</span>
                                Tambah Menu
                            </Link>
                        )}
                        {onQueue && (
                            <button onClick={onQueue} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-50/75 hover:bg-white/10 hover:text-white">
                                <span className="material-symbols-outlined">hourglass_top</span>
                                Antrian
                                {queueCount > 0 && (
                                    <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-[#10291f]">
                                        {queueCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                )}
                <div className="border-t border-white/10 p-4">
                    <Link href="/profile" className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/10">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-300 font-bold text-[#10291f]">
                            {profilePhotoUrl ? (
                                <img src={profilePhotoUrl} alt={`Foto profil ${user?.name || 'user'}`} className="h-full w-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user?.name}</p>
                            <p className="text-[11px] uppercase text-emerald-200/60">{user?.role || 'User'}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    );

    return (
        <>
            {content()}
            <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-[55] flex h-10 w-10 items-center justify-center rounded-xl bg-[#173f2d] text-white shadow-lg lg:hidden" aria-label="Buka menu" aria-expanded={open}>
                <span className="material-symbols-outlined">menu</span>
            </button>
            {open && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <button aria-label="Tutup menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
                    <div className="relative h-full w-fit">{content(true)}</div>
                </div>
            )}
        </>
    );
}
