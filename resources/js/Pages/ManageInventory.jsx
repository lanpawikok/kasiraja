import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

const INITIAL_INVENTORY = [
  { id: 1, name: 'Arabica House Blend', desc: 'Kopi utama untuk espresso base.', category: 'Biji Kopi', stock: '2.5 kg', isLowStock: true },
  { id: 2, name: 'Susu Full Cream', desc: 'Greenfield 1L', category: 'Susu & Sirup', stock: '24 pcs', isLowStock: false },
  { id: 3, name: 'Bubuk Milo', desc: 'Kemasan 1kg', category: 'Susu & Sirup', stock: '1.2 kg', isLowStock: true },
  { id: 4, name: 'Gelas Plastik 14oz', desc: 'Polos, tanpa tutup', category: 'Kemasan', stock: '150 pcs', isLowStock: false },
];

export default function Inventory({ auth }) {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // Jika null berarti mode Tambah, jika ada ID berarti Edit
  
  // State Input Form
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Biji Kopi');
  const [formStock, setFormStock] = useState('');
  const [formIsLow, setFormIsLow] = useState(false);

  // Buka Modal untuk Tambah Baru
  const handleOpenAddModal = () => {
    setEditId(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('Biji Kopi');
    setFormStock('');
    setFormIsLow(false);
    setIsModalOpen(true);
  };

  // Buka Modal untuk Edit Data
  const handleOpenEditModal = (item) => {
    setEditId(item.id);
    setFormName(item.name);
    setFormDesc(item.desc);
    setFormCategory(item.category);
    setFormStock(item.stock);
    setFormIsLow(item.isLowStock);
    setIsModalOpen(true);
  };

  // Simpan Data (Create / Update)
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formName || !formStock) return;

    if (editId) {
      // Proses Update
      setInventory(inventory.map(item => 
        item.id === editId 
          ? { ...item, name: formName, desc: formDesc, category: formCategory, stock: formStock, isLowStock: formIsLow } 
          : item
      ));
    } else {
      // Proses Create (Tambah Baru)
      const newItem = {
        id: Date.now(),
        name: formName,
        desc: formDesc,
        category: formCategory,
        stock: formStock,
        isLowStock: formIsLow,
      };
      setInventory([newItem, ...inventory]);
    }

    setIsModalOpen(false);
  };

  // Proses Delete Item
  const handleDeleteItem = (id) => {
    if (confirm('Yakin ingin menghapus bahan baku ini dari inventaris?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  // Filter Data
  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="bg-background text-on-background font-body-md min-h-screen pt-[72px] pb-[80px] md:pb-0 relative">
        {/* TopAppBar */}
        <header className="fixed top-0 w-full z-50 bg-surface shadow-sm flex justify-between items-center px-md h-[72px]">
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 active:opacity-80 p-sm rounded-full hidden md:block cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-headline-md font-headline-md font-bold text-primary">BrewMaster Pro</span>
          </div>

          <div className="hidden md:flex gap-md">
            <nav className="flex gap-sm items-center">
              <Link className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold font-label-bold" href="/">POS</Link>
              <Link className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold font-label-bold" href="/orders">Orders</Link>
              <Link className="px-md py-sm rounded-full bg-primary-container text-on-primary-container text-label-bold font-label-bold" href="/manage-inventory">Inventory</Link>
              <Link className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold font-label-bold" href="/reports">Reports</Link>
            </nav>
          </div>

          <div>
            <button className="text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 active:opacity-80 p-sm rounded-full cursor-pointer">
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-md md:p-lg space-y-lg">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
            <div>
              <h1 className="text-display-lg font-display-lg text-on-background">Manajemen Stok</h1>
              <p className="text-body-md text-on-surface-variant mt-xs">Pantau ketersediaan bahan baku dan input stok baru.</p>
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg flex items-center justify-center gap-sm shadow-sm hover:bg-primary/90 transition-colors h-[48px] cursor-pointer"
            >
              <span className="material-symbols-outlined">add_shopping_cart</span>
              <span className="text-label-bold font-label-bold">+ Input Belanja</span>
            </button>
          </div>

          {/* Controls (Search & Filter) */}
          <div className="flex flex-col md:flex-row gap-md bg-surface-container-low p-sm rounded-xl shadow-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-sm py-sm rounded-lg border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary text-body-md h-[48px]" 
                placeholder="Cari bahan baku..." 
                type="text"
              />
            </div>
            <div className="flex gap-sm overflow-x-auto pb-xs md:pb-0 scrollbar-hide">
              {['Semua', 'Biji Kopi', 'Susu & Sirup', 'Kemasan'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-md py-xs rounded-full border text-label-bold font-label-bold h-[48px] flex items-center cursor-pointer transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-container text-on-primary-container border-primary-container'
                      : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredInventory.map((item) => (
              <div 
                key={item.id} 
                className={`bg-surface rounded-xl p-md shadow-sm border-l-4 flex flex-col justify-between ${
                  item.isLowStock ? 'border-error' : 'border-primary'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-sm">
                    {item.isLowStock ? (
                      <span className="px-2 py-1 bg-error-container text-on-error-container rounded text-label-sm font-label-sm flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-error"></div> Stok Menipis
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded text-label-sm font-label-sm flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary"></div> Stok Aman
                      </span>
                    )}
                    <span className="text-on-surface-variant text-label-sm font-label-sm bg-surface-container px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-headline-sm font-headline-sm text-on-background">{item.name}</h3>
                  <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                </div>
                <div className="mt-md flex justify-between items-end border-t border-surface-variant pt-sm">
                  <div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Sisa Stok</p>
                    <p className={`text-pos-price font-pos-price ${item.isLowStock ? 'text-error' : 'text-on-background'}`}>
                      {item.stock}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEditModal(item)}
                      className="text-primary hover:bg-primary-container/10 p-1.5 rounded transition-colors cursor-pointer"
                      title="Edit Stok"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-error hover:bg-error-container/20 p-1.5 rounded transition-colors cursor-pointer"
                      title="Hapus Stok"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Modal Form Tambah / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-md">
            <div className="bg-surface w-full max-w-lg rounded-2xl p-lg shadow-xl space-y-md animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center border-b border-surface-variant pb-sm">
                <h2 className="text-headline-md font-bold text-primary">
                  {editId ? 'Edit Bahan Baku' : 'Input Belanja / Bahan Baru'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-on-surface-variant hover:bg-surface-container p-1 rounded-full cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-md">
                <div>
                  <label className="block text-label-bold font-label-bold text-on-surface-variant mb-xs">Nama Bahan Baku</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="Contoh: Biji Kopi Robusta"
                    className="w-full px-sm py-sm rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                  />
                </div>

                <div>
                  <label className="block text-label-bold font-label-bold text-on-surface-variant mb-xs">Keterangan / Detail</label>
                  <input 
                    type="text" 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Contoh: Kemasan 1kg / Greenfield 1L"
                    className="w-full px-sm py-sm rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="block text-label-bold font-label-bold text-on-surface-variant mb-xs">Kategori</label>
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-sm py-sm rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                    >
                      <option value="Biji Kopi">Biji Kopi</option>
                      <option value="Susu & Sirup">Susu & Sirup</option>
                      <option value="Kemasan">Kemasan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-bold font-label-bold text-on-surface-variant mb-xs">Jumlah Sisa Stok</label>
                    <input 
                      type="text" 
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      required
                      placeholder="Contoh: 10 kg / 50 pcs"
                      className="w-full px-sm py-sm rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-sm pt-xs">
                  <input 
                    type="checkbox" 
                    id="isLowStock"
                    checked={formIsLow}
                    onChange={(e) => setFormIsLow(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="isLowStock" className="text-body-md text-on-background cursor-pointer select-none">
                    Tandai sebagai **Stok Menipis** (Peringatan Merah)
                  </label>
                </div>

                <div className="flex justify-end gap-sm pt-md border-t border-surface-variant">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant font-label-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-lg py-sm rounded-lg bg-primary text-on-primary font-label-bold hover:bg-primary/90 cursor-pointer shadow-sm"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BottomNavBar (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface shadow-[0_-1px_4px_rgba(0,0,0,0.05)] flex justify-around items-center px-sm py-xs">
          <Link className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150" href="/">
            <span className="material-symbols-outlined">point_of_sale</span>
            <span className="text-label-sm font-label-sm mt-xs">POS</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150" href="/orders">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-label-sm font-label-sm mt-xs">Orders</span>
          </Link>
          <Link className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-md py-xs active:scale-95 transition-transform duration-150" href="/manage-inventory">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-label-sm font-label-sm mt-xs">Inventory</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150" href="/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-label-sm font-label-sm mt-xs">Reports</span>
          </Link>
        </nav>
      </div>
    </>
  );
}