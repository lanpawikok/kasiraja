import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

export default function ReportsAndAudit({ auditItemsData, summary, selectedMonth: initialMonth }) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || '2026-08');
  const [auditItems, setAuditItems] = useState(
    auditItemsData || [
      {
        id: 1,
        item_name: 'Biji Kopi Arabica',
        sku: 'CF-ARB-01',
        icon: 'coffee_maker',
        system_stock: 45,
        unit: 'kg',
        physical_stock: 43,
        reason: 'employee',
      },
      {
        id: 2,
        item_name: 'Susu Segar (Fresh Milk)',
        sku: 'MK-FR-02',
        icon: 'water_drop',
        system_stock: 120,
        unit: 'L',
        physical_stock: 115,
        reason: 'expired',
      },
      {
        id: 3,
        item_name: 'Croissant Butter',
        sku: 'FD-CR-01',
        icon: 'bakery_dining',
        system_stock: 30,
        unit: 'pcs',
        physical_stock: 30,
        reason: '',
      },
    ]
  );

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    router.get('/reports', { month }, { preserveState: true });
  };

  const handlePhysicalStockChange = (id, value) => {
    const val = value === '' ? '' : parseFloat(value);
    setAuditItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const diff = val !== '' && !isNaN(val) ? val - item.system_stock : 0;
          return {
            ...item,
            physical_stock: val,
            reason: diff === 0 ? '' : item.reason,
          };
        }
        return item;
      })
    );
  };

  const handleReasonChange = (id, value) => {
    setAuditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reason: value } : item))
    );
  };

  const handleSubmitAudit = () => {
    const payload = auditItems.map((item) => ({
      id: item.id,
      physicalStock: item.physical_stock,
      reason: item.reason,
    }));

    router.post('/reports/audit', { audits: payload });
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-safe font-body-md">
      {/* TopAppBar Header */}
      <header className="fixed top-0 w-full z-50 bg-surface shadow-sm text-primary flex justify-between items-center px-md h-[48px]">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">storefront</span>
          <span className="text-headline-md font-bold text-primary">BrewMaster Pro</span>
        </div>
        <div className="hidden md:flex items-center gap-md text-on-surface-variant font-semibold text-sm">
          <Link href="/dashboard" className="hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded">
            POS
          </Link>
          <Link href="/dashboard" className="hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded">
            Orders
          </Link>
          <Link href="/manage-inventory" className="hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded">
            Inventory
          </Link>
          <Link href="/reports" className="text-primary hover:bg-primary/10 transition-colors duration-200 px-sm py-xs rounded font-bold">
            Reports
          </Link>
        </div>
        <button className="active:opacity-80 transition-opacity p-sm rounded-full hover:bg-primary/10 cursor-pointer">
          <span className="material-symbols-outlined text-primary">account_circle</span>
        </button>
      </header>

      {/* Main Canvas */}
      <main className="pt-[80px] pb-[100px] md:pb-lg max-w-7xl mx-auto px-md md:px-lg grid gap-lg">
        {/* Header & Date Picker */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div>
            <h1 className="text-3xl font-bold text-on-background">Laporan & Keuangan</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Tinjauan bulanan dan penyesuaian stok inventaris.</p>
          </div>
          <div className="flex items-center bg-surface-container-high rounded-full px-md py-sm shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant mr-sm">calendar_month</span>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-transparent border-none font-semibold text-on-surface focus:ring-0 cursor-pointer text-sm outline-none"
            >
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-06">Juni 2026</option>
            </select>
          </div>
        </div>

        {/* Financial Chart Section */}
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant mb-md">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="text-xl font-semibold text-on-surface">Tren Keuangan Bulanan</h3>
            <div className="flex gap-md">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <span className="text-xs text-on-surface-variant">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                <span className="text-xs text-on-surface-variant">Pengeluaran</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full flex items-end gap-sm px-sm">
            <div className="flex-1 flex flex-col justify-end gap-1 h-full">
              <div className="flex items-end gap-1 h-full">
                <div className="w-full bg-primary-container/20 rounded-t" style={{ height: '40%' }}></div>
                <div className="w-full bg-secondary-container/20 rounded-t" style={{ height: '30%' }}></div>
              </div>
              <span className="text-[10px] text-center text-on-surface-variant">Minggu 1</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1 h-full">
              <div className="flex items-end gap-1 h-full">
                <div className="w-full bg-primary-container/20 rounded-t" style={{ height: '65%' }}></div>
                <div className="w-full bg-secondary-container/20 rounded-t" style={{ height: '45%' }}></div>
              </div>
              <span className="text-[10px] text-center text-on-surface-variant">Minggu 2</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1 h-full">
              <div className="flex items-end gap-1 h-full">
                <div className="w-full bg-primary-container rounded-t" style={{ height: '85%' }}></div>
                <div className="w-full bg-secondary-container rounded-t" style={{ height: '55%' }}></div>
              </div>
              <span className="text-[10px] text-center text-on-surface-variant font-bold">Minggu 3</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1 h-full">
              <div className="flex items-end gap-1 h-full">
                <div className="w-full bg-primary-container/20 rounded-t" style={{ height: '70%' }}></div>
                <div className="w-full bg-secondary-container/20 rounded-t" style={{ height: '40%' }}></div>
              </div>
              <span className="text-[10px] text-center text-on-surface-variant">Minggu 4</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-md opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">payments</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Pendapatan</span>
              <h2 className="text-3xl font-bold text-primary mt-1">
                Rp {summary?.total_income ? summary.total_income.toLocaleString('id-ID') : '42.500.000'}
              </h2>
            </div>
            <div className="mt-md flex items-center text-xs font-semibold text-[#2d4739]">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +12% dari bulan lalu
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-md opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-error">shopping_cart_checkout</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Pengeluaran</span>
              <h2 className="text-3xl font-bold text-on-surface mt-1">
                Rp {summary?.total_expense ? summary.total_expense.toLocaleString('id-ID') : '18.200.000'}
              </h2>
            </div>
            <div className="mt-md flex items-center text-xs font-semibold text-error">
              <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
              -3% dari bulan lalu
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-md opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-secondary-container">local_cafe</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Item Terjual</span>
              <h2 className="text-3xl font-bold text-on-surface mt-1">
                {summary?.items_sold ? summary.items_sold.toLocaleString('id-ID') : '1,245'}
              </h2>
            </div>
            <div className="mt-md flex items-center text-xs font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined text-sm mr-1">inventory_2</span>
              45 jenis item
            </div>
          </div>
        </div>

        {/* Stock Opname Section */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden mt-md">
          <div className="p-lg border-b border-surface-variant bg-surface flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Audit Stok (Stock Opname)</h3>
              <p className="text-xs text-on-surface-variant">Sesuaikan stok fisik dengan sistem dan catat selisih.</p>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSubmitAudit}
                className="bg-primary text-on-primary px-md py-sm rounded-lg font-semibold text-sm hover:bg-primary-container active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Simpan Audit
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  <th className="p-md border-b border-surface-variant">Nama Item</th>
                  <th className="p-md border-b border-surface-variant w-32 text-center">Stok Sistem</th>
                  <th className="p-md border-b border-surface-variant w-40 text-center">Stok Fisik</th>
                  <th className="p-md border-b border-surface-variant w-32 text-center">Selisih</th>
                  <th className="p-md border-b border-surface-variant">Alasan Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-sm">
                {auditItems.map((item) => {
                  const physicalVal = parseFloat(item.physical_stock);
                  const diff = !isNaN(physicalVal) ? physicalVal - item.system_stock : 0;

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="p-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined">{item.icon || 'inventory_2'}</span>
                          </div>
                          <div>
                            <div className="font-medium">{item.item_name}</div>
                            <div className="text-xs text-on-surface-variant">SKU: {item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-md text-center font-medium">
                        {item.system_stock} {item.unit}
                      </td>
                      <td className="p-md">
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            value={item.physical_stock ?? ''}
                            onChange={(e) => handlePhysicalStockChange(item.id, e.target.value)}
                            className="w-20 p-1 text-center border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-surface outline-none transition-shadow text-sm"
                          />
                        </div>
                      </td>
                      <td className={`p-md text-center font-bold ${diff < 0 ? 'text-error' : diff > 0 ? 'text-secondary-container' : 'text-primary'}`}>
                        {diff > 0 ? `+${diff}` : diff} {item.unit}
                      </td>
                      <td className="p-md">
                        <select
                          value={item.reason || ''}
                          onChange={(e) => handleReasonChange(item.id, e.target.value)}
                          disabled={diff === 0}
                          className="w-full p-1 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-surface outline-none text-sm text-on-surface-variant disabled:bg-surface-container-low disabled:cursor-not-allowed"
                        >
                          {diff === 0 ? (
                            <option value="">Tidak ada selisih</option>
                          ) : (
                            <>
                              <option value="">Pilih Alasan...</option>
                              <option value="broken">Rusak (Broken)</option>
                              <option value="expired">Kedaluwarsa (Expired)</option>
                              <option value="employee">Jatah Karyawan (Employee Meal)</option>
                              <option value="missing">Hilang (Missing)</option>
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

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface shadow-lg flex justify-around items-center px-sm py-xs pb-safe md:hidden border-t border-surface-variant">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150 rounded-lg">
          <span className="material-symbols-outlined">point_of_sale</span>
          <span className="text-xs mt-1">POS</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150 rounded-lg">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link href="/manage-inventory" className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150 rounded-lg">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-xs mt-1">Inventory</span>
        </Link>
        <Link href="/reports" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150 cursor-pointer">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-xs mt-1">Reports</span>
        </Link>
      </nav>
    </div>
  );
}
