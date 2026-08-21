import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';

export default function ReceiptPreview({ order }) {
    // Tangkap data order dari backend, jika kosong pakai data dummy sementara
    const currentOrder = {
        id: order?.id || 'ORD-0842',
        date: order?.date || '24 Okt 2023, 14:30',
        cashier: order?.cashier || 'Budi',
        table: order?.table || '12',
        items: order?.items || [],
        paymentMethod: order?.paymentMethod || 'CASH',
        cashPaid: order?.cashPaid !== undefined ? order.cashPaid : 50000,
        backendSubtotal: order?.subtotal,
        backendTax: order?.tax,
        backendTotal: order?.total
    };

    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    // Gunakan perhitungan dari backend jika tersedia, atau hitung manual dari items
    const subtotal = currentOrder.backendSubtotal !== undefined 
        ? currentOrder.backendSubtotal 
        : currentOrder.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        
    const tax = currentOrder.backendTax !== undefined 
        ? currentOrder.backendTax 
        : subtotal * 0.10; // PB1 10%

    const service = subtotal * 0.05; // Service 5%

    const total = currentOrder.backendTotal !== undefined 
        ? currentOrder.backendTotal + service 
        : subtotal + tax + service;

    const change = currentOrder.cashPaid - total;
    const totalItemsCount = currentOrder.items.reduce((acc, item) => acc + item.qty, 0);

    const kitchenItems = currentOrder.items.filter(item => item.type === 'food');
    const barItems = currentOrder.items.filter(item => item.type === 'bar');

    const scrollToReceipt = (index) => {
        setActiveIndex(index);
        const container = containerRef.current;
        if (container && container.children[index]) {
            container.children[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    };

    const handleScroll = (e) => {
        const container = e.target;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth;
        let index = Math.round(scrollLeft / itemWidth);
        index = Math.max(0, Math.min(index, 3));
        setActiveIndex(index);
    };

    return (
        <div className="bg-[#f8f9ff] text-[#121c28] min-h-screen flex flex-col font-['Inter',sans-serif]">
            <header className="bg-white text-[#173124] flex justify-between items-center px-4 md:px-6 w-full h-16 shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="hover:bg-slate-100 p-2 rounded-full text-slate-700">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-bold text-[#173124]">BrewMaster Pro</h1>
                </div>
                <button onClick={() => window.print()} className="p-2 rounded-full text-slate-700 hover:bg-slate-100">
                    <span className="material-symbols-outlined">print</span>
                </button>
            </header>

            <main className="flex-grow flex flex-col overflow-hidden px-4 py-6 md:px-12">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#121c28]">Preview Struk</h2>
                        <p className="text-base text-slate-600 mt-1">
                            Order #{currentOrder.id} • {currentOrder.date}
                        </p>
                    </div>

                    <div className="hidden md:flex bg-slate-200 rounded-full p-1 gap-1">
                        {['Customer', 'Kasir', 'Dapur', 'Bar'].map((tab, idx) => (
                            <button
                                key={tab}
                                onClick={() => scrollToReceipt(idx)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                    activeIndex === idx ? 'bg-[#fe932c] text-[#663500] shadow-sm' : 'text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="flex-grow overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex gap-6 pb-8 scrollbar-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* 1. Customer Copy */}
                    <ReceiptCard active={activeIndex === 0} onClick={() => scrollToReceipt(0)}>
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-lg">BREWMASTER PRO</h3>
                            <p className="text-xs text-slate-600 mt-1">Jl. Sudirman No. 45, Jakarta</p>
                        </div>
                        <ReceiptDivider />
                        <ReceiptRow left={`No: ${currentOrder.id}`} right={currentOrder.date} />
                        <ReceiptRow left={`Kasir: ${currentOrder.cashier}`} right={`Meja: ${currentOrder.table}`} />
                        <div className="text-center font-bold text-xs mt-2 border border-slate-300 py-1 px-2 rounded-sm inline-block self-center bg-slate-50">
                            CUSTOMER COPY
                        </div>
                        <ReceiptDivider />
                        
                        <div className="flex-grow font-['Courier_New',Courier,monospace]">
                            {currentOrder.items.length > 0 ? (
                                currentOrder.items.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        <div className="flex justify-between mb-1">
                                            <span>{item.qty}x {item.name}</span>
                                            <span>{(item.price * item.qty).toLocaleString('id-ID')}</span>
                                        </div>
                                        {item.notes && (
                                            <div className="flex justify-between mb-1 text-xs text-slate-600 pl-4">
                                                <span>- {item.notes}</span>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <p className="text-center text-xs text-slate-400 my-4">Tidak ada item pesanan</p>
                            )}
                        </div>

                        <ReceiptDivider />
                        <ReceiptRow left="Subtotal" right={subtotal.toLocaleString('id-ID')} />
                        <ReceiptRow left="PB1 (10%)" right={tax.toLocaleString('id-ID')} small />
                        <ReceiptRow left="Service (5%)" right={service.toLocaleString('id-ID')} small />
                        <ReceiptDivider />
                        
                        <div className="flex justify-between font-bold text-base mb-2 font-['Courier_New',Courier,monospace]">
                            <span>TOTAL</span>
                            <span>{total.toLocaleString('id-ID')}</span>
                        </div>
                        <ReceiptRow left={currentOrder.paymentMethod} right={currentOrder.cashPaid.toLocaleString('id-ID')} small />
                        <ReceiptRow left="Kembali" right={change.toLocaleString('id-ID')} small />
                    </ReceiptCard>

                    {/* 2. Cashier Copy */}
                    <ReceiptCard active={activeIndex === 1} onClick={() => scrollToReceipt(1)}>
                        <div className="text-center mb-4"><h3 className="font-bold text-lg">BREWMASTER PRO</h3></div>
                        <ReceiptDivider />
                        <ReceiptRow left={`No: ${currentOrder.id}`} right={currentOrder.date} />
                        <ReceiptRow left={`Kasir: ${currentOrder.cashier}`} right={`Meja: ${currentOrder.table}`} />
                        <div className="text-center font-bold text-xs mt-2 border border-slate-300 py-1 px-2 rounded-sm inline-block self-center bg-slate-50">
                            CASHIER COPY
                        </div>
                        <ReceiptDivider />
                        <div className="flex-grow font-['Courier_New',Courier,monospace]">
                            <div className="flex justify-between mb-1"><span>Total Items</span><span>{totalItemsCount}</span></div>
                            <div className="border-t border-dashed border-slate-400 my-2"></div>
                            <div className="flex justify-between font-bold text-base mb-2"><span>TOTAL TAGIHAN</span><span>{total.toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between text-xs mb-1"><span>Pembayaran</span><span>{currentOrder.cashPaid.toLocaleString('id-ID')}</span></div>
                            <div className="flex justify-between text-xs mb-4"><span>Kembalian</span><span>{change.toLocaleString('id-ID')}</span></div>
                        </div>
                    </ReceiptCard>

                    {/* 3. Kitchen Copy */}
                    <ReceiptCard active={activeIndex === 2} onClick={() => scrollToReceipt(2)} bg="bg-[#f0f8ff]">
                        <div className="text-center mb-4"><h3 className="font-bold text-xl uppercase tracking-widest text-[#2d4739]">DAPUR</h3></div>
                        <div className="border-t border-dashed border-[#2d4739] my-3"></div>
                        <div className="flex justify-between font-bold text-sm mb-2 font-['Courier_New',Courier,monospace]">
                            <span className="text-lg">MEJA: {currentOrder.table}</span>
                        </div>
                        <div className="border-t border-dashed border-[#2d4739] my-3"></div>
                        <div className="flex-grow font-['Courier_New',Courier,monospace]">
                            {kitchenItems.length > 0 ? kitchenItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-start mt-4">
                                    <span className="font-bold text-lg w-6">{item.qty}x</span>
                                    <span className="font-bold text-base uppercase">{item.name}</span>
                                </div>
                            )) : <p className="text-center text-xs text-slate-500 mt-6">Tidak ada pesanan makanan.</p>}
                        </div>
                    </ReceiptCard>

                    {/* 4. Bar Copy */}
                    <ReceiptCard active={activeIndex === 3} onClick={() => scrollToReceipt(3)} bg="bg-[#fff0f5]">
                        <div className="text-center mb-4"><h3 className="font-bold text-xl uppercase tracking-widest text-[#5a3939]">BAR</h3></div>
                        <div className="border-t border-dashed border-[#5a3939] my-3"></div>
                        <div className="flex justify-between font-bold text-sm mb-2 font-['Courier_New',Courier,monospace]">
                            <span className="text-lg">MEJA: {currentOrder.table}</span>
                        </div>
                        <div className="border-t border-dashed border-[#5a3939] my-3"></div>
                        <div className="flex-grow font-['Courier_New',Courier,monospace]">
                            {barItems.length > 0 ? barItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-start mt-4">
                                    <span className="font-bold text-lg w-6">{item.qty}x</span>
                                    <span className="font-bold text-base uppercase">{item.name}</span>
                                </div>
                            )) : <p className="text-center text-xs text-slate-500 mt-6">Tidak ada pesanan minuman.</p>}
                        </div>
                    </ReceiptCard>
                </div>
            </main>
        </div>
    );
}

function ReceiptCard({ active, onClick, children, bg = 'bg-white' }) {
    return (
        <div onClick={onClick} className={`snap-center shrink-0 w-[300px] md:w-[350px] p-6 flex flex-col text-sm text-[#121c28] font-['Courier_New',Courier,monospace] ${bg} transition-all cursor-pointer ${active ? 'opacity-100 scale-100 shadow-xl ring-2 ring-[#496455]' : 'opacity-90 scale-95 shadow-md'}`}>
            {children}
        </div>
    );
}

function ReceiptDivider() { return <div className="border-t border-dashed border-slate-500 my-3"></div>; }
function ReceiptRow({ left, right, small = false }) {
    return <div className={`flex justify-between mb-1 ${small ? 'text-xs text-slate-600' : ''}`}><span>{left}</span><span>{right}</span></div>;
}