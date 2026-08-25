import React, { useState } from "react";
import { Link } from "@inertiajs/react";


export default function ReportsAndAudit() {
    // State untuk menangani interaktivitas Stock Opname
    const [stockItems, setStockItems] = useState([
        {
            id: 1,
            name: "Biji Kopi Arabica",
            sku: "CF-ARB-01",
            systemStock: 45,
            actualStock: 43,
            unit: "kg",
            reason: "employee",
            icon: "coffee_maker",
        },
        {
            id: 2,
            name: "Susu Segar (Fresh Milk)",
            sku: "MK-FR-02",
            systemStock: 120,
            actualStock: 115,
            unit: "L",
            reason: "expired",
            icon: "water_drop",
        },
        {
            id: 3,
            name: "Croissant Butter",
            sku: "FD-CR-01",
            systemStock: 30,
            actualStock: 30,
            unit: "pcs",
            reason: "",
            icon: "bakery_dining",
        },
    ]);

    const [activeTab, setActiveTab] = useState("Reports");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleStockChange = (id, value) => {
        const numValue = value === "" ? "" : parseFloat(value);
        setStockItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const updatedActual = numValue === "" ? 0 : numValue;
                    const diff = updatedActual - item.systemStock;
                    return {
                        ...item,
                        actualStock: numValue,
                        reason: diff === 0 ? "" : item.reason,
                    };
                }
                return item;
            }),
        );
    };

    const handleReasonChange = (id, reason) => {
        setStockItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, reason } : item)),
        );
    };

    // Navigasi diperbarui sesuai dengan potongan kode Anda
    const navLinks = [
        { name: "POS", route: "/dashboard", icon: "point_of_sale" },
        { name: "Inventory", route: "/manage-inventory", icon: "inventory_2" },
        { name: "Reports", route: "/laporan", icon: "analytics" },
        { name: "Absen", route: "/attendance", icon: "badge", isBadge: true },
    ];

    return (
        <div className="bg-[#f8f9ff] text-[#121c28] min-h-screen pb-safe font-sans">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 w-full z-50 bg-[#f8f9ff] shadow-sm text-[#173124] flex justify-between items-center px-4 h-14 border-b border-[#d9e3f4]">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#173124]">
                        storefront
                    </span>
                    <span className="text-xl font-bold text-[#173124]">
                        BrewMaster Pro
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
                                                  ? "bg-primary-container text-on-primary-container font-bold"
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
                                        admin@brewmaster.com
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
                <div className="md:hidden fixed inset-x-0 top-14 bg-white border-b border-[#d9e3f4] shadow-lg z-40 p-4 space-y-2">
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
                            Laporan & Audit
                        </h1>
                        <p className="text-base text-[#424844] mt-1">
                            Tinjauan bulanan dan penyesuaian stok inventaris.
                        </p>
                    </div>
                    <div className="flex items-center bg-[#dfe9fa] rounded-full px-4 py-2 shadow-sm">
                        <span className="material-symbols-outlined text-[#424844] mr-2">
                            calendar_month
                        </span>
                        <select className="bg-transparent border-none text-sm font-semibold text-[#121c28] focus:ring-0 cursor-pointer outline-none">
                            <option value="2023-10">Oktober 2023</option>
                            <option value="2023-09">September 2023</option>
                            <option value="2023-08">Agustus 2023</option>
                        </select>
                    </div>
                </div>

                {/* Financial Trend Chart Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#d9e3f4] mb-6">
                    <div className="flex justify-between items-center mb-6 border-b border-[#d9e3f4] pb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-[#121c28]">
                                Tren Keuangan Bulanan
                            </h3>
                            <p className="text-xs text-[#424844] mt-1">
                                Perbandingan Pendapatan vs Pengeluaran
                            </p>
                        </div>
                        <div className="flex gap-4">
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

                    <div className="relative h-64 w-full flex items-end gap-4 px-4 pt-4">
                        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[10px] text-[#424844] text-right pr-2 pb-4">
                            <span>50M</span>
                            <span>40M</span>
                            <span>30M</span>
                            <span>20M</span>
                            <span>10M</span>
                            <span>0</span>
                        </div>
                        <div className="flex-1 h-full flex items-end gap-4 ml-10 border-l border-b border-[#d9e3f4] pb-1">
                            {/* Month Column - Jul */}
                            <div className="flex-1 flex flex-col gap-2 items-center group h-full justify-end relative">
                                <div className="w-full flex justify-center items-end gap-2 h-full">
                                    <div className="bg-[#2d4739] w-1/3 h-[60%] rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2d4739] opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            30M
                                        </span>
                                    </div>
                                    <div className="bg-[#e57373] w-1/3 h-[40%] rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#e57373] opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            20M
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#424844] mt-2">
                                    Jul
                                </span>
                            </div>

                            {/* Month Column - Agu */}
                            <div className="flex-1 flex flex-col gap-2 items-center group h-full justify-end relative">
                                <div className="w-full flex justify-center items-end gap-2 h-full">
                                    <div className="bg-[#2d4739] w-1/3 h-[75%] rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2d4739] opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            37.5M
                                        </span>
                                    </div>
                                    <div className="bg-[#e57373] w-1/3 h-[45%] rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#e57373] opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            22.5M
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#424844] mt-2">
                                    Agu
                                </span>
                            </div>

                            {/* Month Column - Sep */}
                            <div className="flex-1 flex flex-col gap-2 items-center group h-full justify-end relative">
                                <div className="w-full flex justify-center items-end gap-2 h-full">
                                    <div className="bg-[#2d4739] w-1/3 h-[85%] rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2d4739] opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            42.5M
                                        </span>
                                    </div>
                                    <div className="bg-[#e57373] w-1/3 h-[50%] rounded-t opacity-90 group-hover:opacity-100 transition-all duration-200 relative group-hover:-translate-y-1">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#e57373] opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            25M
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#424844] mt-2">
                                    Sep
                                </span>
                            </div>

                            {/* Month Column - Okt */}
                            <div className="flex-1 flex flex-col gap-2 items-center group h-full justify-end relative">
                                <div className="w-full flex justify-center items-end gap-2 h-full">
                                    <div className="bg-[#2d4739] w-1/3 h-[95%] rounded-t opacity-100 transition-all duration-200 relative group-hover:-translate-y-1 shadow">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2d4739] bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            42.5M
                                        </span>
                                    </div>
                                    <div className="bg-[#e57373] w-1/3 h-[42%] rounded-t opacity-100 transition-all duration-200 relative group-hover:-translate-y-1 shadow">
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#e57373] bg-white px-1 py-0.5 rounded shadow border border-[#d9e3f4]">
                                            18.2M
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-[#2d4739] mt-2 bg-[#2d4739]/10 px-2 py-0.5 rounded-full">
                                    Okt
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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
                                Rp 42.5M
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
                            <h2 className="text-3xl font-bold text-[#e57373] mt-1">
                                Rp 18.2M
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
                                1,245
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
                                850
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
                            Penjualan Harian
                        </h3>
                        <p className="text-xs text-[#424844]">
                            Rincian performa harian untuk periode terpilih.
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
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium">
                                        24 Okt 2023
                                    </td>
                                    <td className="p-4 text-center">42 menu</td>
                                    <td className="p-4 text-right font-bold text-[#173124]">
                                        Rp 1.450.000
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[#fe932c] text-sm">
                                                star
                                            </span>
                                            <span className="text-xs font-semibold">
                                                Espresso
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-[#424844]">
                                        15x Espresso, 10x Americano, 17x Latte
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors bg-gray-50/50">
                                    <td className="p-4 font-medium">
                                        23 Okt 2023
                                    </td>
                                    <td className="p-4 text-center">38 menu</td>
                                    <td className="p-4 text-right font-bold text-[#173124]">
                                        Rp 1.280.000
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[#fe932c] text-sm">
                                                star
                                            </span>
                                            <span className="text-xs font-semibold">
                                                Iced Latte
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-[#424844]">
                                        12x Iced Latte, 8x Cappuccino, 18x Flat
                                        White
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium">
                                        22 Okt 2023
                                    </td>
                                    <td className="p-4 text-center">55 menu</td>
                                    <td className="p-4 text-right font-bold text-[#173124]">
                                        Rp 1.920.000
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[#fe932c] text-sm">
                                                star
                                            </span>
                                            <span className="text-xs font-semibold">
                                                Croissant Butter
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-[#424844]">
                                        20x Croissant, 15x Pain au Chocolat, 20x
                                        Muffin
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock Opname Section */}
                <div className="bg-white rounded-xl shadow-sm border border-[#d9e3f4] overflow-hidden mt-4">
                    <div className="p-6 border-b border-[#d9e3f4] bg-[#f8f9ff] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-[#121c28]">
                                Audit Stok (Stock Opname)
                            </h3>
                            <p className="text-xs text-[#424844]">
                                Sesuaikan stok fisik dengan sistem dan catat
                                selisih.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 text-[#173124] hover:bg-[#2d4739]/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                                <span className="material-symbols-outlined text-sm">
                                    add
                                </span>
                                Tambah Item
                            </button>
                            <button className="bg-[#173124] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d4739] active:scale-95 transition-all shadow-sm">
                                Tambahkan Audit
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-[#eef4ff] text-[#424844] text-xs font-semibold">
                                    <th className="p-4 border-b border-[#d9e3f4]">
                                        Nama Item
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4] w-32 text-center">
                                        Stok Sistem
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4] w-40 text-center">
                                        Stok Fisik
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4] w-32 text-center">
                                        Selisih
                                    </th>
                                    <th className="p-4 border-b border-[#d9e3f4]">
                                        Alasan Selisih
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-[#d9e3f4]">
                                {stockItems.map((item) => {
                                    const actual =
                                        item.actualStock === ""
                                            ? 0
                                            : parseFloat(item.actualStock);
                                    const diff = actual - item.systemStock;

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-[#d9e3f4] flex items-center justify-center text-[#424844]">
                                                        <span className="material-symbols-outlined">
                                                            {item.icon}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-[#121c28]">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-[#424844]">
                                                            SKU: {item.sku}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-medium">
                                                {item.systemStock} {item.unit}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="number"
                                                        value={item.actualStock}
                                                        onChange={(e) =>
                                                            handleStockChange(
                                                                item.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-20 p-2 text-center border border-[#c2c8c2] rounded-md focus:ring-2 focus:ring-[#173124] focus:border-[#173124] bg-[#f8f9ff] outline-none transition-shadow"
                                                    />
                                                </div>
                                            </td>
                                            <td
                                                className={`p-4 text-center font-bold ${
                                                    diff < 0
                                                        ? "text-[#ba1a1a]"
                                                        : diff > 0
                                                          ? "text-[#2d4739]"
                                                          : "text-[#173124]"
                                                }`}
                                            >
                                                {diff > 0 ? `+${diff}` : diff}{" "}
                                                {diff !== 0 && item.unit}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={item.reason}
                                                    disabled={diff === 0}
                                                    onChange={(e) =>
                                                        handleReasonChange(
                                                            item.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full p-2 border border-[#c2c8c2] rounded-md focus:ring-2 focus:ring-[#173124] focus:border-[#173124] bg-[#f8f9ff] outline-none text-sm text-[#424844] disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {diff === 0 ? (
                                                        <option value="">
                                                            Tidak ada selisih
                                                        </option>
                                                    ) : (
                                                        <>
                                                            <option value="">
                                                                Pilih Alasan...
                                                            </option>
                                                            <option value="broken">
                                                                Rusak (Broken)
                                                            </option>
                                                            <option value="expired">
                                                                Kedaluwarsa
                                                                (Expired)
                                                            </option>
                                                            <option value="employee">
                                                                Jatah Karyawan
                                                                (Employee Meal)
                                                            </option>
                                                            <option value="missing">
                                                                Hilang (Missing)
                                                            </option>
                                                        </>
                                                    )}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
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
    );
}
