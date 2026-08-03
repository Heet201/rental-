import React, { useState, useEffect } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { RentalOrder } from '../../types';
import { ReturnSuitModal } from './ReturnSuitModal';
import {
  formatCurrency,
  formatDate,
  generateWhatsAppReminder,
  getRentalStatusBadge,
  isOverdue,
} from '../../utils/formatters';
import {
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  MessageCircle,
  Pencil,
  Trash2,
  DollarSign,
  Shirt,
  Search,
  Plus,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface RentalListProps {
  onOpenNewRental: () => void;
  onOpenReceipt: (order: RentalOrder) => void;
  onEditOrder: (order: RentalOrder) => void;
}

type FilterTab = 'active' | 'upcoming' | 'overdue' | 'returned' | 'all';

export const RentalList: React.FC<RentalListProps> = ({
  onOpenNewRental,
  onOpenReceipt,
  onEditOrder,
}) => {
  const {
    orders,
    activeTab,
    searchQuery,
    setSearchQuery,
    isBilingual,
    returnOrderAndRefundDeposit,
    deleteOrder,
  } = useBoutique();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('active');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [returningOrder, setReturningOrder] = useState<RentalOrder | null>(null);

  useEffect(() => {
    if (activeTab === 'returned_history') {
      setActiveFilter('returned');
    } else if (activeTab === 'rentals') {
      setActiveFilter('active');
    }
  }, [activeTab]);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Search matching
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.customerAddress.toLowerCase().includes(q) ||
      order.productName.toLowerCase().includes(q) ||
      order.orderCode.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'active') {
      return !order.depositRefunded && !order.actualReturnDate;
    }
    if (activeFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      return !order.depositRefunded && order.pickupDate > today;
    }
    if (activeFilter === 'overdue') {
      return !order.depositRefunded && isOverdue(order.returnDate, order.actualReturnDate);
    }
    if (activeFilter === 'returned') {
      return order.depositRefunded || !!order.actualReturnDate;
    }
    return true; // 'all'
  });

  // Counts
  const counts = {
    active: orders.filter((o) => !o.depositRefunded && !o.actualReturnDate).length,
    upcoming: orders.filter((o) => !o.depositRefunded && o.pickupDate > new Date().toISOString().split('T')[0]).length,
    overdue: orders.filter((o) => !o.depositRefunded && isOverdue(o.returnDate, o.actualReturnDate)).length,
    returned: orders.filter((o) => o.depositRefunded || !!o.actualReturnDate).length,
    all: orders.length,
  };

  const handleReturnAndRefund = (order: RentalOrder) => {
    setReturningOrder(order);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'active'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'ચાલુ રેન્ટ' : 'Active Rentals'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/20">
                {counts.active}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'આવનારી બુકિંગ' : 'Upcoming Pickups'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/20">
                {counts.upcoming}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('overdue')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'મોડા પરત (Overdue)' : 'Overdue Returns'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/20">
                {counts.overdue}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('returned')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'returned'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'પરત મળેલ (ડિપોઝિટ રિફંડેડ)' : 'Returned & Refunded'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/20">
                {counts.returned}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'બધા રેકોર્ડ' : 'All Orders'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/20">
                {counts.all}
              </span>
            </button>
          </div>

          <button
            onClick={onOpenNewRental}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-2 rounded-xl shadow flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBilingual ? '+ નવો રેન્ટ ઓર્ડર' : '+ New Order'}</span>
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pt-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBilingual ? 'નામ, મોબાઈલ કે સૂટ શોધો...' : 'Search name, phone, suit...'}
              className="w-full bg-slate-950 text-slate-100 text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Rental Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
          <div className="w-16 h-16 bg-slate-800 text-amber-400 rounded-2xl mx-auto flex items-center justify-center">
            <Shirt className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">
              {isBilingual ? 'કોઈ રેન્ટ ઓર્ડર મળ્યો નથી' : 'No Rental Orders Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isBilingual
                ? 'આ ફિલ્ટર કે શોધમાં કોઈ સૂટ રેન્ટ રેકોર્ડ નથી.'
                : 'No suit rental orders match the selected filter or search query.'}
            </p>
          </div>
          <button
            onClick={onOpenNewRental}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBilingual ? 'નવો રેન્ટ ઓર્ડર બનાવો' : 'Create New Rental Order'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const badge = getRentalStatusBadge(order);
            const isLate = isOverdue(order.returnDate, order.actualReturnDate);

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
              >
                {/* Card Header & Photo */}
                <div>
                  <div className="relative h-48 bg-slate-950 overflow-hidden group">
                    <img
                      src={
                        order.productPhoto ||
                        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={order.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Order Code Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {order.orderCode}
                    </div>

                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-md ${badge.style}`}>
                      {isBilingual ? badge.labelGu : badge.labelEn}
                    </div>

                    {/* Photo Click Zoom */}
                    <button
                      onClick={() => setSelectedPhoto({ url: order.productPhoto, title: order.productName })}
                      className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1 backdrop-blur-sm"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{isBilingual ? 'ફોટો જુઓ' : 'View Photo'}</span>
                    </button>

                    <div className="absolute bottom-3 left-3 right-16">
                      <h3 className="font-extrabold text-base text-white truncate drop-shadow">
                        {order.productName}
                      </h3>
                    </div>
                  </div>

                  {/* Customer Info & Details */}
                  <div className="p-4 space-y-3">
                    {/* Customer Info */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-200">{order.customerName}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1 hover:bg-emerald-900/50"
                        >
                          <Phone className="w-3 h-3" />
                          {order.customerPhone}
                        </a>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.customerAddress || 'No address provided'}</span>
                      </div>
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          <span>{isBilingual ? 'ક્યારે લઈ જશે' : 'Pickup Date'}</span>
                        </div>
                        <div className="font-bold text-white text-xs mt-0.5">
                          {formatDate(order.pickupDate)}
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${
                        isLate
                          ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-200'
                      }`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${isLate ? 'text-rose-400' : 'text-amber-400'}`} />
                          <span>{isBilingual ? 'ક્યારે પરત કરશે' : 'Return Date'}</span>
                        </div>
                        <div className="font-bold text-xs mt-0.5 flex items-center justify-between">
                          <span>{formatDate(order.returnDate)}</span>
                          {isLate && (
                            <span className="text-[10px] text-rose-400 font-extrabold bg-rose-950 px-1 rounded">
                              Overdue!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Money Breakdown & Payment Mode */}
                    <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            {isBilingual ? 'રેન્ટ ભાડું (Rent)' : 'Rent Amount'}
                          </span>
                          <span className="font-extrabold text-amber-400 text-sm">
                            {formatCurrency(order.rentAmount)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            {isBilingual ? 'જમા ડિપોઝિટ (Deposit)' : 'Deposit Held'}
                          </span>
                          <span className={`font-extrabold text-sm ${
                            order.depositRefunded ? 'text-emerald-400 line-through opacity-70' : 'text-blue-400'
                          }`}>
                            {formatCurrency(order.depositAmount)}
                          </span>
                          {order.depositRefunded && (
                            <span className="text-[9px] font-bold text-emerald-400 block">
                              ✓ {isBilingual ? 'રિફંડેડ' : 'Refunded'} {order.depositRefundMode ? `(${order.depositRefundMode})` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Payment Mode & Status Bar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">{isBilingual ? 'ચૂકવણી:' : 'Payment:'}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                            💳 {order.paymentMode || 'Cash'}
                          </span>
                          <span className={`font-bold px-2 py-0.5 rounded border ${
                            order.paymentStatus === 'Paid' || order.isRentPaid
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800'
                          }`}>
                            {order.paymentStatus || (order.isRentPaid ? 'Paid' : 'Pending')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Return Log Details if suit returned */}
                    {(order.actualReturnDate || order.depositRefunded) && (
                      <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {isBilingual ? 'પરત જમા તારીખ:' : 'Actual Return Date:'}
                          </span>
                          <span className="font-extrabold text-white font-mono">
                            {formatDate(order.actualReturnDate || order.returnDate)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">
                            {isBilingual ? 'ડિપોઝિટ રિફંડ મોડ:' : 'Refund Method:'}
                          </span>
                          <span className="font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                            💳 {order.depositRefundMode || 'Cash'}
                          </span>
                        </div>
                        {order.returnNotes && (
                          <div className="text-[10px] text-emerald-200/90 italic pt-1 border-t border-emerald-900/60">
                            📝 "{order.returnNotes}"
                          </div>
                        )}
                      </div>
                    )}

                    {order.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/50">
                        "{order.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
                  {/* Primary Return Suit & Refund Deposit Button */}
                  {!order.depositRefunded && !order.actualReturnDate ? (
                    <button
                      onClick={() => handleReturnAndRefund(order)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                    >
                      <DollarSign className="w-4 h-4 stroke-[3]" />
                      <span>
                        {isBilingual
                          ? `સૂટ પરત મળ્યું - ડિપોઝિટ ${formatCurrency(order.depositAmount)} રિફંડ કરો`
                          : `Return Suit & Refund Deposit (${formatCurrency(order.depositAmount)})`}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>
                        {isBilingual
                          ? `સૂટ પરત જમા થઈ ગયું (ડિપોઝિટ ${formatCurrency(order.depositAmount)} રિફંડ કરી દીધી)`
                          : `Suit Returned & Deposit ${formatCurrency(order.depositAmount)} Refunded`}
                      </span>
                    </div>
                  )}

                  {/* Secondary Buttons */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button
                      onClick={() => onOpenReceipt(order)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-2 rounded-lg border border-slate-700 flex items-center justify-center gap-1 font-bold transition"
                      title="Print Receipt"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isBilingual ? 'રસીદ' : 'Slip'}</span>
                    </button>

                    <a
                      href={generateWhatsAppReminder(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-bold transition"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => onEditOrder(order)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                      title="Edit Rental Order"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete rental order ${order.orderCode}?`)) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-700 transition"
                      title="Delete Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Suit & Refund Deposit Modal */}
      {returningOrder && (
        <ReturnSuitModal
          order={returningOrder}
          onClose={() => setReturningOrder(null)}
          onPrintReceipt={(order) => {
            onOpenReceipt(order);
          }}
        />
      )}

      {/* Photo Preview Zoom Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 bg-slate-900 text-white p-2 rounded-full hover:bg-slate-800 border border-slate-700"
            >
              ✕
            </button>
            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="p-4 bg-slate-950 text-center font-bold text-white text-base">
              {selectedPhoto.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
