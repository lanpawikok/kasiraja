import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

// Daftar Produk Awal
const INITIAL_PRODUCTS = [
  { id: 1, name: 'Espresso', price: 25000, category: 'Kopi', stock: 45, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9kt8BtdG1LE2CnWjM68q-A-UJRlREd--Bv9At4BC883NOWxy9abLJQAs6oNsh4JtkyUv91tH_NHgDjBnKBvbzgHe9XVxGPLnfiv-mZ9vsAhGgE7KU7rV6hF21HeMLopgFx8G8O5nrpY6BdnODRP8krq3y4_poRKZP3zuPnZV_scCCBcki4RTrkDI3llam6zEDuKhdfdtuUuDVQRJzDseIid5ckyGoXrLbWKhFdVuPnPCSB6jZWi9TgQ' },
  { id: 2, name: 'Croissant Butter', price: 30000, category: 'Pastry', stock: 12, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgnK641iJSDb0S2VXbqptMOZPovtzggtUgMF7AgMV0iqwOPSYH2xdxCxzKY0HmAvvfFjgwV37xVlqgN-RhTNSanXgdSIztLTJvOAsR0dgA926bAElr1GF88PK00esQkSVaydEsDnpJEIXVDrqP_wFJHp4x45oUl1CP6EJ5VPV3wiWSWd9cKiRBxuPvCg7pQUDepU6jzaFCcnmAHA9ypdK7qSy1KKWbCjagi4ah1cJMX5dvi_CqAA-snQ' },
  { id: 3, name: 'Iced Matcha Latte', price: 38000, category: 'Non-Kopi', stock: 20, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWD5nlSGcDX_nJ7oE5n9vxvrGTcfCT2hkEw6lgdDp8Szyb52MW3_4IxQTNPPMdsTeFRPMCt71b5tgA--6ziG0IX708M76uaZ_WVmClLVv6KpTlJZM68O4WC-2nknUxQNC1-ntkZtB6qhqopD3739wuawzQlKC2oMPLPMwHh9_J5fgpuxeMWGsqI_XZIqIu4VC8PyC9aJRxwkI5VT_ElNtcWm3HdBFkNSsaenz_uoEUnvGfyZarcc-LNA' },
  { id: 4, name: 'Americano Hot', price: 28000, category: 'Kopi', stock: 50, icon: 'coffee' },
  { id: 5, name: 'Cheesecake', price: 45000, category: 'Pastry', stock: 8, icon: 'cake' },
  { id: 6, name: 'Nasi Goreng Spesial', price: 50000, category: 'Makanan', stock: 15, icon: 'lunch_dining' },
];

export default function Dashboard() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // State untuk Fitur Catatan & Pelanggan/Meja
  const [orderNote, setOrderNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [tempNote, setTempNote] = useState('');

  // State untuk Modal Manage Inventory & Modal Tambah Menu
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Form State untuk Tambah Menu Baru
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    category: 'Kopi',
    stock: '',
    icon: 'local_cafe'
  });

  // Menambah produk ke keranjang
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert("Stok produk habis!");
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // Mengubah kuantitas item di keranjang
  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Update stok produk dari modal inventory
  const handleStockChange = (id, newStock) => {
    const val = parseInt(newStock) || 0;
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: val } : item))
    );
  };

  // Handler Submit Tambah Menu Baru
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newMenu.name || !newMenu.price || !newMenu.stock) {
      alert("Harap isi semua bidang!");
      return;
    }

    const createdProduct = {
      id: Date.now(),
      name: newMenu.name,
      price: parseFloat(newMenu.price),
      category: newMenu.category,
      stock: parseInt(newMenu.stock),
      icon: newMenu.icon || 'local_cafe'
    };

    setProducts((prev) => [createdProduct, ...prev]);
    setIsAddMenuOpen(false);
    setNewMenu({ name: '', price: '', category: 'Kopi', stock: '', icon: 'local_cafe' });
  };

  // Mengosongkan keranjang
  const clearCart = () => {
    setCart([]);
    setOrderNote('');
    setCustomerName('');
    setTableNumber('');
  };

  // Fungsi Modal Catatan
  const openNoteModal = () => {
    setTempNote(orderNote);
    setIsNoteModalOpen(true);
  };

  const saveNote = () => {
    setOrderNote(tempNote);
    setIsNoteModalOpen(false);
  };

  // Perhitungan Subtotal dan Pajak
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Handler untuk Proses Pembayaran (Kirim data ke /process-checkout sesuai route Laravel)
  const handleCheckout = () => {
    router.post('/process-checkout', {
      cart: cart,
      subtotal: subtotal,
      tax: tax,
      total: total,
      orderNote: orderNote,
      customerName: customerName,
      tableNumber: tableNumber,
    });
  };

  // Filter Produk berdasarkan Kategori
  const filteredProducts = selectedCategory === 'Semua'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="bg-background text-on-background font-body-md h-screen overflow-hidden flex flex-col">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-md h-pos-touch-target w-full fixed top-0 z-50 bg-surface shadow-sm">
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-sm">
              <button className="text-primary hover:bg-primary-container/10 transition-colors p-sm rounded-full flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined">storefront</span>
              </button>
              <h1 className="text-headline-md font-bold text-primary">Mie Gachor</h1>
            </div>

            {/* Tombol Akses Tambah Menu, Inventory, & Absen */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMenuOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Tambah Menu</span>
              </button>

              <Link
                href="/manage-inventory"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                <span>Inventory</span>
              </Link>
              <Link
                href="/laporan"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">assessment</span>
                <span>Laporan Audit</span>
              </Link>

              {/* Tombol Absen Baru */}
              <Link
                href="/attendance"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-emerald-200/50"
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>Absen</span>
              </Link>
            </div>
          </div>

          <button className="text-primary hover:bg-primary-container/10 transition-colors p-sm rounded-full flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </header>

        {/* Main Layout */}
        <main className="flex-1 flex flex-row mt-pos-touch-target overflow-hidden relative">

          {/* Left Pane: Product Grid & Filters */}
          <section className="flex-1 flex flex-col bg-surface overflow-hidden relative z-0 pb-pos-touch-target md:pb-0 transition-all">
            {/* Search & Filters */}
            <div className="p-md bg-surface border-b border-outline-variant/30 flex flex-col gap-sm shrink-0">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-full text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant"
                  placeholder="Cari menu, SKU, atau kategori..."
                  type="text"
                />
              </div>
              <div className="flex gap-sm overflow-x-auto no-scrollbar py-1">
                {['Semua', 'Kopi', 'Non-Kopi', 'Makanan', 'Pastry'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-lg py-2 rounded-full font-label-bold text-label-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/50 hover:bg-surface-variant'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md content-start">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border active:bg-surface-container-low transition-all text-left relative min-h-[160px] cursor-pointer ${
                      cartItem ? 'border-2 border-primary' : 'border-transparent hover:border-outline-variant'
                    }`}
                  >
                    {cartItem && (
                      <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full w-6 h-6 flex items-center justify-center font-label-bold text-label-sm z-10 shadow-sm">
                        {cartItem.qty}
                      </div>
                    )}
                    <div className="h-28 w-full bg-surface-variant overflow-hidden relative flex items-center justify-center">
                      {product.image ? (
                        <img
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={product.image}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-outline text-[48px]">{product.icon || 'restaurant'}</span>
                      )}
                    </div>
                    <div className="p-sm flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-label-bold text-label-bold text-on-surface line-clamp-1">{product.name}</h3>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          Stok: {product.stock}
                        </span>
                      </div>
                      <p className="font-pos-price text-pos-price text-primary mt-1">
                        {(product.price / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right Pane: Order Summary */}
          {cart.length > 0 && (
            <aside
              className={`fixed inset-y-0 right-0 w-[85%] max-w-[400px] bg-surface-container-lowest shadow-[-4px_0_24px_rgba(0,0,0,0.08)] z-40 transform transition-all duration-300 md:relative md:translate-x-0 md:w-[360px] lg:w-[420px] flex flex-col border-l border-outline-variant/30 pt-pos-touch-target md:pt-0 ${
                isDrawerOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
              }`}
            >
              {/* Header Keranjang */}
              <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Pesanan Saat Ini</h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="p-2 text-error hover:bg-error-container/20 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                    title="Hapus Semua"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button
                    className="md:hidden p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors flex items-center justify-center cursor-pointer"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Input Nama Pelanggan & Nomor Meja */}
              <div className="px-md pt-3 pb-2 bg-surface-container-lowest border-b border-outline-variant/20 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nama Pelanggan</label>
                  <input
                    type="text"
                    placeholder="cth: Budi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nomor Meja</label>
                  <input
                    type="text"
                    placeholder="cth: 12"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* List Item Keranjang */}
              <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2 border-b border-outline-variant/20 last:border-0 group">
                    <div className="flex-1 pr-4">
                      <h4 className="font-label-bold text-label-bold text-on-surface">{item.name}</h4>
                      <div className="text-on-surface-variant font-body-md text-sm mt-1">
                        {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-8">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-full flex items-center justify-center bg-surface hover:bg-surface-variant text-on-surface-variant active:bg-surface-dim transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <span className="w-8 text-center font-label-bold text-label-bold text-on-surface">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-full flex items-center justify-center bg-surface hover:bg-surface-variant text-on-surface-variant active:bg-surface-dim transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                      <div className="font-label-bold text-label-bold text-on-surface w-16 text-right">
                        {((item.price * item.qty) / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tampilan Teks Catatan Pesanan */}
                {orderNote && (
                  <div className="mt-2 p-3 bg-surface-container rounded-xl border border-outline-variant/40 flex items-start gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">sticky_note_2</span>
                    <div className="flex-1 overflow-hidden">
                      <span className="font-semibold text-xs uppercase text-primary block">Catatan:</span>
                      <p className="italic break-words text-xs">{orderNote}</p>
                    </div>
                    <button onClick={() => setOrderNote('')} className="text-outline hover:text-error cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer / Total Pembayaran */}
              <div className="bg-surface p-md border-t border-outline-variant/30 flex flex-col gap-4 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.02)] relative z-10">
                <button
                  onClick={openNoteModal}
                  className="w-full py-2 px-4 border border-outline border-dashed rounded-lg text-on-surface-variant hover:bg-surface-variant/50 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 font-label-bold text-label-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  {orderNote ? 'Edit Catatan' : 'Tambah Catatan / Referensi'}
                </button>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-on-surface-variant font-body-md text-sm">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant font-body-md text-sm">
                    <span>Pajak PB1 (10%)</span>
                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center font-headline-sm text-headline-sm text-on-surface pt-2 border-t border-outline-variant/30 mt-1">
                    <span>Total</span>
                    <span className="text-primary font-bold">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Tombol Bayar yang mengirim data ke /process-checkout */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-primary text-on-primary h-[64px] rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md group cursor-pointer relative z-30 pointer-events-auto"
                >
                  <span className="font-pos-price text-pos-price tracking-wide">
                    Bayar {(total / 1000).toFixed(0)}k
                  </span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </aside>
          )}

          {/* Modal Tambah Menu Baru */}
          {isAddMenuOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    Tambah Menu Baru
                  </h3>
                  <button onClick={() => setIsAddMenuOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Menu</label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Caramel Macchiato"
                      value={newMenu.name}
                      onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Harga (Rp)</label>
                      <input
                        type="number"
                        required
                        placeholder="35000"
                        value={newMenu.price}
                        onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Stok Awal</label>
                      <input
                        type="number"
                        required
                        placeholder="20"
                        value={newMenu.stock}
                        onChange={(e) => setNewMenu({ ...newMenu, stock: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                      <select
                        value={newMenu.category}
                        onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Kopi">Kopi</option>
                        <option value="Non-Kopi">Non-Kopi</option>
                        <option value="Makanan">Makanan</option>
                        <option value="Pastry">Pastry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Ikon Tampilan</label>
                      <select
                        value={newMenu.icon}
                        onChange={(e) => setNewMenu({ ...newMenu, icon: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="local_cafe">Kopi / Minuman</option>
                        <option value="cake">Kue / Pastry</option>
                        <option value="restaurant">Makanan</option>
                        <option value="icecream">Es Krim / Dessert</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddMenuOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100 text-sm cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 text-sm shadow-sm cursor-pointer"
                    >
                      Simpan Menu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Input Catatan */}
          {isNoteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Tambah Catatan Pesanan
                  </h3>
                  <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder="Contoh: Kurangi gula, tanpa es..."
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsNoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveNote}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-sm shadow-sm cursor-pointer"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overlay Mobile */}
          {isDrawerOpen && cart.length > 0 && (
            <div
              className="fixed inset-0 bg-on-surface/40 z-30 md:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
            ></div>
          )}
        </main>
      </div>
    </>
  );
}
