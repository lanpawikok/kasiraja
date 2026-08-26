import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Attendance({ attendanceData, stats }) {
    // Data default/fallback jika prop belum dikirim dari Controller
    const todayCount = stats?.todayCount ?? 8;
    const totalStaff = stats?.totalStaff ?? 10;
    const attendancePercentage = stats?.percentage ?? 80;
    const lateCount = stats?.lateCount ?? 1;
    const absentCount = stats?.absentCount ?? 1;

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
                                       <Link
                                         className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold font-label-bold"
                                         href={route("dashboard")}
                                       >
                                         POS
                                       </Link>
                                       {/* <a
                                         className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold font-label-bold"
                                         href={route("dashboard")}
                                       >
                                         Orders
                                       </a> */}
                                       <Link
                                         className="px-md py-sm rounded-full  text-on-primary-container text-label-bold font-label-bold"
                                         href={route("manage-inventory")}
                                       >
                                         Inventory
                                       </Link>
                                       <Link
                                         className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200"
                                         href={route("laporan.index")}
                                       >
                                         Reports
                                       </Link>
                                       <Link
                                                       href="/attendance"
                                                       className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-emerald-200/50"
                                                     >
                                                       <span className="material-symbols-outlined text-[18px]">badge</span>
                                                       <span>Absen</span>
                                                     </Link>
                                     </nav>
                                   </div>
                        <div className="flex items-center gap-sm">
                            <span className="font-label-bold text-label-bold text-on-surface-variant">Inventory</span>
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 pt-16 pb-32 bg-background overflow-y-auto min-h-0">
                    <div className="flex flex-col w-full px-4 gap-6">

                        {/* Header & Summary Section */}
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-headline-md text-headline-md text-on-surface">Staff Attendance</h2>
                                <button className="bg-surface-container-high text-on-surface p-2 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                </button>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-primary-container p-4 rounded-xl shadow-md flex flex-col gap-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-20">
                                        <span className="material-symbols-outlined text-[48px] text-on-primary-container">groups</span>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-on-primary-container">Today's Presence</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-display-lg text-display-lg text-on-primary-container">{todayCount}</span>
                                        <span className="font-body-md text-body-md text-on-primary-container">/ {totalStaff}</span>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-on-primary-container opacity-80">{attendancePercentage}% Attendance</span>
                                </div>

                                <div className="bg-surface-container p-4 rounded-xl shadow-sm flex flex-col gap-2">
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">Late / Absent</span>
                                    <div className="flex items-baseline gap-2 mt-auto">
                                        <div className="flex flex-col items-center">
                                            <span className="font-headline-sm text-headline-sm text-error">{lateCount}</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant text-[10px]">Late</span>
                                        </div>
                                        <span className="text-outline-variant">|</span>
                                        <div className="flex flex-col items-center">
                                            <span className="font-headline-sm text-headline-sm text-on-surface-variant">{absentCount}</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant text-[10px]">Absent</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Scan Card */}
                            <div className="mt-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Scan QR untuk Absen</h3>
                                </div>
                                <div className="text-display-lg font-display-lg text-primary">2:54 PM</div>
                                <div className="w-full max-w-[280px] aspect-square bg-white p-4 rounded-xl border border-outline-variant flex items-center justify-center">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa33hbZt47MGb6taCxAkAJIG8jqWKKMLbycaJ9VRIC74XSBd_Ek7jtFW1muZk9qwTEmJb2ooFJ4BZXXtyCWA23z2ziDSv4C1oZg4nOS02mw_9oxhFMJfm6HK1MPalVyMognK0K50WuLVMOG1i9g_fDD0_DFHEfjbS_Bi02wCi67DlxkBKNUxYCccwz5a_rnV9Vqub0GApRc9rTicOgKEM-Iwck7AyTZHd05viOCHAOhwGwAOYne3my4h_21IAVETEWUA"
                                        alt="Attendance QR Code"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="font-body-md text-body-md text-on-surface-variant text-center">Arahkan Google Lens HP ke QR Code di atas</p>
                                    <div className="bg-surface-container px-4 py-2 rounded-md">
                                        <code className="text-label-sm text-on-surface-variant">Link: http://localhost:8000/attendance/scan</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date Filter Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-bold text-label-bold shadow-md whitespace-nowrap">Today</button>
                            <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-bold text-label-bold whitespace-nowrap">Yesterday</button>
                            <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-bold text-label-bold whitespace-nowrap">This Week</button>
                        </div>

                        {/* Staff Attendance List */}
                        <div className="flex flex-col gap-3">
                            <h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider mb-2">Shift 1 (08:00 - 16:00)</h3>

                            {/* Staff Card: On Time */}
                            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-3 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-label-bold text-label-bold text-on-surface">Budi Santoso</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant">Lead Barista</span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded-md bg-primary-container text-on-primary-container font-label-sm text-[10px] uppercase font-bold tracking-wider">On Time</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant text-[10px] uppercase">Clock In</span>
                                        <span className="font-label-bold text-label-bold text-on-surface">07:52 AM</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant text-[10px] uppercase">Clock Out</span>
                                        <span className="font-label-bold text-label-bold text-primary">Still Working</span>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Card: Late */}
                            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-3 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-label-bold text-label-bold text-on-surface">Sarah Wijaya</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant">Cashier</span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded-md bg-secondary-container/20 text-on-secondary-fixed font-label-sm text-[10px] uppercase font-bold tracking-wider">Late 15m</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant text-[10px] uppercase">Clock In</span>
                                        <span className="font-label-bold text-label-bold text-error">08:15 AM</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant text-[10px] uppercase">Clock Out</span>
                                        <span className="font-label-bold text-label-bold text-primary">Still Working</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider mt-4 mb-2">Shift 2 (15:00 - 23:00)</h3>

                            {/* Staff Card: Absent */}
                            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-3 relative overflow-hidden opacity-70">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="font-label-bold text-label-bold text-on-surface">Rina Pratama</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant">Server</span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded-md bg-error-container text-on-error-container font-label-sm text-[10px] uppercase font-bold tracking-wider">Absent</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-label-sm text-label-sm text-on-surface-variant text-[10px] uppercase">Reason</span>
                                        <span className="font-label-bold text-label-bold text-on-surface">Sick Leave</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Export Button */}
                        <a
                            href={route('laporan.export.excel')}
                            className="mt-6 w-full py-4 rounded-xl bg-surface-container-highest text-on-surface font-label-bold text-label-bold flex items-center justify-center gap-2 shadow-sm transition-colors active:bg-surface-dim"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Export Attendance Log (.xlsx)
                        </a>
                    </div>
                </main>

                {/* Bottom Navigation */}
                {/* <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/80 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
                    <div className="flex justify-around items-center h-20 px-sm">
                        <Link
                            href={route('dashboard')}
                            className="flex flex-col items-center justify-center gap-xs w-20 h-16 text-on-surface-variant transition-colors"
                        >
                            <span className="material-symbols-outlined">point_of_sale</span>
                            <span className="font-label-sm text-label-sm">POS</span>
                        </Link>
                        <Link
                            href={route('attendance.index')}
                            className="flex flex-col items-center justify-center gap-xs w-20 h-16 text-primary font-semibold transition-colors"
                        >
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="font-label-sm text-label-sm">Attendance</span>
                        </Link>
                        <Link
                            href={route('manage-inventory')}
                            className="flex flex-col items-center justify-center gap-xs w-20 h-16 text-on-surface-variant transition-colors"
                        >
                            <span className="material-symbols-outlined">inventory_2</span>
                            <span className="font-label-sm text-label-sm">Stock</span>
                        </Link>
                        <Link
                            href={route('laporan.index')}
                            className="flex flex-col items-center justify-center gap-xs w-20 h-16 text-on-surface-variant transition-colors"
                        >
                            <span className="material-symbols-outlined">analytics</span>
                            <span className="font-label-sm text-label-sm">Reports</span>
                        </Link>
                    </div>
                </nav> */}
            </div>
        </>
    );
}
