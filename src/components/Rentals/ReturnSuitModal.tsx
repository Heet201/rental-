import React, { useState } from 'react';
import { RentalOrder, PaymentMode } from '../../types';
import { useBoutique } from '../../context/BoutiqueContext';
import { formatCurrency, formatDate, generateWhatsAppReminder } from '../../utils/formatters';
import {
  X,
  RotateCcw,
  CheckCircle2,
  Banknote,
  QrCode,
  CreditCard,
  Building,
  ShieldCheck,
  MessageSquare,
  Printer,
  Shirt,
  Calendar
} from 'lucide-react';

interface ReturnSuitModalProps {
  order: RentalOrder;
  onClose: () => void;
  onPrintReceipt?: (order: RentalOrder) => void;
}

export const ReturnSuitModal: React.FC<ReturnSuitModalProps> = ({
  order,
  onClose,
  onPrintReceipt,
}) => {
  const { returnOrderAndRefundDeposit, isBilingual } = useBoutique();

  const [refundMode, setRefundMode] = useState<PaymentMode>(order.paymentMode || 'Cash');
  const [returnNotes, setReturnNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleProcessReturn = () => {
    returnOrderAndRefundDeposit(order.id, refundMode, returnNotes);
    setIsCompleted(true);
  };

  const whatsappUrl = generateWhatsAppReminder({
    ...order,
    depositRefunded: true,
    depositRefundMode: refundMode,
    actualReturnDate: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                {isBilingual ? 'સૂટ પરત જમા કરો અને ડિપોઝિટ રિફંડ કરો' : 'Return Suit & Refund Deposit'}
              </h2>
              <p className="text-xs text-slate-400">
                Order Ref: <span className="font-mono text-amber-400 font-bold">{order.orderCode}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {!isCompleted ? (
            <>
              {/* Suit & Customer Summary Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                <img
                  src={order.productPhoto || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=200'}
                  alt={order.productName}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0"
                />
                <div className="space-y-1 text-xs min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-white text-sm truncate">{order.productName}</span>
                    <span className="text-emerald-400 font-extrabold text-sm whitespace-nowrap">
                      {formatCurrency(order.depositAmount)}
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium">
                    {isBilingual ? 'ગ્રાહક:' : 'Customer:'} <strong className="text-amber-300">{order.customerName}</strong> ({order.customerPhone})
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      {formatDate(order.returnDate)}
                    </span>
                    <span>•</span>
                    <span>
                      {isBilingual ? 'ભાડું મળેલ:' : 'Rent Received:'} <strong className="text-white">{formatCurrency(order.rentAmount)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Deposit Amount Notice */}
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase block">
                      {isBilingual ? 'રિફંડ આપવાની સિક્યુરિટી ડિપોઝિટ' : 'Security Deposit To Refund'}
                    </span>
                    <span className="text-xs text-slate-300">
                      {isBilingual ? 'સૂટ જમા મળ્યા બાદ ગ્રાહકને પરત આપો' : 'Refund to customer upon returning suit'}
                    </span>
                  </div>
                </div>
                <span className="text-xl font-black text-emerald-400">
                  {formatCurrency(order.depositAmount)}
                </span>
              </div>

              {/* Refund Payment Mode Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  {isBilingual ? 'ડિપોઝિટ કઈ રીતે રિફંડ આપી? (Refund Method)' : 'Deposit Refund Method'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { mode: 'Cash' as PaymentMode, label: isBilingual ? 'રોકડ (Cash)' : 'Cash', icon: Banknote, color: 'text-emerald-400 border-emerald-500/40' },
                    { mode: 'UPI (GPay/PhonePe)' as PaymentMode, label: isBilingual ? 'UPI (GPay / PhonePe)' : 'UPI (GPay / PhonePe)', icon: QrCode, color: 'text-cyan-400 border-cyan-500/40' },
                    { mode: 'Card' as PaymentMode, label: isBilingual ? 'કાર્ડ (Card)' : 'Card', icon: CreditCard, color: 'text-indigo-400 border-indigo-500/40' },
                    { mode: 'Net Banking' as PaymentMode, label: isBilingual ? 'બેંક ટ્રાન્સફર' : 'Bank Transfer', icon: Building, color: 'text-purple-400 border-purple-500/40' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = refundMode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => setRefundMode(item.mode)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition ${
                          isSelected
                            ? `bg-slate-800 ${item.color} shadow-lg ring-1 ring-amber-500`
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Return Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  {isBilingual ? 'સૂટ સ્થિતિ / રિમાર્કસ (ખાસ નોંધ - Optional)' : 'Return Remarks / Condition (Optional)'}
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder={isBilingual ? 'ઉદા. સૂટ સારી સ્થિતિમાં પરત મળ્યું...' : 'e.g., Suit returned in clean condition...'}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Confirm Return Button */}
              <button
                type="button"
                onClick={handleProcessReturn}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>
                  {isBilingual
                    ? `✓ સૂટ પરત જમા કરો અને ₹${order.depositAmount} રિફંડ કરો`
                    : `Confirm Return & Refund ₹${order.depositAmount}`}
                </span>
              </button>
            </>
          ) : (
            /* Return Completed View */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">
                  {isBilingual ? 'સૂટ સફળતાપૂર્વક પરત જમા થયું!' : 'Suit Successfully Returned!'}
                </h3>
                <p className="text-xs text-emerald-400 font-bold">
                  {isBilingual
                    ? `₹${order.depositAmount} સિક્યુરિટી ડિપોઝિટ ${refundMode} મોડથી રિફંડ થઈ ગઈ.`
                    : `₹${order.depositAmount} deposit refunded via ${refundMode}.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>{isBilingual ? 'WhatsApp રસીદ મોકલો' : 'Send WhatsApp Confirmation'}</span>
                </a>

                {onPrintReceipt && (
                  <button
                    onClick={() => {
                      onPrintReceipt({
                        ...order,
                        depositRefunded: true,
                        depositRefundMode: refundMode,
                        actualReturnDate: new Date().toISOString().split('T')[0],
                      });
                      onClose();
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>{isBilingual ? 'રસીદ પ્રિન્ટ કરો' : 'Print Return Slip'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full text-xs text-slate-400 hover:text-white pt-2 font-bold"
              >
                {isBilingual ? 'બંધ કરો (Close)' : 'Close Window'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
