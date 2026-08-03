import React, { useState } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { RentalOrder } from '../../types';
import { formatDate, formatCurrency, formatInputDate } from '../../utils/formatters';
import {
  X,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Shirt,
  Phone,
  ArrowRight,
  Plus,
  Sparkles,
  History,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface SuitScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSuitCodeOrName?: string;
  onBookSuitWithDates?: (productName: string, pickupDate: string, returnDate: string) => void;
  onViewOrderDetails?: (order: RentalOrder) => void;
}

export const SuitScheduleModal: React.FC<SuitScheduleModalProps> = ({
  isOpen,
  onClose,
  initialSuitCodeOrName = '',
  onBookSuitWithDates,
  onViewOrderDetails,
}) => {
  const { orders, isBilingual } = useBoutique();

  // Extract all unique suit names/codes from existing orders
  const uniqueSuitNames: string[] = Array.from(
    new Set(orders.map((o) => o.productName.trim()).filter(Boolean))
  );

  const [searchTerm, setSearchTerm] = useState(
    initialSuitCodeOrName || (uniqueSuitNames[0] || 'ST-101 Royal Navy Blue Tuxedo')
  );

  // Date range picker to check specific date availability
  const todayStr = formatInputDate();
  const threeDaysLater = formatInputDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [checkPickup, setCheckPickup] = useState(todayStr);
  const [checkReturn, setCheckReturn] = useState(threeDaysLater);

  if (!isOpen) return null;

  // Find all orders associated with the selected/searched suit term
  const activeSearch = searchTerm.trim().toLowerCase();

  const matchingOrders = orders.filter((o) => {
    if (!activeSearch) return true;
    const pName = o.productName.toLowerCase();
    const orderCode = o.orderCode.toLowerCase();
    return pName.includes(activeSearch) || activeSearch.includes(pName) || orderCode.includes(activeSearch);
  });

  // Categorize bookings for this suit piece
  const today = new Date().toISOString().split('T')[0];

  // 1. Current Active (Rented out right now)
  const activeRental = matchingOrders.find(
    (o) => !o.depositRefunded && !o.actualReturnDate && o.pickupDate <= today && o.returnDate >= today
  );

  // 2. Upcoming Scheduled Bookings (going out in future)
  const upcomingBookings = matchingOrders
    .filter((o) => !o.depositRefunded && !o.actualReturnDate && o.pickupDate > today)
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));

  // 3. Past Returned History (was rented before)
  const pastRentals = matchingOrders
    .filter((o) => o.depositRefunded || !!o.actualReturnDate || o.returnDate < today)
    .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));

  // Date Overlap Checker for the user's selected date range
  const dateOverlapBooking = matchingOrders.find((o) => {
    // If order is active or upcoming and overlaps with [checkPickup, checkReturn]
    if (o.depositRefunded || o.actualReturnDate) return false;
    const overlap = checkPickup <= o.returnDate && checkReturn >= o.pickupDate;
    return overlap;
  });

  const isAvailableForSelectedDates = !dateOverlapBooking;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full text-slate-100 shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-extrabold">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{isBilingual ? 'સૂટ પીસ રેન્ટ શેડ્યૂલર અને હિસ્ટ્રી' : 'Suit Piece Rental Schedule & History'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isBilingual
                  ? 'જુઓ કે આ પીસ કઈ કઈ તારીખે ભાડે ગયો હતો અને ક્યારે જવાનો છે'
                  : 'Track past rental dates, current status & future scheduled bookings for any suit'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Suit Search & Select Input */}
          <div className="space-y-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-amber-400">
              🔍 {isBilingual ? 'સૂટ કોડ / સૂટનું નામ શોધો (Search Suit Piece Code):' : 'Search Suit Code / Piece Name:'}
            </label>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isBilingual ? 'લખો: ST-101, Tuxedo, Sherwani, 3-Piece...' : 'e.g. ST-101, Tuxedo, Sherwani...'}
                className="w-full bg-slate-950 text-white font-bold text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Pick Chips from existing suits in boutique */}
            {uniqueSuitNames.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">{isBilingual ? 'ઝડપી પસંદગી:' : 'Quick Select:'}</span>
                {uniqueSuitNames.slice(0, 5).map((sName) => (
                  <button
                    key={sName}
                    onClick={() => setSearchTerm(sName)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                      searchTerm.toLowerCase() === sName.toLowerCase()
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {sName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Date Availability Checker Box for this Suit */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{isBilingual ? 'તારીખ પ્રમાણે ઉપલબ્ધતા ચકાસો (Date Checker):' : 'Check Availability for Specific Dates:'}</span>
              </span>

              {isAvailableForSelectedDates ? (
                <span className="bg-emerald-950 text-emerald-400 text-[11px] font-black px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isBilingual ? 'ઉપલબ્ધ છે (Free)' : 'Available (Free)'}</span>
                </span>
              ) : (
                <span className="bg-rose-950 text-rose-300 text-[11px] font-black px-2.5 py-1 rounded-lg border border-rose-800 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isBilingual ? 'બુક થયેલ છે (Booked)' : 'Already Booked'}</span>
                </span>
              )}
            </div>

            {/* Date Pickers */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400">{isBilingual ? 'ઉપાડ:' : 'Pickup:'}</span>
                <input
                  type="date"
                  value={checkPickup}
                  onChange={(e) => setCheckPickup(e.target.value)}
                  className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none"
                />
              </div>

              <span className="text-slate-500 font-bold text-xs">➔</span>

              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400">{isBilingual ? 'પરત:' : 'Return:'}</span>
                <input
                  type="date"
                  value={checkReturn}
                  onChange={(e) => setCheckReturn(e.target.value)}
                  className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none"
                />
              </div>

              {/* Book button if available */}
              {isAvailableForSelectedDates && onBookSuitWithDates && (
                <button
                  onClick={() => {
                    onBookSuitWithDates(searchTerm, checkPickup, checkReturn);
                    onClose();
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1 ml-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isBilingual ? 'આ તારીખે બુક કરો' : 'Book for these dates'}</span>
                </button>
              )}
            </div>

            {!isAvailableForSelectedDates && dateOverlapBooking && (
              <div className="bg-rose-950/80 border border-rose-800/80 p-2.5 rounded-xl text-xs text-rose-200 flex items-center justify-between">
                <div>
                  ⚠️ <strong>{isBilingual ? 'આ તારીખે સૂટ બુક થયેલ છે:' : 'Suit is already booked during these dates by:'}</strong>{' '}
                  <span className="font-bold text-amber-300">{dateOverlapBooking.customerName}</span> ({dateOverlapBooking.customerPhone})
                  <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                    {formatDate(dateOverlapBooking.pickupDate)} ➔ {formatDate(dateOverlapBooking.returnDate)} [{dateOverlapBooking.orderCode}]
                  </div>
                </div>
                {onViewOrderDetails && (
                  <button
                    onClick={() => {
                      onViewOrderDetails(dateOverlapBooking);
                      onClose();
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-300 p-1.5 rounded-lg border border-slate-700 text-[11px] font-bold shrink-0 ml-2"
                  >
                    View Order
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SCHEDULE SECTIONS */}
          <div className="space-y-4">
            
            {/* 1. CURRENTLY OUT ON RENT */}
            <div>
              <h3 className="font-extrabold text-xs text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{isBilingual ? '1. હાલમાં ભાડે ગયેલ છે (Currently Rented Out)' : '1. Currently Rented Out'}</span>
              </h3>

              {activeRental ? (
                <div className="bg-slate-900 border border-rose-800/80 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-300 text-xs">{activeRental.orderCode}</span>
                    <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Out on Rent
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">{isBilingual ? 'ગ્રાહક:' : 'Customer:'}</span>
                      <span className="font-bold text-white text-sm">{activeRental.customerName}</span>
                      <a href={`tel:${activeRental.customerPhone}`} className="text-emerald-400 font-mono block text-xs">
                        📞 {activeRental.customerPhone}
                      </a>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">{isBilingual ? 'પરત કરવાની તારીખ:' : 'Return Due Date:'}</span>
                      <span className="font-bold text-amber-300 font-mono text-sm">{formatDate(activeRental.returnDate)}</span>
                      <span className="text-slate-400 text-[10px] font-mono block">Pickup: {formatDate(activeRental.pickupDate)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 italic">
                  {isBilingual ? 'હાલમાં આ સૂટ દુકાનમાં હાજર છે (Not currently out)' : 'Suit is currently available in shop'}
                </div>
              )}
            </div>

            {/* 2. UPCOMING BOOKING SCHEDULE */}
            <div>
              <h3 className="font-extrabold text-xs text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {isBilingual
                    ? `2. ભવિષ્યમાં ક્યારે જવાનો છે (${upcomingBookings.length} બુકિંગ્સ Scheduled)`
                    : `2. Scheduled Future Bookings (${upcomingBookings.length})`}
                </span>
              </h3>

              {upcomingBookings.length > 0 ? (
                <div className="space-y-2">
                  {upcomingBookings.map((u) => (
                    <div
                      key={u.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl flex items-center justify-between text-xs transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-300 text-[11px]">{u.orderCode}</span>
                          <span className="font-bold text-white text-xs">{u.customerName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          📞 {u.customerPhone}
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <div className="font-mono font-extrabold text-blue-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">
                          {formatDate(u.pickupDate)} ➔ {formatDate(u.returnDate)}
                        </div>
                        <div className="text-[10px] text-amber-400 font-bold">
                          Rent: {formatCurrency(u.rentAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 italic">
                  {isBilingual ? 'આગામી દિવસોમાં કોઈ બુકિંગ શિડ્યુલ નથી' : 'No upcoming bookings scheduled for this suit'}
                </div>
              )}
            </div>

            {/* 3. PAST RENTED HISTORY */}
            <div>
              <h3 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4" />
                <span>
                  {isBilingual
                    ? `3. જૂની હિસ્ટ્રી - કઈ કઈ તારીખે ભાડે ગયો હતો (${pastRentals.length} વખત Rented)`
                    : `3. Past Rental History (${pastRentals.length} times rented)`}
                </span>
              </h3>

              {pastRentals.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {pastRentals.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 text-[10px]">{p.orderCode}</span>
                          <span className="font-bold text-slate-200">{p.customerName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Phone: {p.customerPhone}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 text-[11px] block">
                          {formatDate(p.pickupDate)} ➔ {formatDate(p.returnDate)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Rent Paid: {formatCurrency(p.rentAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 italic">
                  {isBilingual ? 'કોઈ જૂની હિસ્ટ્રી નથી' : 'No past rental history recorded'}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isBilingual ? `કુલ બુકિંગ્સ: ${matchingOrders.length}` : `Total Bookings Logged: ${matchingOrders.length}`}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
          >
            {isBilingual ? 'બંધ કરો' : 'Close Tracker'}
          </button>
        </div>

      </div>
    </div>
  );
};
