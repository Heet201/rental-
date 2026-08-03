import React, { useState, useEffect } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { RentalOrder } from '../../types';
import { ReturnSuitModal } from './ReturnSuitModal';
import { OrderDetailModal } from './OrderDetailModal';
import { SuitScheduleModal } from './SuitScheduleModal';
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
  CheckCircle2,
  Clock,
  Printer,
  MessageCircle,
  Shirt,
  Search,
  Plus,
  Eye,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  X,
  Filter,
  History,
} from 'lucide-react';

interface RentalListProps {
  onOpenNewRental: () => void;
  onOpenReceipt: (order: RentalOrder) => void;
  onEditOrder: (order: RentalOrder) => void;
}

type FilterTab = 'active' | 'upcoming' | 'overdue' | 'returned' | 'all';
type ViewType = 'list' | 'grid';
type SortField = 'returnDate' | 'pickupDate' | 'orderCode' | 'customerName' | 'rentAmount';

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
  } = useBoutique();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('active');
  const [viewType, setViewType] = useState<ViewType>('list'); // Default to high-density compact table list!
  const [sortField, setSortField] = useState<SortField>('returnDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Modals state
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<RentalOrder | null>(null);
  const [returningOrder, setReturningOrder] = useState<RentalOrder | null>(null);
  const [isScheduleTrackerOpen, setIsScheduleTrackerOpen] = useState(false);
  const [selectedSuitForSchedule, setSelectedSuitForSchedule] = useState('');

  useEffect(() => {
    if (activeTab === 'returned_history') {
      setActiveFilter('returned');
    } else if (activeTab === 'rentals') {
      setActiveFilter('active');
    }
  }, [activeTab]);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      (order.customerAddress && order.customerAddress.toLowerCase().includes(q)) ||
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

  // Sort logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let result = 0;
    if (sortField === 'returnDate') {
      result = a.returnDate.localeCompare(b.returnDate);
    } else if (sortField === 'pickupDate') {
      result = a.pickupDate.localeCompare(b.pickupDate);
    } else if (sortField === 'orderCode') {
      result = a.orderCode.localeCompare(b.orderCode);
    } else if (sortField === 'customerName') {
      result = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'rentAmount') {
      result = a.rentAmount - b.rentAmount;
    }
    return sortAsc ? result : -result;
  });

  // Counts
  const counts = {
    active: orders.filter((o) => !o.depositRefunded && !o.actualReturnDate).length,
    upcoming: orders.filter((o) => !o.depositRefunded && o.pickupDate > new Date().toISOString().split('T')[0]).length,
    overdue: orders.filter((o) => !o.depositRefunded && isOverdue(o.returnDate, o.actualReturnDate)).length,
    returned: orders.filter((o) => o.depositRefunded || !!o.actualReturnDate).length,
    all: orders.length,
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        
        {/* Row 1: Filter Pills & Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'active'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'ચાલુ રેન્ટ' : 'Active Rentals'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/30">
                {counts.active}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'મોડા પરત (Overdue)' : 'Overdue'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/30">
                {counts.overdue}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'આવનારી બુકિંગ' : 'Upcoming'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/30">
                {counts.upcoming}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('returned')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'returned'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'પરત મળેલ' : 'Returned'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/30">
                {counts.returned}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{isBilingual ? 'બધા ઓર્ડર' : 'All Orders'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/30">
                {counts.all}
              </span>
            </button>
          </div>

          {/* Actions: Tracker & Create Order */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedSuitForSchedule('');
                setIsScheduleTrackerOpen(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-extrabold text-xs px-3 py-2 rounded-xl shadow flex items-center gap-1.5 transition"
              title="Track rental dates & future schedule for any suit piece"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isBilingual ? 'પીસ હિસ્ટ્રી શેડ્યૂલર' : 'Suit Schedule Tracker'}</span>
              <span className="sm:hidden">{isBilingual ? 'પીસ ટ્રેકર' : 'Tracker'}</span>
            </button>

            <button
              onClick={onOpenNewRental}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isBilingual ? '+ નવો ઓર્ડર' : '+ New Order'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search, Sort & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBilingual ? 'સૂટનું નામ, કોડ કે ગ્રાહક શોધો (Search 200+ suits...)' : 'Search suit name, code, customer phone...'}
              className="w-full bg-slate-950 text-slate-100 text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-slate-400 font-bold hidden sm:inline">{isBilingual ? 'ગોઠવો:' : 'Sort:'}</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-transparent text-slate-200 text-xs px-2 py-1 font-bold focus:outline-none cursor-pointer"
              >
                <option value="returnDate" className="bg-slate-900 text-white">
                  {isBilingual ? 'પરત તારીખ (Return Date)' : 'Return Date'}
                </option>
                <option value="pickupDate" className="bg-slate-900 text-white">
                  {isBilingual ? 'ઉપાડ તારીખ (Pickup Date)' : 'Pickup Date'}
                </option>
                <option value="orderCode" className="bg-slate-900 text-white">
                  {isBilingual ? 'ઓર્ડર કોડ (Code)' : 'Order Code'}
                </option>
                <option value="customerName" className="bg-slate-900 text-white">
                  {isBilingual ? 'ગ્રાહક નામ' : 'Customer Name'}
                </option>
                <option value="rentAmount" className="bg-slate-900 text-white">
                  {isBilingual ? 'રેન્ટ રકમ' : 'Rent Amount'}
                </option>
              </select>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="p-1 hover:bg-slate-800 rounded text-amber-400 font-bold"
                title={sortAsc ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewType === 'list' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title={isBilingual ? 'યાદી મોડ (કોમ્પેક્ટ)' : 'List Register View'}
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px] font-extrabold">List</span>
              </button>

              <button
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewType === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title={isBilingual ? 'કાર્ડ મોડ' : 'Grid Cards View'}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px] font-extrabold">Cards</span>
              </button>
            </div>
          </div>

        </div>

        {/* Results Counter Bar */}
        <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between pt-1">
          <span>
            {isBilingual
              ? `કુલ ${sortedOrders.length} ઓર્ડર દર્શાવેલ છે`
              : `Showing ${sortedOrders.length} of ${orders.length} total orders`}
          </span>
          <span className="text-amber-400 font-medium">
            💡 {isBilingual ? 'ઓર્ડર પર કિલક કરી સંપૂર્ણ વિગત જુઓ' : 'Click any row to open full details'}
          </span>
        </div>

      </div>

      {/* Main List Rendering */}
      {sortedOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
          <div className="w-16 h-16 bg-slate-800 text-amber-400 rounded-2xl mx-auto flex items-center justify-center">
            <Shirt className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">
              {isBilingual ? 'કોઈ ઓર્ડર મળ્યો નથી' : 'No Rental Orders Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isBilingual
                ? 'શોધ અથવા ફિલ્ટરમાં કોઈ સૂટ રેકોર્ડ નથી.'
                : 'No orders match the selected filter or search query.'}
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
      ) : viewType === 'list' ? (
        /* COMPACT HIGH-DENSITY REGISTER LIST VIEW FOR 200+ ITEMS */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3.5"># Code</th>
                  <th className="py-3 px-3.5">{isBilingual ? 'સૂટ વિગત' : 'Suit / Product'}</th>
                  <th className="py-3 px-3.5">{isBilingual ? 'ગ્રાહક (Customer)' : 'Customer'}</th>
                  <th className="py-3 px-3.5">{isBilingual ? 'પરત તારીખ' : 'Return Date'}</th>
                  <th className="py-3 px-3.5 text-right">{isBilingual ? 'ભાડું (Rent)' : 'Rent'}</th>
                  <th className="py-3 px-3.5 text-right">{isBilingual ? 'ડિપોઝિટ' : 'Deposit'}</th>
                  <th className="py-3 px-3.5 text-center">{isBilingual ? 'સ્થિતિ' : 'Status'}</th>
                  <th className="py-3 px-3.5 text-right">{isBilingual ? 'એક્શન' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedOrders.map((order) => {
                  const badge = getRentalStatusBadge(order);
                  const isLate = isOverdue(order.returnDate, order.actualReturnDate);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderDetails(order)}
                      className="hover:bg-slate-800/80 transition cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-amber-300">
                        {order.orderCode}
                      </td>

                      {/* Suit Thumbnail & Name */}
                      <td className="py-3 px-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              order.productPhoto ||
                              'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={order.productName}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-white text-xs truncate group-hover:text-amber-300 transition">
                                {order.productName}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSuitForSchedule(order.productName);
                                  setIsScheduleTrackerOpen(true);
                                }}
                                className="text-[10px] text-amber-400 hover:text-amber-300 bg-slate-950 px-1 py-0.5 rounded border border-slate-800 transition font-bold shrink-0"
                                title="View rental dates & schedule for this piece"
                              >
                                🗓️ Schedule
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Pickup: {formatDate(order.pickupDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-200">{order.customerName}</div>
                        <a
                          href={`tel:${order.customerPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {order.customerPhone}
                        </a>
                      </td>

                      {/* Return Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className={`font-bold ${isLate ? 'text-rose-400' : 'text-slate-200'}`}>
                          {formatDate(order.returnDate)}
                        </div>
                        {isLate ? (
                          <span className="text-[9px] font-black text-rose-400 bg-rose-950 px-1 rounded border border-rose-800">
                            Overdue
                          </span>
                        ) : order.actualReturnDate ? (
                          <span className="text-[9px] font-bold text-emerald-400">
                            ✓ Returned {formatDate(order.actualReturnDate)}
                          </span>
                        ) : null}
                      </td>

                      {/* Rent */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right font-extrabold text-amber-400">
                        {formatCurrency(order.rentAmount)}
                      </td>

                      {/* Deposit */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <span
                          className={`font-extrabold ${
                            order.depositRefunded ? 'text-emerald-400 line-through opacity-70' : 'text-blue-400'
                          }`}
                        >
                          {formatCurrency(order.depositAmount)}
                        </span>
                        {order.depositRefunded && (
                          <span className="block text-[9px] text-emerald-400 font-bold">✓ Refunded</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.style}`}>
                          {isBilingual ? badge.labelGu : badge.labelEn}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!order.depositRefunded && !order.actualReturnDate && (
                            <button
                              onClick={() => setReturningOrder(order)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow"
                              title="Return Suit & Refund Deposit"
                            >
                              {isBilingual ? 'પરત લો' : 'Return'}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 p-1.5 rounded-lg border border-slate-700 transition"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenReceipt(order)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg border border-slate-700 transition"
                            title="Print Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={generateWhatsAppReminder(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 p-1.5 rounded-lg border border-emerald-800 transition"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* COMPACT GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sortedOrders.map((order) => {
            const badge = getRentalStatusBadge(order);
            const isLate = isOverdue(order.returnDate, order.actualReturnDate);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderDetails(order)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2.5 cursor-pointer shadow-md hover:shadow-xl transition group"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {order.orderCode}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.style}`}>
                    {isBilingual ? badge.labelGu : badge.labelEn}
                  </span>
                </div>

                {/* Suit & Customer Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      order.productPhoto ||
                      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={order.productName}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition">
                      {order.productName}
                    </h4>
                    <p className="text-xs text-amber-200 font-semibold truncate">{order.customerName}</p>
                    <p className="text-[11px] font-mono text-emerald-400">{order.customerPhone}</p>
                  </div>
                </div>

                {/* Return Date & Financials Summary */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      {isBilingual ? 'પરત તારીખ' : 'Return Date'}
                    </span>
                    <span className={`font-bold ${isLate ? 'text-rose-400' : 'text-slate-200'}`}>
                      {formatDate(order.returnDate)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      {isBilingual ? 'રેન્ટ / ડિપોઝિટ' : 'Rent / Deposit'}
                    </span>
                    <span className="font-extrabold text-amber-400">
                      {formatCurrency(order.rentAmount)}
                    </span>
                    <span className="text-[10px] text-blue-400 block font-bold">
                      ₹{order.depositAmount}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-1 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedOrderDetails(order)}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isBilingual ? 'સંપૂર્ણ વિગત' : 'View Info'}</span>
                  </button>

                  {!order.depositRefunded && !order.actualReturnDate && (
                    <button
                      onClick={() => setReturningOrder(order)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg transition"
                    >
                      {isBilingual ? 'પરત સૂટ' : 'Return Suit'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal when clicked */}
      {selectedOrderDetails && (
        <OrderDetailModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          onOpenReceipt={(order) => onOpenReceipt(order)}
          onEditOrder={(order) => onEditOrder(order)}
          onReturnSuit={(order) => setReturningOrder(order)}
        />
      )}

      {/* Return Suit Modal */}
      {returningOrder && (
        <ReturnSuitModal
          order={returningOrder}
          onClose={() => setReturningOrder(null)}
          onPrintReceipt={(order) => onOpenReceipt(order)}
        />
      )}

      {/* Suit Piece Schedule Tracker Modal */}
      <SuitScheduleModal
        isOpen={isScheduleTrackerOpen}
        onClose={() => setIsScheduleTrackerOpen(false)}
        initialSuitCodeOrName={selectedSuitForSchedule}
        onViewOrderDetails={(order) => setSelectedOrderDetails(order)}
        onBookSuitWithDates={(productName) => {
          onOpenNewRental();
        }}
      />
    </div>
  );
};
