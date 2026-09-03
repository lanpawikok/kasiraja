import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";

export default function ManageInventory({ inventories = [] }) {
    const [activeTab, setActiveTab] = useState("Inventory");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Inertia form untuk input bahan baru
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: "",
        category: "",
        description: "",
        qty: "",
        unit: "pcs",
        price: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("inventory.store"), {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        setData({
            name: item.name,
            category: item.category,
            description: item.description || "",
            qty: item.qty,
            unit: item.unit,
            price: item.price,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route("inventory.update", selectedItem.id), {
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
                setSelectedItem(null);
            },
        });
    };

    const filteredInventories = inventories.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        Mie Ghacor
                    </span>
                </div>

                <div className="hidden md:flex gap-md">
                    <nav className="flex items-center gap-sm">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.route}
                                className={
                                    link.isBadge
                                        ? "flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-emerald-200/50"
                                        : `px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                                              activeTab === link.name
                                                  ? "bg-[#2d4739] text-white"
                                                  : "text-[#424844] hover:bg-[#2d4739]/10"
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

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="p-2 rounded-full hover:bg-[#2d4739]/10 transition-colors flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-[#173124]">
                                account_circle
                            </span>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#d9e3f4] py-1 z-50">
                                <div className="px-4 py-2 border-b border-[#d9e3f4]">
                                    <p className="text-sm font-semibold text-[#121c28]">
                                        Admin Kasir
                                    </p>
                                    <p className="text-xs text-[#424844]">
                                        admin@mieghacor.com
                                    </p>
                                </div>
                                <Link
                                    href="/profile"
                                    className="w-full text-left px-4 py-2 text-sm text-[#424844] hover:bg-[#f8f9ff] block"
                                >
                                    Pengaturan
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#f8f9ff]"
                                >
                                    Keluar
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-[#2d4739]/10"
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#121c28]">
                            Manajemen Stok
                        </h1>
                        <p className="text-base text-[#424844] mt-1">
                            Pantau ketersediaan bahan baku dan ubah data stok secara real-time.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            reset();
                            setIsModalOpen(true);
                        }}
                        className="bg-[#173124] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d4739] flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">
                            add_shopping_cart
                        </span>
                        + Input Bahan Baru
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#d9e3f4] flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#424844]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Cari bahan baku..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-[#121c28]"
                    />
                </div>

                {/* Inventory Grid */}
                {filteredInventories.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-[#d9e3f4]">
                        <span className="material-symbols-outlined text-5xl text-[#424844] mb-2">
                            inventory_2
                        </span>
                        <p className="text-sm text-[#424844]">
                            Belum ada data inventaris tersimpan di database.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredInventories.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl p-5 shadow-sm border border-[#d9e3f4] flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs bg-[#dfe9fa] text-[#173124] px-2.5 py-1 rounded-full font-semibold">
                                            {item.category}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded font-bold ${
                                                item.status === "aman"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-rose-100 text-rose-700"
                                            }`}
                                        >
                                            {item.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#121c28]">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-[#424844] mt-1 line-clamp-2">
                                        {item.description || "Tidak ada deskripsi"}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#d9e3f4] flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] text-[#424844] block">
                                            Stok & Total Harga
                                        </span>
                                        <span className="text-base font-bold text-[#173124]">
                                            {item.qty} {item.unit}
                                        </span>
                                        <span className="text-xs text-[#424844] block">
                                            Rp {Number(item.total_price).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleOpenEdit(item)}
                                        className="text-xs bg-[#2d4739]/10 hover:bg-[#2d4739]/20 text-[#173124] px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit Stok
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal Input Bahan Baru */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-[#d9e3f4]">
                        <div className="flex justify-between items-center mb-4 border-b border-[#d9e3f4] pb-3">
                            <h3 className="text-lg font-bold text-[#121c28]">
                                Input Bahan Baku Baru
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#424844] mb-1">
                                    Nama Bahan
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                    className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                    placeholder="Contoh: Tepung Terigu"
                                />
                                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Kategori
                                    </label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData("category", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                        placeholder="Contoh: Biji Kopi / Bahan Pokok"
                                    />
                                    {errors.category && <span className="text-xs text-red-500">{errors.category}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Satuan (Unit)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.unit}
                                        onChange={(e) => setData("unit", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                        placeholder="kg / pcs / liter"
                                    />
                                    {errors.unit && <span className="text-xs text-red-500">{errors.unit}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Jumlah (Qty)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.qty}
                                        onChange={(e) => setData("qty", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                        placeholder="0"
                                    />
                                    {errors.qty && <span className="text-xs text-red-500">{errors.qty}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Harga Satuan (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData("price", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                        placeholder="0"
                                    />
                                    {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#424844] mb-1">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                    rows="2"
                                    placeholder="Keterangan tambahan..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-[#d9e3f4]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[#424844] hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#173124] text-white hover:bg-[#2d4739] disabled:opacity-50 shadow-sm"
                                >
                                    Simpan Bahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Stok */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-[#d9e3f4]">
                        <div className="flex justify-between items-center mb-4 border-b border-[#d9e3f4] pb-3">
                            <h3 className="text-lg font-bold text-[#121c28]">
                                Edit Stok & Bahan Baku
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#424844] mb-1">
                                    Nama Bahan
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                    className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Kategori
                                    </label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData("category", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Satuan (Unit)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.unit}
                                        onChange={(e) => setData("unit", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Jumlah (Qty)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.qty}
                                        onChange={(e) => setData("qty", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#424844] mb-1">
                                        Harga Satuan (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData("price", e.target.value)}
                                        required
                                        className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#424844] mb-1">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-[#d9e3f4] rounded-xl bg-[#f8f9ff] outline-none focus:ring-2 focus:ring-[#173124]"
                                    rows="2"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-[#d9e3f4]">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[#424844] hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#173124] text-white hover:bg-[#2d4739] disabled:opacity-50 shadow-sm"
                                >
                                    Perbarui Stok
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}