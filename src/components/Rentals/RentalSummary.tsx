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

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'सक्रिय रेंट पर गए सूट' : 'Active Rented Suits'}
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
            {isBilingual ? 'वर्तमान में रेंट पर चल रहे सूट' : 'Currently with customers'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'सुरक्षा डिपाज़िट जमा (Held Deposit)' : 'Security Deposit Held'}
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-400">{formatCurrency(totalDepositHeld)}</span>
          </div>
          <p className="text-[11px] text-blue-300/80 mt-2 font-medium">
            {isBilingual ? 'सूट वापसी पर ग्राहक को लौटाना है' : 'To be refunded upon return'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'कुल रेंट किराया कमाई' : 'Total Rent Earnings'}
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalRentEarned)}</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-2 font-medium">
            {isBilingual ? 'सूट रेंट से प्राप्त कुल राशि' : 'Net rent collection'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isBilingual ? 'लेट वापसी अलर्ट' : 'Overdue Returns'}
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
            {isBilingual ? 'वापसी की तारीख निकल चुकी है' : 'Return date passed'}
          </p>
        </div>
      </div>

      {/* Deposit Refund & History Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white">
              {isBilingual ? 'डिपाज़िट रिफंड बहीखाता (Deposit Refunds History)' : 'Security Deposit Refunds Ledger'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBilingual
                ? `अब तक कुल ${formatCurrency(totalDepositRefunded)} डिपाज़िट ग्राहकों को रिफंड किया गया।`
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
