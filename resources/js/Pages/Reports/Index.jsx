import React, { useEffect, useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import PageSidebar from "@/Components/PageSidebar";

const MONTH_NAMES_ID = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

export default function ReportsAndAudit({ summary = {}, dailySales = [], monthlyTrend = [], selectedMonth, selectedDate = null, attendanceStats = {} }) {
    const totalExpense = summary.total_expense;
    useEffect(() => {
        const refresh = window.setInterval(() => {
            router.reload({ only: ["summary", "dailySales", "selectedMonth", "selectedDate"], preserveScroll: true, preserveState: true });
        }, 5000);

        return () => window.clearInterval(refresh);
    }, []);

    const [activeTab, setActiveTab] = useState("Reports");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(() => {
        const [y] = (selectedMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`).split("-");
        return parseInt(y, 10);
    });
    const pickerRef = useRef(null);

    useEffect(() => {
        setPickerYear(parseInt((selectedMonth || "").split("-")[0], 10) || new Date().getFullYear());
    }, [selectedMonth]);

    useEffect(() => {
        if (!isMonthPickerOpen) return;
        const onDown = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) setIsMonthPickerOpen(false);
        };
        const onEsc = (e) => { if (e.key === "Escape") setIsMonthPickerOpen(false); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onEsc);
        };
    }, [isMonthPickerOpen]);

    const goToMonth = (value) => {
        setIsMonthPickerOpen(false);
        window.location.href = `${route("laporan.index")}?month=${value}`;
    };
    const goToDate = (value) => {
        setIsMonthPickerOpen(false);
        window.location.href = `${route("laporan.index")}?date=${value}`;
    };
    const WDAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    // Fungsi format rupiah dinamis
    const formatRupiah = (number) => {
        const amount = Number(number) || 0;
        if (amount >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1).replace('.', ',')} juta`;
        }
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const navLinks = [
        { name: "POS", route: "/dashboard", icon: "point_of_sale" },
        { name: "Inventory", route: "/manage-inventory", icon: "inventory_2" },
        { name: "Reports", route: "/laporan", icon: "analytics" },
        { name: "Absen", route: "/attendance", icon: "badge", isBadge: true },
    ];

    return (
            <>
                <Head title="Laporan" />
            <div className="bg-[#f8f9ff] text-[#121c28] min-h-screen pb-safe font-sans lg:pl-72">
                <PageSidebar />
            {/* Top Navigation Bar */}
            <header className="hidden fixed top-0 w-full z-50 bg-[#f8f9ff] shadow-sm text-[#173124] flex justify-between items-center px-4 h-14 border-b border-[#d9e3f4]">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#173124]">
                        storefront
                    </span>
                    <span className="text-xl font-bold text-[#173124]">
                        Kanakana
                    </span>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex gap-md">
                    <nav className="flex items-center gap-sm">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.route}
                                className={
                                    link.isBadge
                                        ? "flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-emerald-200/50"
                                        : `px-md py-sm rounded-full text-label-bold font-label-bold transition-colors duration-200 ${
                                              activeTab === link.name
                                                  ? "bg-primary-container text-on-primary-container"
                                                  : "text-on-surface-variant hover:bg-primary-container/10"
                                          }`
                                }
                            >
                                {link.isBadge && (
                                    <span className="material-symbols-outlined text-[18px]">
                                        badge
                                    </span>
                                )}
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User Action / Profile Button */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="p-2 rounded-full hover:bg-[#2d4739]/10 transition-colors flex items-center justify-center"
                            aria-label="User Account"
                        >
                            <span className="material-symbols-outlined text-[#173124]">
                                account_circle
                            </span>
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#d9e3f4] py-1 z-50">
                                <div className="px-4 py-2 border-b border-[#d9e3f4]">
                                    <p className="text-sm font-semibold text-[#121c28]">
                                        Admin Kasir
                                    </p>
                                    <p className="text-xs text-[#424844]">
                                        admin@kasiraja.com
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-4 py-2 text-sm text-[#424844] hover:bg-[#f8f9ff]"
                                >
                                    Pengaturan
                                </button>
                                <button
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#f8f9ff]"
                                >
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-[#2d4739]/10"
                        aria-label="Toggle Menu"
                    >
                        <span className="material-symbols-outlined text-[#173124]">
                            {isMobileMenuOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="hidden md:hidden fixed inset-x-0 top-14 bg-white border-b border-[#d9e3f4] shadow-lg z-40 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.route}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-3 ${
                                link.isBadge
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                    : activeTab === link.name
                                      ? "bg-[#173124] text-white"
                                      : "text-[#424844] hover:bg-[#f8f9ff]"
                            }`}
                        >
                            <span className="material-symbols-outlined">
                                {link.icon}
                            </span>
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}

            {/* Main Content Area */}
            <main className="pt-20 pb-24 md:pb-6 max-w-7xl mx-auto px-4 md:px-6 grid gap-6">
                {/* Header & Date Picker */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#121c28]">
                            Laporan
                        </h1>
                        <p className="text-base text-[#424844] mt-1">
                            Tinjauan penjualan dan pengeluaran bulanan.
                        </p>
                    </div>
                    <div className="relative" ref={pickerRef}>
                        <button
                            type="button"
                            onClick={() => setIsMonthPickerOpen((v) => !v)}
                            className="flex items-center gap-2 bg-[#dfe9fa] rounded-full px-4 py-2 shadow-sm hover:bg-[#d4dff2] transition-colors cursor-pointer border border-transparent"
                            aria-haspopup="dialog"
                            aria-expanded={isMonthPickerOpen}
                        >
                            <span className="material-symbols-outlined text-[#424844]">calendar_month</span>
                            <span className="text-sm font-semibold text-[#121c28]">
                                {(() => {
                                    const [y, m] = (selectedMonth || "").split("-");
                                    const idx = Math.max(0, Math.min(11, (parseInt(m, 10) || 1) - 1));
                                    return `${MONTH_NAMES_ID[idx]} ${y}`;
                                })()}
                            </span>
                            <span className="material-symbols-outlined text-[#424844] text-[20px]">{isMonthPickerOpen ? "expand_less" : "expand_more"}</span>
                        </button>
                        {isMonthPickerOpen && (
                            <div className="absolute right-0 mt-2 w-[340px] max-w-[min(340px,calc(100vw-2rem))] rounded-2xl bg-white shadow-xl border border-[#d9e3f4] overflow-hidden z-40">
                                {(() => {
                                    const [sy, sm] = (selectedMonth || "").split("-");
                                    const cm = Math.max(1, Math.min(12, parseInt(sm, 10) || 1));
                                    const yr = parseInt(sy, 10) || new Date().getFullYear();
                                    const viewMonth = pickerYear === yr ? cm : 1;
                                    const firstDow = new Date(pickerYear, cm - 1, 1).getDay();
                                    const daysInMonth = new Date(pickerYear, cm, 0).getDate();
                                    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
                                    const cells = [];
                                    for (let b = 0; b < firstDow; b++) cells.push(null);
                                    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                                    const selM = String(cm).padStart(2, "0");
                                    return (
                                        <>
                                            <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9ff] border-b border-[#d9e3f4]">
                                                <button type="button" onClick={() => setPickerYear((y) => y - 1)} className="p-1.5 rounded-full hover:bg-white border border-[#d9e3f4] text-[#424844]" aria-label="Tahun sebelumnya"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                                                <span className="text-sm font-bold text-[#173124]">{MONTH_NAMES_ID[cm - 1]} {pickerYear}</span>
                                                <button type="button" onClick={() => setPickerYear((y) => y + 1)} className="p-1.5 rounded-full hover:bg-white border border-[#d9e3f4] text-[#424844]" aria-label="Tahun berikutnya"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 px-3 pt-3 text-center">
                                                {WDAY_SHORT.map((w) => (<span key={w} className="text-[11px] font-bold text-[#424844] py-1">{w}</span>))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 p-3 pt-1">
                                                {cells.map((d, i) => {
                                                    if (d === null) return <span key={`b-${i}`} />;
                                                    const val = `${pickerYear}-${selM}-${String(d).padStart(2, "0")}`;
                                                    const isSel = val === selectedDate;
                                                    const isToday = val === todayStr;
                                                    return (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => goToDate(val)}
                                                            className={`aspect-square rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center ${isSel ? "bg-[#173124] text-white border-[#173124] shadow-sm" : isToday ? "bg-[#eef4ff] text-[#173124] border-[#b8c9e8]" : "bg-white text-[#121c28] border-transparent hover:bg-[#eef4ff] hover:border-[#b8c9e8]"}`}
                                                        >
                                                            {d}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="px-3 pb-3 grid grid-cols-3 gap-2">
                                                <select value={`${pickerYear}-${selM}`} onChange={(e) => { const [yy, mm] = e.target.value.split("-"); setPickerYear(parseInt(yy, 10)); goToMonth(e.target.value); }} className="col-span-2 rounded-xl border border-[#d9e3f4] bg-white px-3 py-2.5 text-sm font-semibold text-[#121c28] outline-none focus:ring-2 focus:ring-[#173124]" aria-label="Pindah bulan">
                                                    {MONTH_NAMES_ID.map((name, i) => { const v = `${pickerYear}-${String(i + 1).padStart(2, "0")}`; return <option key={v} value={v}>{name} {pickerYear}</option>; })}
                                                </select>
                                                <button type="button" onClick={() => { const d = new Date(); goToDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`); }} className="rounded-xl bg-[#173124] py-2.5 text-sm font-bold text-white hover:bg-[#234735]">Hari ini</button>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                    <a
                        href={`${route("laporan.export.monthly")}?month=${selectedMonth}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#173f2d] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#234735]"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Download Laporan Bulanan
                    </a>
                </div>

                {/* Financial Trend Chart Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#d9e3f4] mb-6">
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-[#d9e3f4] pb-4 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-[#121c28]">
                                Tren Keuangan Bulanan
                            </h3>
                            <p className="text-xs text-[#424844] mt-1">
                                Perbandingan Pendapatan vs Pengeluaran
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 bg-[#2d4739]/10 px-3 py-1 rounded-full">
                                <div className="w-3 h-3 rounded-full bg-[#2d4739]"></div>
                                <span className="text-xs font-semibold text-[#2d4739]">
                                    Pendapatan
                                </span>
                            </div>
                            <div className="flex items-center gap-1 bg-[#e57373]/10 px-3 py-1 rounded-full">
                                <div className="w-3 h-3 rounded-full bg-[#e57373]"></div>
                                <span className="text-xs font-semibold text-[#e57373]">
                                    Pengeluaran
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-64 w-full overflow-x-auto">
                        <div className="relative flex h-64 min-w-[520px] items-end gap-4 px-4 pt-4">
                        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[10px] text-[#424844] text-right pr-2 pb-4">
                            <span>Rp {Math.max(...monthlyTrend.flatMap((item) => [item.income, item.expense]), 0).toLocaleString("id-ID")}</span>
                            <span>Rp {Math.round(Math.max(...monthlyTrend.flatMap((item) => [item.income, item.expense]), 0) * 0.75).toLocaleString("id-ID")}</span>
                            <span>Rp {Math.round(Math.max(...monthlyTrend.flatMap((item) => [item.income, item.expense]), 0) * 0.5).toLocaleString("id-ID")}</span>
                            <span>Rp {Math.round(Math.max(...monthlyTrend.flatMap((item) => [item.income, item.expense]), 0) * 0.25).toLocaleString("id-ID")}</span>
                            <span>0</span>
                        </div>
                        <div className="flex-1 h-full flex items-end gap-4 ml-10 border-l border-b border-[#d9e3f4] pb-1">
                            {monthlyTrend.map((item) => {
                                const maximum = Math.max(...monthlyTrend.flatMap((trend) => [trend.income, trend.expense]), 1);
                                return (
                            <div key={item.label} className="flex-1 flex flex-col gap-2 items-center group h-full justify-end relative">
                                <div className="w-full flex justify-center items-end gap-2 h-full">
                                    <div className="bg-[#2d4739] w-1/3 rounded-t transition-all duration-200 relative group-hover:-translate-y-1 shadow" style={{ height: `${Math.max((item.income / maximum) * 100, item.income ? 2 : 0)}%` }}>
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2d4739] bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4] opacity-0 group-hover:opacity-100">
                                            Rp {item.income.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <div className="bg-[#e57373] w-1/3 rounded-t transition-all duration-200 relative group-hover:-translate-y-1 shadow" style={{ height: `${Math.max((item.expense / maximum) * 100, item.expense ? 2 : 0)}%` }}>
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#e57373] bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4] opacity-0 group-hover:opacity-100">
                                            Rp {item.expense.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#424844] mt-2">{item.label}</span>
                            </div>
                                );
                            })}
                        </div>
                    </div>
                    </div>
                </div>

                {/* Attendance Chart Section */}
                {(() => {
                    const onTime = attendanceStats.onTime || 0;
                    const late = attendanceStats.late || 0;
                    const absent = attendanceStats.absent || 0;
                    const maxAttendance = Math.max(onTime, late, absent, 1);
                    const [sy, sm] = (selectedMonth || "").split("-");
                    const monthLabel = `${MONTH_NAMES_ID[(parseInt(sm, 10) || 1) - 1]} ${sy}`;

                    return (
                        <div className="mb-6 rounded-xl border border-[#d9e3f4] bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-[#d9e3f4] pb-4 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-[#121c28]">
                                        Grafik Kehadiran Karyawan
                                    </h3>
                                    <p className="text-xs text-[#424844] mt-1">
                                        Rekapitulasi Tepat Waktu, Terlambat, dan Absen Bulanan
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                    <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/50">
                                        <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                                        <span className="text-xs font-semibold text-emerald-700">
                                            Tepat Waktu ({onTime})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span className="text-xs font-semibold text-amber-700">
                                            Terlambat ({late})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/50">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <span className="text-xs font-semibold text-rose-700">
                                            Alpha / Izin ({absent})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-64 w-full flex items-end gap-4 px-4 pt-4">
                                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[10px] text-[#424844] text-right pr-2 pb-4">
                                    <span>{maxAttendance}</span>
                                    <span>{Math.round(maxAttendance * 0.75)}</span>
                                    <span>{Math.round(maxAttendance * 0.5)}</span>
                                    <span>{Math.round(maxAttendance * 0.25)}</span>
                                    <span>0</span>
                                </div>
                                <div className="flex-1 h-full flex items-end gap-4 ml-10 border-l border-b border-[#d9e3f4] pb-1">
                                    <div className="flex-1 flex flex-col gap-2 items-center group h-full justify-end relative">
                                        <div className="w-full flex justify-center items-end gap-1.5 h-full">
                                            <div className="bg-emerald-600 w-1/3 rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1" style={{ height: `${Math.max((onTime / maxAttendance) * 100, onTime ? 2 : 1)}%` }}>
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                                    {onTime}
                                                </span>
                                            </div>
                                            <div className="bg-amber-500 w-1/3 rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1" style={{ height: `${Math.max((late / maxAttendance) * 100, late ? 2 : 1)}%` }}>
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                                    {late}
                                                </span>
                                            </div>
                                            <div className="bg-rose-500 w-1/3 rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1" style={{ height: `${Math.max((absent / maxAttendance) * 100, absent ? 2 : 1)}%` }}>
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                                    {absent}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-[#2d4739] mt-2 bg-[#2d4739]/10 px-2 py-0.5 rounded-full">
                                            {monthLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                    <div className="bg-white rounded-xl shadow-sm border border-[#d9e3f4] flex flex-col justify-between relative overflow-hidden p-4 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-5xl text-[#2d4739]">
                                payments
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-[#424844] uppercase tracking-wider font-semibold">
                                Total Pendapatan
                            </span>
                            <h2 className="text-3xl font-bold text-[#2d4739] mt-1">
                                Rp {Number(summary.total_income || 0).toLocaleString("id-ID")}
                            </h2>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-bold text-[#2d4739]">
                            <span className="material-symbols-outlined text-sm mr-1">
                                trending_up
                            </span>
                            +12%
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-[#d9e3f4] flex flex-col justify-between relative overflow-hidden p-4 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-5xl text-[#e57373]">
                                shopping_cart_checkout
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-[#424844] uppercase tracking-wider font-semibold">
                                Total Pengeluaran
                            </span>
                            {/* Nilai sudah dinamis dan otomatis diformat */}
                            <h2 className="text-3xl font-bold text-[#e57373] mt-1">
                                Rp {Number(totalExpense || 0).toLocaleString("id-ID")}
                            </h2>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-bold text-[#e57373]">
                            <span className="material-symbols-outlined text-sm mr-1">
                                trending_down
                            </span>
                            -5%
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-[#d9e3f4] flex flex-col justify-between relative overflow-hidden p-4 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-5xl text-[#2d4739]">
                                local_cafe
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-[#424844] uppercase tracking-wider font-semibold">
                                Total Item Terjual
                            </span>
                            <h2 className="text-3xl font-bold text-[#121c28] mt-1">
                                {(summary.items_sold || 0).toLocaleString("id-ID")}
                            </h2>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-bold text-[#2d4739]">
                            <span className="material-symbols-outlined text-sm mr-1">
                                trending_up
                            </span>
                            +8%
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-[#d9e3f4] flex flex-col justify-between relative overflow-hidden p-4 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-5xl text-[#2d4739]">
                                receipt
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-[#424844] uppercase tracking-wider font-semibold">
                                Total Transaksi
                            </span>
                            <h2 className="text-3xl font-bold text-[#121c28] mt-1">
                                {(summary.transactions || 0).toLocaleString("id-ID")}
                            </h2>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-bold text-[#2d4739]">
                            <span className="material-symbols-outlined text-sm mr-1">
                                trending_up
                            </span>
                            +10%
                        </div>
                    </div>
                </div>

                {/* Daily Sales Table */}
                <div className="bg-white rounded-xl shadow-sm border border-[#d9e3f4] overflow-hidden mt-4">
                    <div className="p-6 border-b border-[#d9e3f4] bg-[#f8f9ff]">
                        <h3 className="text-xl font-semibold text-[#121c28]">
                            {(() => {
                                if (selectedDate) {
                                    const [y, m, d] = selectedDate.split("-");
                                    return `Penjualan Tanggal ${parseInt(d, 10)} ${MONTH_NAMES_ID[parseInt(m, 10) - 1]} ${y}`;
                                }
                                return "Penjualan Hari Ini";
                            })()}
                        </h3>
                        <p className="text-xs text-[#424844] mt-1">
                            {selectedDate
                                ? "Data penjualan pada tanggal yang dipilih."
                                : "Transaksi yang masuk hari ini. Riwayat lengkap tersedia di laporan bulanan."}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-[#eef4ff] text-[#424844] text-xs font-semibold">
                                    <th className="p-4 border-b border-[#d9e3f4]">
                                        Tanggal
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4] text-center">
                                        Item Terjual
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4] text-right">
                                        Pendapatan
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4]">
                                        Menu Terlaris
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4]">
                                        Detail Produk
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-[#d9e3f4]">
                                {dailySales.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-[#424844]">
                                            Belum ada transaksi pembelian hari ini.
                                        </td>
                                    </tr>
                                ) : dailySales.map((day) => (
                                    <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium">{new Date(`${day.date}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                        <td className="p-4 text-center">{day.items_sold} menu</td>
                                        <td className="p-4 text-right font-bold text-[#173124]">Rp {Number(day.revenue).toLocaleString("id-ID")}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[#fe932c] text-sm">star</span>
                                                <span className="text-xs font-semibold">{day.top_item}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-[#424844]">{day.details || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff] shadow-lg flex justify-around items-center px-2 py-2 pb-safe md:hidden border-t border-[#d9e3f4]">
                {navLinks.map((link) => {
                    const isActive = activeTab === link.name;
                    return (
                        <Link
                            key={link.name}
                            href={link.route}
                            className={`flex flex-col items-center justify-center px-3 py-1 transition-all active:scale-95 duration-150 rounded-lg ${
                                isActive
                                    ? "bg-[#2d4739] text-white"
                                    : "text-[#424844] hover:bg-[#dfe9fa]"
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {link.icon}
                            </span>
                            <span className="text-[10px] font-medium mt-0.5">
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
                    </>
                );
            }
