import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
  
// Helper di luar komponen supaya referensinya stabil dan aman dipakai
// sebagai dependency useEffect.
const fetchsantriBalance = async (name) => {
  const response = await fetch(`${route('santri.balance')}?name=${encodeURIComponent(name)}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const error = new Error(result.message || 'Saldo santri tidak ditemukan.');
    error.status = response.status;
    throw error;
  }

  const result = await response.json();
  return Number(result.balance);
};

// Ringkas untuk pesan toast, misalnya "28k" atau "1.5jt". Saldo minus
// tetap memakai tanda negatif supaya kasir tidak salah baca utang
// sebagai saldo positif.
const formatRupiahShort = (value) => {
  const raw = Number(value) || 0;
  const sign = raw < 0 ? '-' : '';
  const amount = Math.abs(raw);
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return `${sign}${millions.toFixed(millions % 1 === 0 ? 0 : 1).replace('.', ',')}jt`;
  }
  return `${sign}${Math.round(amount / 1000)}k`;
};

export default function Dashboard({ catalogProducts = [] }) {
  const { auth } = usePage().props;

  // Ambil role user
  const userRole = auth.user?.role?.toLowerCase() || '';

  // Cek admin (hanya role khusus manajemen/admin)
  const isAdmin = ['admin', 'administrator', 'owner', 'superadmin', 'manager'].includes(userRole);

  const [products, setProducts] = useState(catalogProducts.length > 0 ? catalogProducts : INITIAL_PRODUCTS);
  useEffect(() => {
    if (catalogProducts.length > 0) setProducts(catalogProducts);
  }, [catalogProducts]);
  const [cart, setCart] = useState([]);
  // Ref ini hanya dipakai untuk membaca keranjang terbaru secara sinkron di
  // dalam event handler. State `cart` bisa tertinggal satu render saat beberapa
  // klik datang beruntun, sehingga batas stok sempat terlewat.
  const cartRef = useRef(cart);
  // Perhitungan dilakukan langsung dari ref lalu disimpan balik ke ref, bukan
  // memakai updater fungsional, karena updater baru dijalankan saat render.
  // Kalau ref hanya diisi di dalam updater, nilainya tetap basi sampai render.
  const updateCart = (updater) => {
    const nextCart = updater(cartRef.current);
    cartRef.current = nextCart;
    setCart(nextCart);
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const baseCategories = ['Kopi', 'Non-Kopi', 'Makanan', 'Pastry'];
  const baseSizes = ['Kecil', 'Sedang', 'Besar', 'Regular', 'Large'];
  const baseVariants = ['Original', 'Vanilla', 'Cokelat', 'Matcha', 'Strawberry', 'Caramel', 'Hazelnut'];
  const categoryOptions = Array.from(new Set([...baseCategories, ...products.map((p) => p.category).filter(Boolean)]));
  const sizeOptions = Array.from(new Set([...baseSizes, ...products.map((p) => p.size).filter(Boolean)]));
  const variantOptions = Array.from(new Set([...baseVariants, ...products.map((p) => p.variant).filter(Boolean)]));
  const filterOptions = ['Semua', ...categoryOptions];

  // State untuk Fitur Catatan & Pelanggan
  const [orderNote, setOrderNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('deposit');
  const [santriBalance, setsantriBalance] = useState(null);
  const [balanceError, setBalanceError] = useState('');
  const [toast, setToast] = useState(null);
  const [balanceAutoLoading, setBalanceAutoLoading] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
    // Bedakan "nama ada di daftar Santri" dari "nama tidak terdaftar". Tanpa
    // ini, nama asing ikut terbaca punya saldo 0 sehingga panel saldo tetap
    // muncul untuk warga atau pengunjung yang tidak punya saldo.
    const [isKnownSantri, setIsKnownSantri] = useState(false);
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);
  const [checkoutChecking, setCheckoutChecking] = useState(false);
  const [isDebtConfirmOpen, setIsDebtConfirmOpen] = useState(false);

  // State untuk Antrian: keranjang yang sudah diisi lalu disimpan/diparkir
  // supaya kasir bisa lanjut melayani Santri berikutnya tanpa kehilangan
  // pesanan yang sedang menunggu giliran. Antrian disimpan di localStorage
  // supaya tetap ada walau kasir refresh halaman atau browser-nya ke-restart
  // di tengah antrean.
  const QUEUE_STORAGE_KEY = 'kasiraja.queue.v1';
  const [queue, setQueue] = useState([]);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const queueHydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setQueue(parsed);
      }
    } catch {
      window.localStorage.removeItem(QUEUE_STORAGE_KEY);
    } finally {
      queueHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    // Jangan tulis apa pun sebelum state selesai dibaca, supaya antrian lama
    // tidak tertimpa array kosong saat halaman pertama kali dimuat.
    if (!queueHydrated.current) return;
    try {
      window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch {
      showToast('Antrian tidak bisa disimpan di browser ini.', 'error');
    }
  }, [queue]);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [tempNote, setTempNote] = useState('');

  // State untuk Modal Manage Inventory & Modal Tambah Menu
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({});
  const [editProductImage, setEditProductImage] = useState(null);
  const [editProductProcessing, setEditProductProcessing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteProductProcessing, setDeleteProductProcessing] = useState(false);

  // Form State untuk Tambah Menu Baru
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    category: 'Kopi',
    size: '',
    variant: '',
    stock: '',
    icon: 'local_cafe'
  });

  // Notifikasi kasir. Timer sebelumnya dibatalkan dulu supaya pesan lama tidak
  // ikut menutup pesan yang baru saja muncul (kasir menekan kartu produk
  // berkali-kali dalam waktu singkat).
  const toastTimerRef = useRef(null);
  const toastIdRef = useRef(0);
  const showToast = (message, type = 'success', hint = '') => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    // Id baru memaksa React membuat ulang elemen toast, sehingga animasi masuk
    // ikut terulang saat pesan yang sama muncul lagi.
    toastIdRef.current += 1;
    setToast({ message, type, hint, id: toastIdRef.current });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3800);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  // Menambah produk ke keranjang
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast(`${product.name} habis.`, 'error', 'Stoknya sudah 0, kas tidak bisa menambah.');
      return;
    }
    // Sumber stok terkini dibaca dari ref, bukan dari state `cart`: beberapa
    // klik beruntun bisa dievaluasi sebelum React sempat merender state
    // terbaru, sehingga dua klik lolos kalau hanya membaca `cart`.
    const currentQty =
      cartRef.current.find((item) => item.id === product.id)?.qty ?? 0;
    if (currentQty >= product.stock) {
      showToast(
        `Stok ${product.name} tinggal ${product.stock}.`,
        'error',
        currentQty === product.stock
          ? 'Semua stok sudah masuk keranjang.'
          : `Sisa ${product.stock - currentQty} lagi di keranjang.`
      );
      return;
    }
    updateCart((prevCart) => {
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
    const target = cartRef.current.find((item) => item.id === id);
    if (target && delta > 0 && target.qty + delta > target.stock) {
      showToast(
        `Stok ${target.name} tinggal ${target.stock}.`,
        'error',
        'Jumlah di keranjang sudah melebihi stok tersedia.'
      );
      return;
    }
    updateCart((prevCart) =>
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
      size: product.size || '',
      variant: product.variant || '',
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

  const handleProductDelete = () => {
    if (!editingProduct) return;
    setDeleteProductProcessing(true);
    router.delete(route('products.destroy', editingProduct.id), {
      preserveScroll: true,
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
        setEditingProduct(null);
        showToast('Produk berhasil dihapus.');
        router.reload({ only: ['catalogProducts'] });
      },
      onError: () => showToast('Produk gagal dihapus.', 'error'),
      onFinish: () => setDeleteProductProcessing(false),
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
      size: newMenu.size || '',
      variant: newMenu.variant || '',
      stock: newMenu.stock,
      icon: newMenu.icon || 'local_cafe',
    };
    const hasImage = !!newMenuImage;
    const url = route('products.store');
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        setIsAddMenuOpen(false);
        setNewMenu({ name: '', price: '', category: 'Kopi', size: '', variant: '', stock: '', icon: 'local_cafe' });
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
    updateCart(() => []);
    setOrderNote('');
    setCustomerName('');
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

  // --- FITUR ANTRIAN ---
  // Satu antrian berisi seluruh isi keranjang beserta data pembelinya, jadi
  // kalau kasir sedang melayani orang lain, pesanan ini tetap utuh sampai dipanggil.
  const buildQueueEntry = (note, name, method) => ({
    cart: cart,
    orderNote: note,
    customerName: name,
    paymentMethod: method,
    total: total,
    savedAt: Date.now(),
  });

  // Menyimpan keranjang saat ini ke antrian dan mengosongkan keranjang,
  // supaya kasir bisa langsung mulai mengisi pesanan orang berikutnya.
  const parkCartToQueue = () => {
    if (cart.length === 0) {
      showToast('Keranjang masih kosong.', 'error');
      return;
    }

    const entry = buildQueueEntry(orderNote, customerName, paymentMethod);
    setQueue((prev) => [...prev, entry]);
    clearCart();
    setPaymentMethod('deposit');
    setsantriBalance(null);
        setIsKnownSantri(false);
        setBalanceError('');
    showToast(`Pesanan #${queue.length + 1} disimpan ke antrian. Keranjang siap diisi lagi.`);
  };

  // Memanggil kembali satu pesanan dari antrian untuk diproses pembayaran.
  const recallFromQueue = (index) => {
    const entry = queue[index];
    if (!entry) return;

    // Keranjang sekarang boleh tidak kosong; pesanan yang dipanggil menggantikan
    // isinya, karena antrian dibuat justru untuk bergantian antar Santri.
    updateCart(() => entry.cart);
    setOrderNote(entry.orderNote || '');
    setCustomerName(entry.customerName || '');
    setPaymentMethod(entry.paymentMethod || 'deposit');
    setsantriBalance(null);
        setIsKnownSantri(false);
        setBalanceError('');

        const remaining = queue.filter((_, i) => i !== index);
        setQueue(remaining);

        if (entry.customerName) {
          // Minta server refresh saldo, karena antrian bisa sudah berjam-jam lalu.
          setBalanceRefreshKey((key) => key + 1);
    }

    showToast(`Pesanan ${index + 1} dipanggil. Silakan proses pembayaran.`);
  };

  const removeFromQueue = (index) => {
    const removed = queue[index];
    setQueue((prev) => prev.filter((_, i) => i !== index));
    showToast(
      removed?.customerName
        ? `Pesanan ${removed.customerName} dibatalkan dari antrian.`
        : `Pesanan ${index + 1} dibatalkan dari antrian.`,
      'error',
    );
  };

  // Cek saldo otomatis begitu nama diketik, supaya kasir tidak perlu buka
  // halaman lain dulu untuk tahu saldo sudah minus.
  useEffect(() => {
    const name = customerName.trim();
    if (!name) {
      setsantriBalance(null);
          setIsKnownSantri(false);
          setBalanceError('');
          setBalanceAutoLoading(false);
          return;
        }

        let active = true;
        setBalanceAutoLoading(true);

        const timer = window.setTimeout(async () => {
          try {
            const balance = await fetchsantriBalance(name);
            if (active) {
              setsantriBalance(balance);
              setIsKnownSantri(true);
              setBalanceError('');
            }
          } catch (error) {
            // Nama yang tidak ada di daftar Santri bukan error fatal, tapi juga bukan
            // saldo nol. Kasir bisa saja ketik nama warga atau pengunjung yang memang
            // tidak punya saldo, jadi panel saldo harus disembunyikan, bukan
            // ditampilkan sebagai "Rp 0".
            if (active) {
              if (error.status === 404) {
            setsantriBalance(null);
                setIsKnownSantri(false);
                setBalanceError('');
              } else {
                setsantriBalance(null);
                setIsKnownSantri(false);
                setBalanceError(error.message);
              }
            }
          } finally {
            if (active) setBalanceAutoLoading(false);
          }
        }, 400);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [customerName, balanceRefreshKey]);

  // Perhitungan Subtotal dan Total. Pajak PB1 dan service sudah dihapus,
  // jadi total transaksi sama persis dengan jumlah harga menu.
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = subtotal;

  // Sisa saldo setelah pesanan ini dibayar, supaya kasir langsung melihat
    // risiko utang sebelum menekan tombol bayar. Panel hanya muncul kalau nama
    // memang terdaftar sebagai Santri, bukan sekadar karena angka saldo ada.
    const hasSantriBalance = isKnownSantri && santriBalance !== null;
  const depositAfterOrder = paymentMethod === 'deposit' && hasSantriBalance
    ? santriBalance - total
    : null;
  const isDepositShort = depositAfterOrder !== null && depositAfterOrder < 0;
  const isSantriBalanceNegative = hasSantriBalance && santriBalance < 0;

  // Kirim transaksi ke server.
  const submitCheckout = () => {
    router.post(route('checkout.process'), {
          cart: cart.map((item) => ({ id: item.id, qty: item.qty })),
          orderNote: orderNote,
          customerName: customerName,
          paymentMethod: paymentMethod,
        }, {
      onSuccess: () => {
        // Saldo dicek ulang supaya angkanya tidak lagi menampilkan nilai lama yang
        // sudah terpakai untuk pesanan ini, dan keranjang dikosongkan di sisi
        // klien — bukan hanya andari render ulang dari Inertia. Kalau tidak,
        // isinya masih tertinggal di state walau transaksi sudah lunas.
        setIsDebtConfirmOpen(false);
        clearCart();
        setsantriBalance(null);
                setIsKnownSantri(false);
                setBalanceError('');
        setCheckoutChecking(false);
        setBalanceRefreshKey((key) => key + 1);
        showToast(
          paymentMethod === 'deposit' && isDepositShort
            ? `Transaksi tersimpan. Saldo ${customerName.trim()} kini minus ${formatRupiahShort(Math.abs(depositAfterOrder))}.`
            : 'Transaksi berhasil disimpan.',
        );      },
      onError: (errors) => {
        setCheckoutChecking(false);
        const message = Object.values(errors || {})[0];
        showToast(String(message || 'Transaksi gagal diproses. Coba lagi.'), 'error');
      },
    });
  };

  // Handler untuk Proses Pembayaran. Kalau bayar pakai saldo, saldo selalu
  // dicek ulang di server supaya angka yang ditampilkan kasir tidak basi.
  const handleCheckout = async () => {
    if (checkoutChecking) return;

    if (paymentMethod !== 'deposit') {
      setCheckoutChecking(true);
      submitCheckout();
      return;
    }

    if (!customerName.trim()) {
      showToast('Isi nama santri sebelum membayar dengan saldo deposit.', 'error');
      return;
    }

    setCheckingBalance(true);
    try {
      let balance;
      try {
        balance = await fetchsantriBalance(customerName.trim());
      } catch (error) {
            // Nama yang tidak ada di daftar Santri tidak bisa dibayar pakai saldo:
            // tidak ada saldo yang bisa dipotong. Kasir harus bayar Cash supaya
            // warga atau pengunjung ini tidak ikut tercatat punya utang.
            if (error.status === 404) {
              setsantriBalance(null);
              setIsKnownSantri(false);
              showToast('Nama belum terdaftar, pakai Cash saja.', 'error');
              return;
            }
            throw error;
          }

          setsantriBalance(balance);
          setIsKnownSantri(true);
          setBalanceError('');

      if (balance - total < 0) {
        setIsDebtConfirmOpen(true);
        return;
      }

      setCheckoutChecking(true);
      submitCheckout();
    } catch (error) {
      showToast(error.message || 'Gagal mengecek saldo. Coba lagi.', 'error');
    } finally {
      setCheckingBalance(false);
    }
  };

  // Filter Produk berdasarkan Kategori
  const filteredProducts = selectedCategory === 'Semua'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <>
      <Head title="Dashboard" />
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
          onQueue={() => setIsQueueModalOpen(true)}
          queueCount={queue.length}
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
              onClick={() => setIsQueueModalOpen(true)}
              disabled={queue.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Lihat pesanan yang sedang menunggu giliran"
            >
              <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
              Antrian
              {queue.length > 0 && (
                <span className="ml-0.5 min-w-5 px-1.5 py-0.5 rounded-full bg-white text-amber-700 text-[11px] font-bold text-center">
                  {queue.length}
                </span>
              )}
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
                {filterOptions.map((cat) => (
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
                const isSoldOut = product.stock <= 0;
                const isAtMaxStock = cartItem && cartItem.qty >= product.stock;
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
                    className={`group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border transition-all text-left relative min-h-[160px] ${
                      isSoldOut
                        ? 'opacity-50 cursor-not-allowed grayscale'
                        : 'active:bg-surface-container-low cursor-pointer ' +
                          (isAtMaxStock
                            ? 'border-2 border-amber-400'
                            : cartItem
                              ? 'border-2 border-primary'
                              : 'border-transparent hover:border-outline-variant')
                    }`}
                  >
                    {cartItem && (
                      <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full w-6 h-6 flex items-center justify-center font-label-bold text-label-sm z-10 shadow-sm">
                        {cartItem.qty}
                      </div>
                    )}
                    {isSoldOut && (
                      <div className="absolute inset-x-0 top-2 flex justify-center z-10 pointer-events-none">
                        <span className="rounded-full bg-slate-800/85 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          Habis
                        </span>
                      </div>
                    )}
                    {!isSoldOut && isAtMaxStock && (
                      <div className="absolute inset-x-0 top-2 flex justify-center z-10 pointer-events-none">
                        <span className="rounded-full bg-amber-500/95 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                          Maksimal stok
                        </span>
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
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${
                            isSoldOut
                              ? 'bg-red-50 text-red-600'
                              : isAtMaxStock
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSoldOut ? 'Habis' : isAtMaxStock ? 'Stok: ' + product.stock + ' (max)' : 'Stok: ' + product.stock}
                        </span>
                      </div>
                      {(product.size || product.variant) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {product.size && <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded-full border border-sky-100">{product.size}</span>}
                          {product.variant && <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">{product.variant}</span>}
                        </div>
                      )}
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
                    onClick={parkCartToQueue}
                    disabled={cart.length === 0}
                    className="px-3 py-2 text-xs font-semibold text-on-primary bg-primary rounded-full transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Simpan pesanan ini ke antrian, lalu lanjut mengisi pesanan berikutnya"
                  >
                    <span className="material-symbols-outlined text-base">hourglass_top</span>
                    Simpan Antrian
                  </button>
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

              {/* Input Nama Pelanggan */}
              <div className="px-md pt-3 pb-2 bg-surface-container-lowest border-b border-outline-variant/20">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nama</label>
                  <input
                    type="text"
                    placeholder="cth: Ahmad"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                                    {customerName.trim() && !isKnownSantri && !balanceAutoLoading && !balanceError && (
                                      <p className="mt-1 text-[11px] text-amber-700">
                                        Nama belum terdaftar sebagai Santri, tidak ada saldo. Gunakan Cash.
                                      </p>
                                    )}
                                    {balanceError && (
                                      <p className="mt-1 text-[11px] text-red-600">{balanceError}</p>
                                    )}
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
                          disabled={item.qty >= item.stock}
                          title={item.qty >= item.stock ? `Stok maksimal ${item.stock}` : 'Tambah'}
                          className={`w-8 h-full flex items-center justify-center transition-colors ${
                            item.qty >= item.stock
                              ? 'bg-surface text-on-surface-variant/30 cursor-not-allowed'
                              : 'bg-surface hover:bg-surface-variant text-on-surface-variant active:bg-surface-dim cursor-pointer'
                          }`}
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
                  <div className="flex justify-between items-center font-headline-sm text-headline-sm text-on-surface pt-2 border-t border-outline-variant/30 mt-1">
                    <span>Total</span>
                    <span className="text-primary font-bold">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Ringkasan saldo dan proyeksi utang supaya kasir langsung
                    melihat konsekuensi sebelum menekan tombol bayar. */}
                {paymentMethod === 'deposit' && hasSantriBalance && (
                  <div className={`rounded-xl border p-3 text-sm ${
                    isDepositShort
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : isSantriBalanceNegative
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-semibold">
                        Saldo {customerName.trim() || 'santri'}
                        {santriBalance < 0 ? ' (sudah utang)' : ''}
                      </span>
                      <span className="font-bold">
                        Rp {santriBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="mt-1.5 flex justify-between items-center gap-2 border-t border-current/15 pt-1.5">
                      <span className="text-xs font-semibold">
                        Sisa saldo setelah bayar
                      </span>
                      <span className={`font-bold ${isDepositShort ? 'text-red-600' : ''}`}>
                        Rp {depositAfterOrder.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {isDepositShort && (
                      <p className="mt-1.5 text-[11px] leading-4">
                        Saldo tidak cukup. Simpan sebagai utang dengan menekan
                        tombol Bayar.
                      </p>
                    )}
                  </div>
                )}

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
                  disabled={checkoutChecking}
                  className="w-full bg-primary text-on-primary h-[64px] rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md group cursor-pointer relative z-30 pointer-events-auto disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="font-pos-price text-pos-price tracking-wide">
                    {checkoutChecking ? 'Memproses...' : `Bayar ${paymentMethod === 'cash' ? 'Cash' : 'Saldo'} ${(total / 1000).toFixed(0)}k`}
                  </span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </aside>
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
                      <input
                        list="category-options"
                        value={newMenu.category}
                        onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                        placeholder="Ketik kategori baru, mis: Kopi Leguran Sedang"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <datalist id="category-options">
                        {categoryOptions.map((c) => <option key={c} value={c} />)}
                      </datalist>
                      <span className="mt-1 block text-[11px] text-slate-400">Ketik bebas kategori baru.</span>
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

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Ukuran</label>
                      <input
                        list="size-options"
                        value={newMenu.size}
                        onChange={(e) => setNewMenu({ ...newMenu, size: e.target.value })}
                        placeholder="Kecil / Sedang / Besar"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <datalist id="size-options">
                        {sizeOptions.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Varian Rasa</label>
                      <input
                        list="variant-options"
                        value={newMenu.variant}
                        onChange={(e) => setNewMenu({ ...newMenu, variant: e.target.value })}
                        placeholder="Original / Vanilla / Cokelat"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <datalist id="variant-options">
                        {variantOptions.map((c) => <option key={c} value={c} />)}
                      </datalist>
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
                  <button type="button" onClick={() => { setEditingProduct(null); setIsDeleteConfirmOpen(false); }} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
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
                    <input list="category-options-edit" value={editProductForm.category || ''} onChange={(event) => setEditProductForm({ ...editProductForm, category: event.target.value })} placeholder="Ketik kategori baru" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800" />
                    <datalist id="category-options-edit">
                      {categoryOptions.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-slate-600">Ukuran
                      <input list="size-options-edit" value={editProductForm.size || ''} onChange={(event) => setEditProductForm({ ...editProductForm, size: event.target.value })} placeholder="Kecil / Sedang / Besar" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800" />
                      <datalist id="size-options-edit">
                        {sizeOptions.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">Varian Rasa
                      <input list="variant-options-edit" value={editProductForm.variant || ''} onChange={(event) => setEditProductForm({ ...editProductForm, variant: event.target.value })} placeholder="Original / Vanilla / Cokelat" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800" />
                      <datalist id="variant-options-edit">
                        {variantOptions.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-600">Foto Produk
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setEditProductImage(event.target.files?.[0] || null)} className="mt-1 block w-full rounded-xl border border-slate-200 p-2 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700" />
                    <span className="mt-1 block text-[11px] text-slate-400">JPG, PNG, atau WebP maksimal 2 MB.</span>
                  </label>
                </div>
                <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setIsDeleteConfirmOpen(true)} disabled={deleteProductProcessing || editProductProcessing} className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Hapus Produk
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setEditingProduct(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Batal</button>
                    <button type="submit" disabled={editProductProcessing || deleteProductProcessing} className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-50">
                      {editProductProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {isDeleteConfirmOpen && editingProduct && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-red-600">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <span className="material-symbols-outlined">warning</span>
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Hapus Produk?</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Produk <span className="font-bold text-slate-900">"{editingProduct.name}"</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} disabled={deleteProductProcessing} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Batal</button>
                  <button type="button" onClick={handleProductDelete} disabled={deleteProductProcessing} className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                    {deleteProductProcessing ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDebtConfirmOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-amber-600">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <span className="material-symbols-outlined">warning</span>
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Saldo Tidak Cukup</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Saldo <span className="font-bold text-slate-900">{customerName.trim()}</span>{' '}
                  <span className={`font-bold ${santriBalance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    ({santriBalance < 0 ? 'utang ' : ''}{formatRupiahShort(santriBalance)})
                  </span>{' '}
                  tidak cukup untuk total{' '}
                  <span className="font-bold text-slate-900">Rp {total.toLocaleString('id-ID')}</span>. Lanjut menyimpan transaksi akan membuat saldo minus{' '}
                  <span className="font-bold text-red-600">{formatRupiahShort(depositAfterOrder)}</span>.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsDebtConfirmOpen(false)} disabled={checkoutChecking} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDebtConfirmOpen(false);
                      setCheckoutChecking(true);
                      submitCheckout();
                    }}
                    disabled={checkoutChecking}
                    className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {checkoutChecking ? 'Memproses...' : 'Ya, Simpan sebagai Utang'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isQueueModalOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div className="flex items-center gap-3 text-amber-600">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <span className="material-symbols-outlined">hourglass_top</span>
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Antrian Pesanan</h3>
                      <p className="text-xs text-slate-500">{queue.length} pesanan menunggu giliran</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQueueModalOpen(false)}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Tutup"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {queue.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300">hourglass_empty</span>
                    <p className="mt-3 text-sm font-semibold text-slate-700">Antrian kosong</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Tekan &quot;Simpan Antrian&quot; di keranjang untuk menitipkan pesanan yang belum sempat dibayar.
                    </p>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                    {queue.map((entry, index) => (
                      <div key={entry.savedAt} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">
                              #{index + 1} {entry.customerName?.trim() || 'Tanpa nama'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {entry.cart.length} item
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-emerald-700">
                            Rp {Number(entry.total || 0).toLocaleString('id-ID')}
                          </p>
                        </div>

                        {entry.orderNote && (
                          <p className="mt-2 rounded-lg bg-white px-2 py-1 text-[11px] text-slate-600">Catatan: {entry.orderNote}</p>
                        )}

                        <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
                          Disimpan {new Date(entry.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              recallFromQueue(index);
                              setIsQueueModalOpen(false);
                            }}
                            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            Panggil
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromQueue(index)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            Batalkan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setIsQueueModalOpen(false)}
                    className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {toast && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none fixed inset-x-4 bottom-[92px] z-[80] flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end"
            >
              <div
                key={toast.id}
                className={`toast-enter pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border p-3.5 shadow-[0_18px_44px_rgba(16,41,31,0.2)] ${
                  toast.type === 'error'
                    ? 'border-amber-200 bg-amber-50 text-amber-950'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                }`}
              >
                <span
                  className={`material-symbols-outlined mt-px shrink-0 text-[22px] ${
                    toast.type === 'error' ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                  aria-hidden="true"
                >
                  {toast.type === 'error' ? 'error' : 'check_circle'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-5">{toast.message}</p>
                  {toast.hint && (
                    <p className="mt-0.5 text-[12px] leading-4 opacity-70">{toast.hint}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={dismissToast}
                  className="-mr-1 -mt-1 shrink-0 rounded-lg p-1 opacity-40 transition hover:bg-black/5 hover:opacity-100"
                  aria-label="Tutup notifikasi"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-left ${
                    toast.type === 'error' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ animation: 'toast-progress 3800ms linear both' }}
                  aria-hidden="true"
                />
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
