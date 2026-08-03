import React from 'react';
import { RentalOrder } from '../../types';
import { useBoutique } from '../../context/BoutiqueContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { X, Printer, Shirt, Phone, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  order: RentalOrder | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { isBilingual } = useBoutique();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative my-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{isBilingual ? 'रेंट रसीद स्लिप' : 'Rental Receipt Slip'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBilingual ? 'प्रिंट करें' : 'Print Receipt'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-4">
          {/* Shop Header */}
          <div className="text-center border-b pb-4 border-slate-200">
            <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-2xl mx-auto flex items-center justify-center font-black mb-2 shadow">
              <Shirt className="w-6 h-6" />
            </div>
            <h2 className="font-black text-xl text-slate-900 tracking-tight uppercase">
              ROYAL SUIT & GARMENT RENTALS
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {isBilingual ? 'સૂટ રેન્ટ, ડિલિવરી અને ડિપોઝિટ સ્લિપ' : 'Suit Rental & Deposit Receipt'}
            </p>
            <div className="mt-2 inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-800">
              Receipt No: <span className="text-amber-700">{order.orderCode}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-500 uppercase">{isBilingual ? 'ગ્રાહકનું નામ' : 'Customer Name'}</span>
              <span className="font-extrabold text-sm text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-500 uppercase">{isBilingual ? 'મોબાઈલ નંબર' : 'Mobile'}</span>
              <span className="font-mono font-bold text-slate-800">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-500 uppercase">{isBilingual ? 'સરનામું' : 'Address'}</span>
              <span className="font-medium text-slate-800 text-right max-w-[200px]">{order.customerAddress || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-500 uppercase">{isBilingual ? 'ચૂકવણીની રીત (Payment Method)' : 'Payment Method'}</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {order.paymentMode || 'Cash'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-500 uppercase">{isBilingual ? 'પેમેન્ટ સ્થિતિ' : 'Payment Status'}</span>
              <span className={`font-bold px-2 py-0.5 rounded border ${
                order.paymentStatus === 'Paid' || order.isRentPaid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {order.paymentStatus || (order.isRentPaid ? 'Paid' : 'Pending')}
              </span>
            </div>
          </div>

          {/* Suit Photo & Item Details */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <img
              src={order.productPhoto}
              alt={order.productName}
              className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
            />
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">{order.productName}</h3>
              {order.notes && <p className="text-[11px] text-slate-500 italic">"{order.notes}"</p>}
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                <span>{isBilingual ? 'ક્યારે લઈ જશે (Pickup)' : 'Pickup Date'}</span>
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{formatDate(order.pickupDate)}</div>
            </div>

            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-600" />
                <span>{isBilingual ? 'ક્યારે પરત કરશે (Return)' : 'Return Date'}</span>
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{formatDate(order.returnDate)}</div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">Particulars</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium">Rent Charges (રેન્ટ ભાડું)</td>
                  <td className="p-3 text-right font-extrabold text-slate-900">{formatCurrency(order.rentAmount)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Security Deposit Held (સિક્યુરિટી ડિપોઝિટ)</td>
                  <td className="p-3 text-right font-extrabold text-blue-700">{formatCurrency(order.depositAmount)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-900 text-white font-extrabold">
                <tr>
                  <td className="p-3 text-amber-300">{isBilingual ? 'કુલ જમા રકમ (Total Collected)' : 'Total Collected'}</td>
                  <td className="p-3 text-right text-amber-300 text-sm font-mono">
                    {formatCurrency(order.rentAmount + order.depositAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deposit Status Notice */}
          <div className={`p-3 rounded-2xl border text-xs text-center font-bold ${
            order.depositRefunded
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            {order.depositRefunded ? (
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isBilingual
                    ? `સિક્યુરિટી ડિપોઝિટ ${formatCurrency(order.depositAmount)} ગ્રાહકને સફળતાપૂર્વક રિફંડ કરી દેવામાં આવી છે.`
                    : `Security deposit of ${formatCurrency(order.depositAmount)} has been refunded.`}
                </span>
              </div>
            ) : (
              <span>
                {isBilingual
                  ? `📌 નોંધ: સિક્યુરિટી ડિપોઝિટ ${formatCurrency(order.depositAmount)} સૂટ યોગ્ય સ્થિતિમાં પરત મળ્યે પૂરેપૂરી પાછી અપાશે.`
                  : `📌 Note: Security deposit ${formatCurrency(order.depositAmount)} is 100% refundable upon return.`}
              </span>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-6 flex justify-between items-end text-xs text-slate-500 font-medium">
            <div className="text-center">
              <div className="border-b border-slate-300 w-28 mb-1" />
              <span>Customer Sign</span>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-300 w-28 mb-1" />
              <span>Shop Owner Sign</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
