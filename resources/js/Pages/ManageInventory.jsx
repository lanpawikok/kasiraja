import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

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
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    category: 'Kopi',
    stock: '',
    icon: 'local_cafe'
  });

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

  const clearCart = () => {
    setCart([]);
    setOrderNote('');
    setCustomerName('');
    setTableNumber('');
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Mengirim data pesanan lengkap termasuk Nama & Nomor Meja
  const handleCheckout = () => {
    if (!customerName || !tableNumber) {
      alert("Harap isi Nama Pelanggan dan Nomor Meja terlebih dahulu!");
      return;
    }

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

  const filteredProducts = selectedCategory === 'Semua'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-background text-on-background font-body-md h-screen overflow-hidden flex flex-col">
      <header className="flex justify-between items-center px-md h-[72px] w-full fixed top-0 z-50 bg-surface shadow-sm">
        <div className="flex items-center gap-md">
          {/* Tombol Kembali ke Dashboard */}


          <h1 className="text-headline-md font-bold text-primary">Mie Gachor</h1>


          <button
            onClick={() => setIsAddMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Tambah Menu</span>
          </button>

          <Link href="/dashboard"             className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition-colors">
                      POS
                    </Link>

          <Link
            href="/manage-inventory"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition-colors"
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
        </div>
      </header>

      <main className="flex-1 flex flex-row mt-[72px] overflow-hidden relative">
        <section className="flex-1 flex flex-col bg-surface overflow-hidden relative z-0">
          <div className="p-md bg-surface border-b border-outline-variant/30 flex gap-sm overflow-x-auto">
            {['Semua', 'Kopi', 'Non-Kopi', 'Makanan', 'Pastry'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-lg py-2 rounded-full font-bold text-sm transition-colors cursor-pointer ${
                  selectedCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md content-start">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border text-left relative min-h-[160px] cursor-pointer ${
                    cartItem ? 'border-2 border-primary' : 'border-transparent'
                  }`}
                >
                  {cartItem && (
                    <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs z-10">
                      {cartItem.qty}
                    </div>
                  )}
                  <div className="h-28 w-full bg-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-[48px]">{product.icon || 'restaurant'}</span>
                  </div>
                  <div className="p-sm flex flex-col justify-between flex-1">
                    <h3 className="font-bold text-on-surface line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-semibold mt-1">Rp {product.price.toLocaleString('id-ID')}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {cart.length > 0 && (
          <aside className="w-[360px] lg:w-[420px] bg-surface-container-lowest flex flex-col border-l border-outline-variant/30 z-40">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center">
              <h2 className="font-bold text-lg text-on-surface">Pesanan Saat Ini</h2>
              <button onClick={clearCart} className="text-error hover:bg-error-container/20 p-2 rounded-full cursor-pointer">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>

            {/* Input Nama Pelanggan & Nomor Meja */}
            <div className="px-md pt-3 pb-2 bg-surface-container-lowest border-b border-outline-variant/20 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nama Pelanggan *</label>
                <input
                  type="text"
                  placeholder="cth: Budi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nomor Meja *</label>
                <input
                  type="text"
                  placeholder="cth: 12"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start py-2 border-b border-outline-variant/20">
                  <div>
                    <h4 className="font-bold text-on-surface">{item.name}</h4>
                    <div className="text-on-surface-variant text-sm">{item.price.toLocaleString('id-ID')} x {item.qty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-surface-variant rounded flex items-center justify-center">-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-surface-variant rounded flex items-center justify-center">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface p-md border-t border-outline-variant/30 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-on-surface pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-md"
              >
                Bayar Pesanan
              </button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
