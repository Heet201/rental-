import React from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatters';
import { Shirt, DollarSign, ShieldCheck, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';

export const RentalSummary: React.FC = () => {
  const { orders, isBilingual } = useBoutique();

  // Metrics
  const activeOrders = orders.filter((o) => !o.depositRefunded && !o.actualReturnDate);
  const totalRentEarned = orders.reduce((sum, o) => sum + (o.isRentPaid ? o.rentAmount : 0), 0);
  const totalDepositHeld = activeOrders.reduce((sum, o) => sum + o.depositAmount, 0);
  const totalDepositRefunded = orders
    .filter((o) => o.depositRefunded)
    .reduce((sum, o) => sum + o.depositAmount, 0);

  const overdueCount = orders.filter(
    (o) => !o.depositRefunded && !o.actualReturnDate && isOverdue(o.returnDate, o.actualReturnDate)
  ).length;

  // Payment Methods Breakdown
  const paymentBreakdown = {
    Cash: orders.filter((o) => (o.paymentMode || 'Cash') === 'Cash' && o.isRentPaid).reduce((sum, o) => sum + o.rentAmount, 0),
    UPI: orders.filter((o) => (o.paymentMode || '').includes('UPI') && o.isRentPaid).reduce((sum, o) => sum + o.rentAmount, 0),
    Card: orders.filter((o) => o.paymentMode === 'Card' && o.isRentPaid).reduce((sum, o) => sum + o.rentAmount, 0),
    NetBanking: orders.filter((o) => o.paymentMode === 'Net Banking' && o.isRentPaid).reduce((sum, o) => sum + o.rentAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'ચાલુ રેન્ટ પર ગયેલ સૂટ' : 'Active Rented Suits'}
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeOrders.length}</span>
            <span className="text-xs text-slate-400 font-medium">Suits Out</span>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-2 font-medium">
            {isBilingual ? 'હાલમાં રેન્ટ પર ચાલી રહેલ સૂટ' : 'Currently with customers'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'સિક્યુરિટી ડિપોઝિટ જમા (Held Deposit)' : 'Security Deposit Held'}
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-400">{formatCurrency(totalDepositHeld)}</span>
          </div>
          <p className="text-[11px] text-blue-300/80 mt-2 font-medium">
            {isBilingual ? 'સૂટ પરત કરવા પર ગરાકને આપવાની છે' : 'To be refunded upon return'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'કુલ રેન્ટ ભાડાની કમાણી' : 'Total Rent Earnings'}
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalRentEarned)}</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-2 font-medium">
            {isBilingual ? 'સૂટ રેન્ટમાંથી મળેલ કુલ રકમ' : 'Net rent collection'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'મોડા પરત એલર્ટ' : 'Overdue Returns'}
            </span>
            <div className={`p-2.5 rounded-xl border ${
              overdueCount > 0
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${overdueCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {overdueCount}
            </span>
            <span className="text-xs text-slate-400">Orders</span>
          </div>
          <p className="text-[11px] text-rose-300/80 mt-2 font-medium">
            {isBilingual ? 'પરત કરવાની તારીખ વીતી ગઈ છે' : 'Return date passed'}
          </p>
        </div>
      </div>

      {/* Payment Modes Summary Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="font-extrabold text-sm text-white">
          {isBilingual ? 'પેમેન્ટ મોડ મુજબ કમાણી (Payment Method Breakdown)' : 'Rent Collection by Payment Method'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">💵 Cash Collection</span>
            <span className="text-lg font-black text-white">{formatCurrency(paymentBreakdown.Cash)}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-cyan-400 block">📲 UPI (GPay / PhonePe)</span>
            <span className="text-lg font-black text-white">{formatCurrency(paymentBreakdown.UPI)}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-indigo-400 block">💳 Card Payment</span>
            <span className="text-lg font-black text-white">{formatCurrency(paymentBreakdown.Card)}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-purple-400 block">🏛 Net Banking / Bank</span>
            <span className="text-lg font-black text-white">{formatCurrency(paymentBreakdown.NetBanking)}</span>
          </div>
        </div>
      </div>

      {/* Deposit Refund & History Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white">
              {isBilingual ? 'ડિપોઝિટ રિફંડ ચોપડો (Deposit Refunds History)' : 'Security Deposit Refunds Ledger'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBilingual
                ? `અત્યાર સુધી કુલ ${formatCurrency(totalDepositRefunded)} ડિપોઝિટ ગ્રાહકોને રિફંડ કરવામાં આવી.`
                : `Total ${formatCurrency(totalDepositRefunded)} security deposit returned to customers.`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Order Code</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Suit Product</th>
                <th className="p-3">Rent Charge</th>
                <th className="p-3">Deposit Refunded</th>
                <th className="p-3">Return Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-950/40 transition">
                  <td className="p-3 font-mono font-bold text-amber-400">{order.orderCode}</td>
                  <td className="p-3 font-bold text-white">{order.customerName}</td>
                  <td className="p-3">{order.productName}</td>
                  <td className="p-3 font-mono font-bold text-slate-300">{formatCurrency(order.rentAmount)}</td>
                  <td className="p-3 font-mono font-bold text-blue-400">{formatCurrency(order.depositAmount)}</td>
                  <td className="p-3">{formatDate(order.actualReturnDate || order.returnDate)}</td>
                  <td className="p-3">
                    {order.depositRefunded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Refunded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded-full">
                        Deposit Held
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
