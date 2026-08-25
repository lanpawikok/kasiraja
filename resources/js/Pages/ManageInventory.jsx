import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function ManageInventory({ auth }) {
  return (
    <>
      <Head title="Manajemen Stok - BrewMaster Pro" />

      <div className="bg-background text-on-background font-body-md min-h-screen pt-[72px] pb-[80px] md:pb-0">
        {/* TopAppBar */}
        <header className="fixed top-0 w-full z-50 bg-surface shadow-sm flex justify-between items-center px-md h-[72px]">
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 active:opacity-80 p-sm rounded-full hidden md:block">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-headline-md font-headline-md font-bold text-primary">
              BrewMaster Pro
            </span>
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
                className="px-md py-sm rounded-full bg-primary-container text-on-primary-container text-label-bold font-label-bold"
                href={route("manage-inventory")}
              >
                Inventory
              </Link>
              <Link
                className="px-md py-sm rounded-full text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 text-label-bold"
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
          <div>
            <Link
              href={route("profile.edit")}
              className="text-on-surface-variant hover:bg-primary-container/10 transition-colors duration-200 active:opacity-80 p-sm rounded-full flex items-center"
            >
              <span className="material-symbols-outlined text-primary">
                account_circle
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-md md:p-lg space-y-lg">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
            <div>
              <h1 className="text-display-lg font-display-lg text-on-background">
                Manajemen Stok
              </h1>
              <p className="text-body-md text-on-surface-variant mt-xs">
                Pantau ketersediaan bahan baku dan input stok baru.
              </p>
            </div>
            <button className="w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg flex items-center justify-center gap-sm shadow-sm hover:bg-primary/90 transition-colors h-pos-touch-target">
              <span className="material-symbols-outlined">
                add_shopping_cart
              </span>
              <span className="text-label-bold font-label-bold">
                + Input Belanja
              </span>
            </button>
          </div>

          {/* Controls (Search & Filter) */}
          <div className="flex flex-col md:flex-row gap-md bg-surface-container-low p-sm rounded-xl shadow-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="w-full pl-xl pr-sm py-sm rounded-lg border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary text-body-md h-pos-touch-target"
                placeholder="Cari bahan baku..."
                type="text"
              />
            </div>
            <div className="flex gap-sm overflow-x-auto pb-xs md:pb-0 scrollbar-hide">
              <button className="whitespace-nowrap px-md py-xs rounded-full bg-primary-container text-on-primary-container border border-primary-container text-label-bold font-label-bold h-pos-touch-target flex items-center">
                Semua
              </button>
              <button className="whitespace-nowrap px-md py-xs rounded-full bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-variant transition-colors text-label-bold font-label-bold h-pos-touch-target flex items-center">
                Biji Kopi
              </button>
              <button className="whitespace-nowrap px-md py-xs rounded-full bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-variant transition-colors text-label-bold font-label-bold h-pos-touch-target flex items-center">
                Susu &amp; Sirup
              </button>
              <button className="whitespace-nowrap px-md py-xs rounded-full bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-variant transition-colors text-label-bold font-label-bold h-pos-touch-target flex items-center">
                Kemasan
              </button>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {/* Item Card: Low Stock */}
            <div className="bg-surface rounded-xl p-md shadow-sm border-l-4 border-error flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-sm">
                  <span className="px-sm py-xs bg-error-container text-on-error-container rounded text-label-sm font-label-sm flex items-center gap-xs">
                    <div className="w-2 h-2 rounded-full bg-error" /> Stok
                    Menipis
                  </span>
                  <span className="text-on-surface-variant text-label-sm font-label-sm bg-surface-container px-sm py-xs rounded">
                    Biji Kopi
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-background">
                  Arabica House Blend
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Kopi utama untuk espresso base.
                </p>
              </div>
              <div className="mt-md flex justify-between items-end border-t border-surface-variant pt-sm">
                <div>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Sisa Stok
                  </p>
                  <p className="text-pos-price font-pos-price text-error">
                    2.5 kg
                  </p>
                </div>
                <button className="text-primary hover:bg-primary-container/10 p-xs rounded transition-colors">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>

            {/* Item Card: Good Stock */}
            <div className="bg-surface rounded-xl p-md shadow-sm border-l-4 border-primary flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-sm">
                  <span className="px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded text-label-sm font-label-sm flex items-center gap-xs">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Stok
                    Aman
                  </span>
                  <span className="text-on-surface-variant text-label-sm font-label-sm bg-surface-container px-sm py-xs rounded">
                    Susu &amp; Sirup
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-background">
                  Susu Full Cream
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Greenfield 1L
                </p>
              </div>
              <div className="mt-md flex justify-between items-end border-t border-surface-variant pt-sm">
                <div>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Sisa Stok
                  </p>
                  <p className="text-pos-price font-pos-price text-on-background">
                    24 pcs
                  </p>
                </div>
                <button className="text-primary hover:bg-primary-container/10 p-xs rounded transition-colors">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>

            {/* Item Card: Low Stock */}
            <div className="bg-surface rounded-xl p-md shadow-sm border-l-4 border-error flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-sm">
                  <span className="px-sm py-xs bg-error-container text-on-error-container rounded text-label-sm font-label-sm flex items-center gap-xs">
                    <div className="w-2 h-2 rounded-full bg-error" /> Stok
                    Menipis
                  </span>
                  <span className="text-on-surface-variant text-label-sm font-label-sm bg-surface-container px-sm py-xs rounded">
                    Susu &amp; Sirup
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-background">
                  Bubuk Milo
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Kemasan 1kg
                </p>
              </div>
              <div className="mt-md flex justify-between items-end border-t border-surface-variant pt-sm">
                <div>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Sisa Stok
                  </p>
                  <p className="text-pos-price font-pos-price text-error">
                    1.2 kg
                  </p>
                </div>
                <button className="text-primary hover:bg-primary-container/10 p-xs rounded transition-colors">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>

            {/* Item Card: Good Stock */}
            <div className="bg-surface rounded-xl p-md shadow-sm border-l-4 border-primary flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-sm">
                  <span className="px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded text-label-sm font-label-sm flex items-center gap-xs">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Stok
                    Aman
                  </span>
                  <span className="text-on-surface-variant text-label-sm font-label-sm bg-surface-container px-sm py-xs rounded">
                    Kemasan
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-background">
                  Gelas Plastik 14oz
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Polos, tanpa tutup
                </p>
              </div>
              <div className="mt-md flex justify-between items-end border-t border-surface-variant pt-sm">
                <div>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Sisa Stok
                  </p>
                  <p className="text-pos-price font-pos-price text-on-background">
                    150 pcs
                  </p>
                </div>
                <button className="text-primary hover:bg-primary-container/10 p-xs rounded transition-colors">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* BottomNavBar (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface shadow-[0_-1px_4px_rgba(0,0,0,0.05)] flex justify-around items-center px-sm py-xs pb-safe">
          <Link
            className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150"
            href={route("dashboard")}
          >
            <span className="material-symbols-outlined">point_of_sale</span>
            <span className="text-label-sm font-label-sm mt-xs">POS</span>
          </Link>
          <a
            className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150"
            href="#"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-label-sm font-label-sm mt-xs">Orders</span>
          </a>
          <Link
            className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-md py-xs active:scale-95 transition-transform duration-150"
            href={route("manage-inventory")}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-label-sm font-label-sm mt-xs">Inventory</span>
          </Link>
          <Link
            className="flex flex-col items-center justify-center text-on-surface-variant px-md py-xs hover:bg-surface-container-high transition-all active:scale-95 duration-150"
            href={route("laporan.index")}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-label-sm font-label-sm mt-xs">Reports</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
