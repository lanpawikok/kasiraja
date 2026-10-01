import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import PageSidebar from '@/Components/PageSidebar';

export default function ReceiptPreview({ order }) {
    const currentOrder = {
        id: order?.id || 'ORD-0842',
        date: order?.date || '24 Okt 2023, 14:30',
        customerName: order?.customerName || 'Pelanggan',
        items: order?.items || [],
        paymentMethod: order?.paymentMethod || 'CASH',
        cashPaid: order?.cashPaid !== undefined ? order.cashPaid : 50000,
        backendSubtotal: order?.subtotal,
        backendTotal: order?.total
    };

    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [printMode, setPrintMode] = useState('all'); // 'all', 'customer', 'kitchen', 'bar'
    const containerRef = useRef(null);

    const subtotal = currentOrder.backendSubtotal !== undefined
        ? currentOrder.backendSubtotal
        : currentOrder.items.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // Tanpa pajak maupun service: total struk harus sama persis dengan total di POS.
    const total = currentOrder.backendTotal !== undefined
        ? currentOrder.backendTotal
        : subtotal;

    const change = currentOrder.cashPaid - total;

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
        index = Math.max(0, Math.min(index, 2));
        setActiveIndex(index);
    };

    const handleExecutePrint = (mode) => {
        setPrintMode(mode);
        setTimeout(() => {
            window.print();
            setIsModalOpen(false);
        }, 100);
    };

    return (
        <div className="bg-[#f8f9ff] text-[#121c28] min-h-screen flex flex-col font-['Inter',sans-serif] lg:pl-72">
            <PageSidebar />
            {/* CSS khusus print yang dinamis sesuai printMode */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 20px !important;
                        align-items: center !important;
                    }
                    .printable-card {
                        display: none !important;
                    }
                    ${printMode === 'all' || printMode === 'customer' ? '.receipt-customer { display: flex !important; }' : ''}
                    ${printMode === 'all' || printMode === 'kitchen' ? '.receipt-kitchen { display: flex !important; }' : ''}
                    ${printMode === 'all' || printMode === 'bar' ? '.receipt-bar { display: flex !important; }' : ''}

                    .printable-card {
                        opacity: 1 !important;
                        transform: none !important;
                        box-shadow: none !important;
                        width: 350px !important;
                        page-break-after: always;
                    }
                }
            ` }} />

            {/* Header web */}
            <header className="hidden bg-white text-[#173124] flex justify-between items-center px-4 md:px-6 w-full h-16 shadow-sm z-10 sticky top-0 print:hidden">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        <span className="text-sm font-semibold hidden sm:inline">Dashboard</span>
                    </Link>
                    <span className="text-slate-300">|</span>
                    <h1 className="text-xl font-bold text-[#173124]">Kanakana</h1>
                </div>
            </header>

            <main className="flex-grow flex flex-col overflow-hidden px-4 pt-20 pb-6 sm:px-6 sm:pt-20 md:px-12 lg:pt-6">
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#121c28]">Preview Struk</h2>
                        <p className="text-base text-slate-600 mt-1">
                            Order #{currentOrder.id} • {currentOrder.date}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-full font-medium hover:bg-slate-300 transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                            <span>Dashboard</span>
                        </Link>

                        {/* Tombol Cetak Struk Utama */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-[#173124] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#234735] transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-xl">print</span>
                            <span>Cetak Struk</span>
                        </button>

                        <div className="hidden md:flex bg-slate-200 rounded-full p-1 gap-1">
                            {['Customer', 'Dapur', 'Bar'].map((tab, idx) => (
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
                </div>

                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="flex-grow overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex gap-6 pb-8 scrollbar-none print-container"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* 1. Customer Copy */}
                    <ReceiptCard
                        active={activeIndex === 0}
                        onClick={() => scrollToReceipt(0)}
                        className="receipt-customer"
                    >
                        <div className="text-center mb-4 flex flex-col items-center">
                            <h3 className="font-bold text-lg">Kanakana</h3>
                            <p className="text-xs text-slate-600 mt-1">Jl. Vetaran</p>

                            <img
                                src="/images/logo.png"
                                alt="Logo Kanakana"
                                className="w-24 h-24 object-contain mt-3 filter grayscale"
                            />
                        </div>
                        <ReceiptDivider />
                        <ReceiptRow left={`No: ${currentOrder.id}`} right={currentOrder.date} />
                        <ReceiptRow left={`Pelanggan: ${currentOrder.customerName}`} right={currentOrder.paymentMethod === 'DEPOSIT' ? 'Saldo' : 'Cash'} />
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
                        <ReceiptDivider />

                        <div className="flex justify-between font-bold text-base mb-2 font-['Courier_New',Courier,monospace]">
                            <span>TOTAL</span>
                            <span>{total.toLocaleString('id-ID')}</span>
                        </div>
                        <ReceiptRow left={currentOrder.paymentMethod} right={currentOrder.cashPaid.toLocaleString('id-ID')} small />
                        <ReceiptRow left="Kembali" right={change.toLocaleString('id-ID')} small />
                        {currentOrder.santriBalance !== undefined && (
                            <ReceiptRow
                                left="Saldo Santri"
                                right={Number(currentOrder.santriBalance).toLocaleString('id-ID')}
                                small
                            />
                        )}
                    </ReceiptCard>

                    {/* 2. Kitchen Copy (Dapur) */}
                    <ReceiptCard
                        active={activeIndex === 1}
                        onClick={() => scrollToReceipt(1)}
                        bg="bg-[#f0f8ff]"
                        className="receipt-kitchen"
                    >
                        <div className="text-center mb-4"><h3 className="font-bold text-xl uppercase tracking-widest text-[#2d4739]">DAPUR</h3></div>
                        <div className="border-t border-dashed border-[#2d4739] my-3"></div>
                        <div className="flex flex-col font-bold text-sm mb-2 font-['Courier_New',Courier,monospace]">
                            <span className="text-lg">{currentOrder.id}</span>
                            <span className="text-sm font-normal text-slate-700">Pelanggan: {currentOrder.customerName}</span>
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

                    {/* 3. Bar Copy */}
                    <ReceiptCard
                        active={activeIndex === 2}
                        onClick={() => scrollToReceipt(2)}
                        bg="bg-[#fff0f5]"
                        className="receipt-bar"
                    >
                        <div className="text-center mb-4"><h3 className="font-bold text-xl uppercase tracking-widest text-[#5a3939]">BAR</h3></div>
                        <div className="border-t border-dashed border-[#5a3939] my-3"></div>
                        <div className="flex flex-col font-bold text-sm mb-2 font-['Courier_New',Courier,monospace]">
                            <span className="text-lg">{currentOrder.id}</span>
                            <span className="text-sm font-normal text-slate-700">Pelanggan: {currentOrder.customerName}</span>
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

            {/* Modal / Pop-up pilihan cetak */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transition-all transform scale-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Pilih Struk yang Ingin Dicetak</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 mb-6">
                            Silakan pilih opsi pencetakan di bawah ini sesuai dengan kebutuhan operasional:
                        </p>

                        <div className="flex flex-col gap-3 mb-6">
                            <button
                                onClick={() => handleExecutePrint('all')}
                                className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-[#fe932c] hover:bg-orange-50 transition-all text-left font-medium text-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-orange-500">print</span>
                                    <div>
                                        <p className="font-semibold text-sm">Cetak Semua Struk</p>
                                        <p className="text-xs text-slate-500">Customer + Dapur + Bar</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </button>

                            <button
                                onClick={() => handleExecutePrint('customer')}
                                className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-[#fe932c] hover:bg-orange-50 transition-all text-left font-medium text-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-700">receipt_long</span>
                                    <div>
                                        <p className="font-semibold text-sm">Struk Pelanggan Sahaja</p>
                                        <p className="text-xs text-slate-500">Customer Copy</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </button>

                            <button
                                onClick={() => handleExecutePrint('kitchen')}
                                className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-[#fe932c] hover:bg-orange-50 transition-all text-left font-medium text-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-600">skillet</span>
                                    <div>
                                        <p className="font-semibold text-sm">Struk Dapur</p>
                                        <p className="text-xs text-slate-500">Hanya makanan</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </button>

                            <button
                                onClick={() => handleExecutePrint('bar')}
                                className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-[#fe932c] hover:bg-orange-50 transition-all text-left font-medium text-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-rose-500">local_bar</span>
                                    <div>
                                        <p className="font-semibold text-sm">Struk Bar</p>
                                        <p className="text-xs text-slate-500">Hanya minuman</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ReceiptCard({ active, onClick, children, bg = 'bg-white', className = '' }) {
    return (
        <div
            onClick={onClick}
            className={`snap-center shrink-0 w-[300px] md:w-[350px] p-6 flex flex-col text-sm text-[#121c28] font-['Courier_New',Courier,monospace] ${bg} transition-all cursor-pointer printable-card ${active ? 'opacity-100 scale-100 shadow-xl ring-2 ring-[#496455]' : 'opacity-90 scale-95 shadow-md'} ${className}`}
        >
            {children}
        </div>
    );
}

function ReceiptDivider() { return <div className="border-t border-dashed border-slate-500 my-3"></div>; }
function ReceiptRow({ left, right, small = false }) {
    return <div className={`flex justify-between mb-1 ${small ? 'text-xs text-slate-600' : ''}`}><span>{left}</span><span>{right || ''}</span></div>;
}
