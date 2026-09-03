import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <>
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="bg-surface text-on-background font-body-md min-h-screen flex flex-col">
                {/* Top Navigation Bar - Mie Ghacor Style */}
                <header className="flex justify-between items-center px-md h-pos-touch-target w-full fixed top-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
                    <div className="flex items-center gap-md">
                        <div className="flex items-center gap-sm">
                            <Link href="/" className="text-primary hover:bg-primary-container/10 transition-colors p-sm rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">storefront</span>
                            </Link>
                            <h1 className="text-headline-md font-bold text-primary">Mie Ghacor</h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 ml-4">
                            <NavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-primary-container/10"
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                href={route('manage-inventory')}
                                active={route().current('manage-inventory')}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-primary-container/10"
                            >
                                Inventory
                            </NavLink>
                            <NavLink
                                href={route('laporan.index')}
                                active={route().current('laporan.index')}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-primary-container/10"
                            >
                                Reports
                            </NavLink>
                            <NavLink
                                href="/attendance"
                                active={route().current('attendance')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors border border-emerald-200/50"
                            >
                                <span className="material-symbols-outlined text-[18px]">badge</span>
                                <span>Absen</span>
                            </NavLink>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* User Role Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-container/20 rounded-full">
                            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                {user?.role || 'User'}
                            </span>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-primary-container/10 rounded-full transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                                        </div>
                                        <span className="hidden md:inline text-sm font-medium text-on-surface">{user.name}</span>
                                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content className="mt-2 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 min-w-[200px] overflow-hidden">
                                    <div className="px-4 py-3 border-b border-outline-variant/20">
                                        <div className="font-semibold text-on-surface">{user.name}</div>
                                        <div className="text-sm text-on-surface-variant">{user.email}</div>
                                    </div>
                                    <div className="py-1">
                                        <Dropdown.Link 
                                            href={route('profile.edit')}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-primary-container/10 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link 
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            Log Out
                                        </Dropdown.Link>
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="md:hidden p-2 text-on-surface-variant hover:bg-primary-container/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {showingNavigationDropdown ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </header>

                {/* Mobile Navigation Dropdown */}
                {showingNavigationDropdown && (
                    <div className="fixed top-pos-touch-target left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl shadow-lg border-b border-outline-variant/20 md:hidden">
                        <div className="px-4 py-3 space-y-1">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-container/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                Dashboard
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('manage-inventory')}
                                active={route().current('manage-inventory')}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-container/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                Inventory
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('laporan.index')}
                                active={route().current('laporan.index')}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-container/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                                Reports
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href="/attendance"
                                active={route().current('attendance')}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-container/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">badge</span>
                                Absen
                            </ResponsiveNavLink>
                            <div className="border-t border-outline-variant/20 my-2"></div>
                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-container/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                )}

                {/* Page Header */}
                {header && (
                    <header className="bg-surface-container-lowest border-b border-outline-variant/20 mt-pos-touch-target">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className={`flex-1 ${header ? '' : 'mt-pos-touch-target'}`}>
                    {children}
                </main>

                {/* Bottom Navigation - Mobile */}
                <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)] border-t border-outline-variant/20 md:hidden">
                    <div className="flex justify-around items-center h-16 px-xs">
                        <Link 
                            href={route('dashboard')}
                            className={`flex flex-col items-center justify-center min-w-[56px] h-pos-touch-target transition-colors ${route().current('dashboard') ? 'text-primary' : 'text-on-surface-variant'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">dashboard</span>
                            <span className="font-label-sm text-label-sm">Home</span>
                        </Link>
                        <Link 
                            href={route('manage-inventory')}
                            className={`flex flex-col items-center justify-center min-w-[56px] h-pos-touch-target transition-colors ${route().current('manage-inventory') ? 'text-primary' : 'text-on-surface-variant'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
                            <span className="font-label-sm text-label-sm">Stock</span>
                        </Link>
                        <Link 
                            href="/attendance"
                            className={`flex flex-col items-center justify-center min-w-[56px] h-pos-touch-target transition-colors ${route().current('attendance') ? 'text-primary' : 'text-on-surface-variant'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">badge</span>
                            <span className="font-label-sm text-label-sm">Absen</span>
                        </Link>
                        <Link 
                            href={route('laporan.index')}
                            className={`flex flex-col items-center justify-center min-w-[56px] h-pos-touch-target transition-colors ${route().current('laporan.index') ? 'text-primary' : 'text-on-surface-variant'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">bar_chart</span>
                            <span className="font-label-sm text-label-sm">Reports</span>
                        </Link>
                        <Link 
                            href={route('profile.edit')}
                            className={`flex flex-col items-center justify-center min-w-[56px] h-pos-touch-target transition-colors ${route().current('profile.edit') ? 'text-primary' : 'text-on-surface-variant'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">account_circle</span>
                            <span className="font-label-sm text-label-sm">Profile</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}