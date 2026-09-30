import { Link, usePage } from '@inertiajs/react';
import PageSidebar from '@/Components/PageSidebar';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const profilePhotoUrl = user?.profile_photo_path
        ? `/storage/${user.profile_photo_path}?v=${encodeURIComponent(user.updated_at || '')}`
        : null;

    return (
        <>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
            `}</style>
            <div className="min-h-screen bg-surface text-on-background font-body-md flex lg:pl-72">
                <PageSidebar />
                <div className="min-w-0 flex-1 flex flex-col">
                    <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-xl border-b border-outline-variant/20 sticky top-0 z-40">
                        <div className="lg:hidden w-10" />
                        <div className="hidden lg:block">
                            <p className="text-xs text-on-surface-variant">Selamat datang kembali</p>
                            <p className="font-bold text-on-surface">{user?.name}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-primary-container/30 text-primary text-xs font-bold uppercase">
                                {user?.role || 'User'}
                            </span>
                            <Link href={route('profile.edit')} className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center overflow-hidden">
                                {profilePhotoUrl ? (
                                    <img src={profilePhotoUrl} alt={`Foto profil ${user?.name || 'user'}`} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </Link>
                        </div>
                    </header>
                    {header && (
                        <div className="bg-surface-container-lowest border-b border-outline-variant/20">
                            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{header}</div>
                        </div>
                    )}
                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </>
    );
}
