import React, { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import PageSidebar from '@/Components/PageSidebar';

// Daftar Produk Awal
const INITIAL_PRODUCTS = [
  { id: 1, name: 'Espresso', price: 25000, category: 'Kopi', stock: 45, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9kt8BtdG1LE2CnWjM68q-A-UJRlREd--Bv9At4BC883NOWxy9abLJQAs6oNsh4JtkyUv91tH_NHgDjBnKBvbzgHe9XVxGPLnfiv-mZ9vsAhGgE7KU7rV6hF21HeMLopgFx8G8O5nrpY6BdnODRP8krq3y4_poRKZP3zuPnZV_scCCBcki4RTrkDI3llam6zEDuKhdfdtuUuDVQRJzDseIid5ckyGoXrLbWKhFdVuPnPCSB6jZWi9TgQ' },
  { id: 2, name: 'Croissant Butter', price: 30000, category: 'Pastry', stock: 12, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgnK641iJSDb0S2VXbqptMOZPovtzggtUgMF7AgMV0iqwOPSYH2xdxCxzKY0HmAvvfFjgwV37xVlqgN-RhTNSanXgdSIztLTJvOAsR0dgA926bAElr1GF88PK00esQkSVaydEsDnpJEIXVDrqP_wFJHp4x45oUl1CP6EJ5VPV3wiWSWd9cKiRBxuPvCg7pQUDepU6jzaFCcnmAHA9ypdK7qSy1KKWbCjagi4ah1cJMX5dvi_CqAA-snQ' },
  { id: 3, name: 'Iced Matcha Latte', price: 38000, category: 'Non-Kopi', stock: 20, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWD5nlSGcDX_nJ7oE5n9vxvrGTcfCT2hkEw6lgdDp8Szyb52MW3_4IxQTNPPMdsTeFRPMCt71b5tgA--6ziG0IX708M76uaZ_WVmClLVv6KpTlJZM68O4WC-2nknUxQNC1-ntkZtB6qhqopD3739wuawzQlKC2oMPLPMwHh9_J5fgpuxeMWGsqI_XZIqIu4VC8PyC9aJRxwkI5VT_ElNtcWm3HdBFkNSsaenz_uoEUnvGfyZarcc-LNA' },
  { id: 4, name: 'Americano Hot', price: 28000, category: 'Kopi', stock: 50, icon: 'coffee' },
  { id: 5, name: 'Cheesecake', price: 45000, category: 'Pastry', stock: 8, icon: 'cake' },
  { id: 6, name: 'Nasi Goreng Spesial', price: 50000, category: 'Makanan', stock: 15, icon: 'lunch_dining' },
];

export default function Dashboard({ catalogProducts = [] }) {
  const { auth } = usePage().props;

  // Ambil role user
  const userRole = auth.user?.role?.toLowerCase() || '';

  // Cek admin (hanya role khusus manajemen/admin)
  const isAdmin = ['admin', 'administrator', 'owner', 'superadmin', 'manager'].includes(userRole);

  console.log('User Role:', userRole);
  console.log('Is Admin:', isAdmin);

  const [products, setProducts] = useState(catalogProducts.length > 0 ? catalogProducts : INITIAL_PRODUCTS);
  useEffect(() => {
    if (catalogProducts.length > 0) setProducts(catalogProducts);
  }, [catalogProducts]);
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // State untuk Fitur Catatan & Pelanggan/Meja
  const [orderNote, setOrderNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositProcessing, setDepositProcessing] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [santriBalance, setSantriBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState('');
  const [santriHistory, setSantriHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [tempNote, setTempNote] = useState('');

  // State untuk Modal Manage Inventory & Modal Tambah Menu
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({});
  const [editProductImage, setEditProductImage] = useState(null);
  const [editProductProcessing, setEditProductProcessing] = useState(false);

  // Form State untuk Tambah Menu Baru
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    category: 'Kopi',
    stock: '',
    icon: 'local_cafe'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4200);
  };

  // Menambah produk ke keranjang
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast('Stok produk habis.', 'error');
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

  const openProductEditor = (product) => {
    setEditingProduct(product);
    setEditProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      icon: product.icon || 'restaurant',
    });
    setEditProductImage(null);
  };

  const handleProductUpdate = (event) => {
    event.preventDefault();
    if (!editingProduct || !catalogProducts.length) {
      showToast('Produk demo belum tersimpan di katalog database.', 'error');
      return;
    }

    const formData = new FormData();
    Object.entries(editProductForm).forEach(([key, value]) => formData.append(key, value));
    if (editProductImage) formData.append('image', editProductImage);
    formData.append('_method', 'PUT');
    setEditProductProcessing(true);

    router.post(route('products.update', editingProduct.id), formData, {
      forceFormData: true,
      onSuccess: () => {
        setEditingProduct(null);
        showToast('Produk dan foto berhasil diperbarui.');
      },
      onError: () => showToast('Produk gagal diperbarui. Periksa data dan ukuran foto.', 'error'),
      onFinish: () => setEditProductProcessing(false),
    });
  };

  const [newMenuProcessing, setNewMenuProcessing] = useState(false);
  const [newMenuImage, setNewMenuImage] = useState(null);

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newMenu.name || !newMenu.price || !newMenu.stock) {
      showToast('Harap isi semua bidang menu.', 'error');
      return;
    }
    setNewMenuProcessing(true);
    const payload = {
      name: newMenu.name,
      price: newMenu.price,
      category: newMenu.category,
      stock: newMenu.stock,
      icon: newMenu.icon || 'local_cafe',
    };
    const hasImage = !!newMenuImage;
    const url = route('products.store');
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        setIsAddMenuOpen(false);
        setNewMenu({ name: '', price: '', category: 'Kopi', stock: '', icon: 'local_cafe' });
        setNewMenuImage(null);
        showToast('Menu berhasil ditambahkan dan tersimpan di database.');
        router.reload({ only: ['catalogProducts'] });
      },
      onError: (errors) => {
        const msg = errors?.name || errors?.price || errors?.stock || errors?.message || 'Gagal menambah menu. Pastikan login sebagai admin.';
        showToast(String(msg), 'error');
      },
      onFinish: () => setNewMenuProcessing(false),
    };
    if (hasImage) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
      fd.append('image', newMenuImage);
      router.post(url, fd, { ...options, forceFormData: true });
    } else {
      router.post(url, payload, options);
    }
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

  const handleDeposit = () => {
    if (!customerName.trim() || !depositAmount || Number(depositAmount) <= 0) {
      showToast('Isi nama santri dan nominal deposit yang valid.', 'error');
      return;
    }

    setDepositProcessing(true);
    router.post(route('santri.deposit'), {
      name: customerName,
      amount: Number(depositAmount),
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setDepositAmount('');
        setIsDepositModalOpen(false);
        showToast('Deposit berhasil ditambahkan. Saldo otomatis mengurangi utang jika ada.');
      },
      onFinish: () => setDepositProcessing(false),
    });
  };

  const handleCheckBalance = async () => {
    if (!customerName.trim()) {
      setBalanceError('Masukkan nama santri terlebih dahulu.');
      setSantriBalance(null);
      return;
    }

    setBalanceLoading(true);
    setBalanceError('');

    try {
      const response = await fetch(`${route('santri.balance')}?name=${encodeURIComponent(customerName)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Saldo santri tidak ditemukan.');
      }

      const result = await response.json();
      setSantriBalance(Number(result.balance));
    } catch (error) {
      setSantriBalance(null);
      setBalanceError(error.message);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleLoadHistory = async () => {
    if (!customerName.trim()) {
      setBalanceError('Masukkan nama santri terlebih dahulu.');
      return;
    }

    setHistoryLoading(true);
    setBalanceError('');

    try {
      const response = await fetch(`${route('santri.history')}?name=${encodeURIComponent(customerName)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Riwayat santri tidak ditemukan.');
      }

      const result = await response.json();
      setSantriBalance(Number(result.balance));
      setSantriHistory(result.entries || []);
    } catch (error) {
      setSantriHistory([]);
      setBalanceError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Perhitungan Subtotal dan Pajak
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Handler untuk Proses Pembayaran
  const handleCheckout = () => {
    router.post(route('checkout.process'), {
      cart: cart,
      subtotal: subtotal,
      tax: tax,
      total: total,
      orderNote: orderNote,
      customerName: customerName,
      tableNumber: tableNumber,
      paymentMethod: paymentMethod,
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

      <div className="bg-background text-on-background font-body-md h-[100dvh] min-h-[100dvh] overflow-hidden flex flex-col">
        <PageSidebar
          onAddMenu={() => setIsAddMenuOpen(true)}
          onDeposit={() => setIsDepositModalOpen(true)}
          showActions
        />
        {/* TopAppBar */}
        <header className="fixed top-0 z-50 flex h-pos-touch-target w-full items-center justify-between border-b border-outline-variant/20 bg-surface pl-16 pr-3 shadow-sm sm:pl-16 sm:pr-6 lg:hidden">
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-sm">
              <button className="text-primary hover:bg-primary-container/10 transition-colors p-sm rounded-full flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined">storefront</span>
              </button>
              <h1 className="text-headline-md font-bold text-primary">Kanakana</h1>
            </div>

            {/* Admin Menu - hanya muncul jika isAdmin true */}
            {isAdmin && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsAddMenuOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Tambah Menu</span>
                </button>
                <Link
                  className="px-md py-sm rounded-full text-on-primary-container text-label-bold font-label-bold hover:bg-primary-container/10 transition-colors"
                  href={route('manage-inventory')}
                >
                  Inventory
                </Link>
                <Link
                  className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold"
                  href={route('laporan.index')}
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
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
              backgroundColor: isAdmin ? '#DCFCE7' : '#F3F4F6',
              color: isAdmin ? '#166534' : '#6B7280'
            }}>
              <span className="material-symbols-outlined text-[16px]">
                {isAdmin ? 'verified' : 'person'}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide">
                {isAdmin ? 'Admin' : 'Kasir'}
              </span>
            </div>

            {/* Profile Button */}
            <Link
              href="/profile"
              className="text-primary hover:bg-primary-container/10 transition-colors p-sm rounded-full flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              Deposit Santri
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <main className="relative mt-pos-touch-target flex min-h-0 flex-1 flex-row overflow-hidden lg:ml-72 lg:mt-0">

          {/* Left Pane: Product Grid & Filters */}
          <section className="flex-1 flex flex-col bg-surface overflow-hidden relative z-0 pb-pos-touch-target md:pb-0 transition-all">
            {/* Search & Filters */}
            <div className="shrink-0 border-b border-outline-variant/30 bg-surface p-3 sm:p-md">
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
              <div className="mt-2 flex gap-sm overflow-x-auto py-1 no-scrollbar">
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
            <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-3 pb-20 sm:grid-cols-3 sm:gap-md sm:p-md sm:pb-6 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        addToCart(product);
                      }
                    }}
                    role="button"
                    tabIndex={0}
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
                      {isAdmin && catalogProducts.length > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProductEditor(product);
                          }}
                          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-primary shadow-md hover:bg-white"
                          title="Edit produk"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
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
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Pane: Order Summary */}
          {cart.length > 0 && (
            <aside
              className={`fixed inset-y-0 right-0 z-[60] flex h-[100dvh] w-[min(100vw,25rem)] max-w-full transform flex-col border-l border-outline-variant/30 bg-surface-container-lowest pt-pos-touch-target shadow-[-4px_0_24px_rgba(0,0,0,0.08)] transition-all duration-300 md:relative md:z-auto md:h-auto md:w-[360px] md:translate-x-0 md:pt-0 lg:w-[420px] ${
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

              {/* Input Santri, Deposit & Nomor Meja */}
              <div className="px-md pt-3 pb-2 bg-surface-container-lowest border-b border-outline-variant/20 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nama Santri</label>
                  <input
                    type="text"
                    placeholder="cth: Ahmad"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nominal Deposit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="cth: 250000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={depositProcessing}
                  className="col-span-2 py-2 rounded-lg border border-primary text-primary text-xs font-semibold hover:bg-primary/10 disabled:opacity-50"
                >
                  {depositProcessing ? 'Memproses Deposit...' : 'Tambah Deposit / Bayar Utang'}
                </button>
                <div className="col-span-2">
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

                <div>
                  <p className="mb-2 text-xs font-semibold text-on-surface-variant">Metode Pembayaran</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'deposit', label: 'Saldo Deposit', icon: 'account_balance_wallet' },
                      { value: 'cash', label: 'Cash', icon: 'payments' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                          paymentMethod === method.value
                            ? 'border-primary bg-primary text-on-primary shadow-sm'
                            : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{method.icon}</span>
                        {method.label}
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'deposit' && (
                    <p className="mt-2 text-[11px] text-primary">
                      Saldo santri akan dipotong. Jika tidak cukup, saldo dapat menjadi utang.
                    </p>
                  )}
                  {paymentMethod === 'cash' && (
                    <p className="mt-2 text-[11px] text-on-surface-variant">
                      Pembayaran cash tidak memotong saldo deposit santri.
                    </p>
                  )}
                </div>

                {/* Tombol Bayar */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-primary text-on-primary h-[64px] rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md group cursor-pointer relative z-30 pointer-events-auto"
                >
                  <span className="font-pos-price text-pos-price tracking-wide">
                    Bayar {paymentMethod === 'cash' ? 'Cash' : 'Saldo'} {(total / 1000).toFixed(0)}k
                  </span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </aside>
          )}

          {isDepositModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-on-surface">Deposit Santri</h2>
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nama Santri</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ahmad"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className="w-full p-3 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nominal Deposit</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Contoh: 250000"
                      value={depositAmount}
                      onChange={(event) => setDepositAmount(event.target.value)}
                      className="w-full p-3 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckBalance}
                    disabled={balanceLoading}
                    className="w-full py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container disabled:opacity-50"
                  >
                    {balanceLoading ? 'Mengecek Saldo...' : 'Cek Saldo Santri'}
                  </button>
                  {santriBalance !== null && (
                    <div className={`rounded-lg p-3 ${santriBalance < 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      <p className="text-xs font-semibold">Saldo {customerName}</p>
                      <p className="text-lg font-bold">
                        Rp {Math.abs(santriBalance).toLocaleString('id-ID')}
                        {santriBalance < 0 ? ' (Utang)' : ''}
                      </p>
                    </div>
                  )}
                  {balanceError && <p className="text-xs text-red-600">{balanceError}</p>}
                  <button
                    type="button"
                    onClick={handleLoadHistory}
                    disabled={historyLoading}
                    className="w-full py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container disabled:opacity-50"
                  >
                    {historyLoading ? 'Memuat Riwayat...' : 'Lihat Jajan Hari Ini'}
                  </button>
                  {santriHistory.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-outline-variant/50">
                      {santriHistory.map((entry) => (
                        <div key={entry.id} className="p-2 border-b last:border-b-0 border-outline-variant/30 text-xs">
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold">
                              {entry.type === 'purchase' ? 'Belanja' : 'Deposit'}
                            </span>
                            <span>{new Date(entry.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {entry.type === 'purchase' ? (
                            <div className="mt-1 text-on-surface-variant">
                              {(entry.details?.items || []).map((item) => (
                                <div key={`${entry.id}-${item.name}`}>
                                  {item.name} x{item.qty} - Rp {(item.price * item.qty).toLocaleString('id-ID')}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-1 text-emerald-700">
                              Deposit Rp {Number(entry.amount).toLocaleString('id-ID')}
                            </div>
                          )}
                          <div className="mt-1 font-semibold">
                            Saldo: Rp {Number(entry.balance_after).toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {santriHistory.length > 0 && (
                    <a
                      href={`${route('santri.history.export')}?name=${encodeURIComponent(customerName)}`}
                      className="w-full py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold text-center hover:bg-slate-800"
                    >
                      Export Riwayat CSV
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleDeposit}
                    disabled={depositProcessing}
                    className="w-full py-3 rounded-lg bg-primary text-on-primary font-semibold disabled:opacity-50"
                  >
                    {depositProcessing ? 'Memproses...' : 'Simpan Deposit'}
                  </button>
                  <p className="text-xs text-on-surface-variant">
                    Deposit baru otomatis mengurangi utang jika saldo santri sedang minus.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal Tambah Menu Baru */}
          {isAddMenuOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:p-6">
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

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Produk (opsional)</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setNewMenuImage(e.target.files?.[0] || null)} className="w-full block rounded-xl border border-slate-200 p-2 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700" />
                    <span className="mt-1 block text-[11px] text-slate-400">JPG, PNG, WebP maksimal 2 MB.</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                    <button type="button" onClick={() => setIsAddMenuOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100 text-sm cursor-pointer">Batal</button>
                    <button type="submit" disabled={newMenuProcessing} className="px-5 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 text-sm shadow-sm cursor-pointer disabled:opacity-50">{newMenuProcessing ? 'Menyimpan...' : 'Simpan Menu'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Input Catatan */}
          {isNoteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 sm:p-6">
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

          {editingProduct && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <form onSubmit={handleProductUpdate} className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38735]">Katalog Produk</p>
                    <h2 className="text-xl font-bold text-[#173f2d]">Edit Produk</h2>
                  </div>
                  <button type="button" onClick={() => setEditingProduct(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-600">Nama Produk
                    <input required value={editProductForm.name || ''} onChange={(event) => setEditProductForm({ ...editProductForm, name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800" />
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-slate-600">Harga
                      <input required type="number" min="0" value={editProductForm.price || ''} onChange={(event) => setEditProductForm({ ...editProductForm, price: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800" />
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">Stok
                      <input required type="number" min="0" value={editProductForm.stock || ''} onChange={(event) => setEditProductForm({ ...editProductForm, stock: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800" />
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-600">Kategori
                    <select value={editProductForm.category || ''} onChange={(event) => setEditProductForm({ ...editProductForm, category: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800">
                      <option>Kopi</option>
                      <option>Non-Kopi</option>
                      <option>Makanan</option>
                      <option>Pastry</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-slate-600">Foto Produk
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setEditProductImage(event.target.files?.[0] || null)} className="mt-1 block w-full rounded-xl border border-slate-200 p-2 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700" />
                    <span className="mt-1 block text-[11px] text-slate-400">JPG, PNG, atau WebP maksimal 2 MB.</span>
                  </label>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingProduct(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Batal</button>
                  <button type="submit" disabled={editProductProcessing} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-50">
                    {editProductProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {toast && (
            <div className="pointer-events-none fixed bottom-6 right-6 z-[80] flex w-[calc(100%-3rem)] justify-end sm:w-auto">
              <div className={`pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-[0_24px_70px_rgba(16,41,31,0.28)] backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-500 ${
                toast.type === 'error'
                  ? 'border-red-200 bg-red-50/98 text-red-900'
                  : 'border-[#d6ae5c]/60 bg-white/98 text-[#173f2d]'
              }`}>
                <div className={`h-1.5 w-full ${
                  toast.type === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-[#173f2d] via-[#d6ae5c] to-[#173f2d]'
                }`} />
                <div className="flex items-center gap-4 p-5 sm:p-6">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                    toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <span className="material-symbols-outlined text-[32px]">
                      {toast.type === 'error' ? 'error' : 'check_circle'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-extrabold uppercase tracking-[0.2em] ${
                      toast.type === 'error' ? 'text-red-600' : 'text-[#b38735]'
                    }`}>
                      {toast.type === 'error' ? 'Perlu perhatian' : 'Transaksi berhasil'}
                    </p>
                    <p className="mt-1 text-base font-bold leading-6 sm:text-lg">{toast.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToast(null)}
                    className="self-start rounded-xl p-2 opacity-50 transition hover:bg-black/5 hover:opacity-100"
                    aria-label="Tutup notifikasi"
                  >
                    <span className="material-symbols-outlined">close</span>
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
          {cart.length > 0 && !isDrawerOpen && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="fixed inset-x-4 bottom-4 z-20 flex min-h-12 items-center justify-between rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary shadow-xl md:hidden"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined">shopping_bag</span>
                Keranjang ({cart.reduce((count, item) => count + item.qty, 0)})
              </span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </button>
          )}
        </main>
      </div>
    </>
  );
}
