import React, { useState } from 'react';
import { RentalOrder } from '../../types';
import { useBoutique } from '../../context/BoutiqueContext';
import {
  formatCurrency,
  formatDate,
  generateWhatsAppReminder,
  getRentalStatusBadge,
  isOverdue,
} from '../../utils/formatters';
import {
  X,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Printer,
  MessageCircle,
  Pencil,
  Trash2,
  DollarSign,
  CheckCircle2,
  Shirt,
  Image as ImageIcon,
  Copy,
  Check,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: RentalOrder;
  onClose: () => void;
  onOpenReceipt: (order: RentalOrder) => void;
  onEditOrder: (order: RentalOrder) => void;
  onReturnSuit: (order: RentalOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenReceipt,
  onEditOrder,
  onReturnSuit,
}) => {
  const { isBilingual, deleteOrder } = useBoutique();
  const [showPhotoZoom, setShowPhotoZoom] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const badge = getRentalStatusBadge(order);
  const isLate = isOverdue(order.returnDate, order.actualReturnDate);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDelete = () => {
    if (confirm(isBilingual ? `ઓર્ડર ${order.orderCode} નષ્ટ કરવો છે?` : `Delete order ${order.orderCode}?`)) {
      deleteOrder(order.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-amber-300 text-sm">{order.orderCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                  title="Copy Order Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">{order.productName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${badge.style}`}>
              {isBilingual ? badge.labelGu : badge.labelEn}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Suit Photo Banner */}
          <div className="relative h-48 sm:h-56 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 group">
            <img
              src={
                order.productPhoto ||
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
              }
              alt={order.productName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            
            <button
              onClick={() => setShowPhotoZoom(true)}
              className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 backdrop-blur-sm shadow transition"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>{isBilingual ? 'ફોટો ઝૂમ જુઓ' : 'Zoom Photo'}</span>
            </button>

            <div className="absolute bottom-3 left-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                {isBilingual ? 'રેન્ટ સૂટ' : 'Rented Suit'}
              </span>
              <h3 className="font-extrabold text-lg text-white mt-1 drop-shadow">{order.productName}</h3>
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isBilingual ? 'ગ્રાહકની માહિતી' : 'Customer Details'}
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-extrabold text-white text-base block">{order.customerName}</span>
              </div>
              <a
                href={`tel:${order.customerPhone}`}
                className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.customerPhone}</span>
              </a>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-300 pt-1 border-t border-slate-900">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{order.customerAddress || (isBilingual ? 'સરનામું લખેલ નથી' : 'No address specified')}</span>
            </div>
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {isBilingual ? 'ઉપાડ તારીખ (Pickup)' : 'Pickup Date'}
              </span>
              <div className="font-bold text-white text-sm">{formatDate(order.pickupDate)}</div>
            </div>

            <div
              className={`p-3 rounded-xl border space-y-1 ${
                isLate
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  : 'bg-slate-950/80 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Clock className={`w-3.5 h-3.5 ${isLate ? 'text-rose-400' : 'text-amber-400'}`} />
                  {isBilingual ? 'પરત તારીખ (Return)' : 'Expected Return'}
                </span>
                {isLate && (
                  <span className="text-[9px] font-black text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                    Overdue
                  </span>
                )}
              </div>
              <div className="font-bold text-sm">{formatDate(order.returnDate)}</div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isBilingual ? 'ભાડું અને ડિપોઝિટની વિગત' : 'Payment & Security Deposit'}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block">
                  {isBilingual ? 'સૂટનું રેન્ટ ભાડું' : 'Rental Charge'}
                </span>
                <span className="font-black text-amber-400 text-base">
                  {formatCurrency(order.rentAmount)}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block">
                  {isBilingual ? 'સિક્યુરિટી ડિપોઝિટ' : 'Security Deposit'}
                </span>
                <span
                  className={`font-black text-base ${
                    order.depositRefunded ? 'text-emerald-400 line-through opacity-70' : 'text-blue-400'
                  }`}
                >
                  {formatCurrency(order.depositAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">{isBilingual ? 'ચૂકવણી મોડ:' : 'Payment Mode:'}</span>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30">
                  💳 {order.paymentMode || 'Cash'}
                </span>
                <span
                  className={`font-bold px-2.5 py-1 rounded-lg border ${
                    order.paymentStatus === 'Paid' || order.isRentPaid
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {order.paymentStatus || (order.isRentPaid ? 'Paid' : 'Pending')}
                </span>
              </div>
            </div>
          </div>

          {/* Actual Return History Log */}
          {(order.actualReturnDate || order.depositRefunded) && (
            <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {isBilingual ? 'પરત જમા તારીખ:' : 'Actual Return Date:'}
                </span>
                <span className="font-extrabold text-white font-mono">
                  {formatDate(order.actualReturnDate || order.returnDate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">{isBilingual ? 'ડિપોઝિટ રિફંડ પ્રકાર:' : 'Deposit Refund Method:'}</span>
                <span className="font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                  💳 {order.depositRefundMode || 'Cash'}
                </span>
              </div>
              {order.returnNotes && (
                <p className="text-[11px] text-emerald-200/90 italic pt-1 border-t border-emerald-900/60">
                  📝 "{order.returnNotes}"
                </p>
              )}
            </div>
          )}

          {order.notes && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{isBilingual ? 'નોંધ' : 'Notes'}:</span>
              <p className="text-slate-300 italic">"{order.notes}"</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5">
          {/* Main Action: Return Suit if active */}
          {!order.depositRefunded && !order.actualReturnDate ? (
            <button
              onClick={() => {
                onReturnSuit(order);
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <DollarSign className="w-4 h-4 stroke-[3]" />
              <span>
                {isBilingual
                  ? `સૂટ પરત જમા લો અને ₹${order.depositAmount} રિફંડ કરો`
                  : `Process Return & Refund Deposit (${formatCurrency(order.depositAmount)})`}
              </span>
            </button>
          ) : (
            <div className="w-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {isBilingual
                  ? `સૂટ પરત જમા થઈ ગયેલ છે (₹${order.depositAmount} રિફંડ થયેલ)`
                  : `Suit Returned & Deposit (${formatCurrency(order.depositAmount)}) Refunded`}
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => onOpenReceipt(order)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs py-2 px-3 rounded-xl border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{isBilingual ? 'પ્રિન્ટ સ્લિપ' : 'Print Slip'}</span>
            </button>

            <a
              href={generateWhatsAppReminder(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => {
                onEditOrder(order);
                onClose();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 transition"
              title="Edit Order"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="bg-slate-800 hover:bg-rose-950 text-rose-400 p-2 rounded-xl border border-slate-700 transition"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Photo Zoom Overlay Modal */}
      {showPhotoZoom && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setShowPhotoZoom(false)}
              className="absolute top-3 right-3 bg-slate-900 text-white p-2 rounded-full hover:bg-slate-800 border border-slate-700 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={
                order.productPhoto ||
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
              }
              alt={order.productName}
              className="w-full max-h-[80vh] object-contain bg-black"
            />
            <div className="p-3 bg-slate-950 text-center font-bold text-white text-sm">
              {order.productName} ({order.orderCode})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
