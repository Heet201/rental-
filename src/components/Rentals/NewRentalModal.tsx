import React, { useState } from 'react';
import { useBoutique } from '../../context/BoutiqueContext';
import { RentalOrder } from '../../types';
import { formatInputDate } from '../../utils/formatters';
import {
  X,
  Upload,
  Calendar,
  DollarSign,
  User,
  Phone,
  MapPin,
  Shirt,
  Image as ImageIcon,
  Check,
  Camera,
} from 'lucide-react';

interface NewRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editOrder?: RentalOrder | null;
}

const SAMPLE_SUIT_PHOTOS = [
  {
    name: 'Tuxedo Suit',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Bridal Velvet Suit',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Indo-Western Suit',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Silk Anarkali Suit',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
];

export const NewRentalModal: React.FC<NewRentalModalProps> = ({
  isOpen,
  onClose,
  editOrder,
}) => {
  const { addOrder, updateOrder, isBilingual } = useBoutique();

  const todayStr = formatInputDate();
  const threeDaysLater = formatInputDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

  const [customerName, setCustomerName] = useState(editOrder?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(editOrder?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(editOrder?.customerAddress || '');

  const [productName, setProductName] = useState(editOrder?.productName || '');
  const [productPhoto, setProductPhoto] = useState(
    editOrder?.productPhoto || SAMPLE_SUIT_PHOTOS[0].url
  );

  const [pickupDate, setPickupDate] = useState(editOrder?.pickupDate || todayStr);
  const [returnDate, setReturnDate] = useState(editOrder?.returnDate || threeDaysLater);

  const [rentAmount, setRentAmount] = useState<number | string>(editOrder?.rentAmount || 1500);
  const [depositAmount, setDepositAmount] = useState<number | string>(
    editOrder?.depositAmount || 2000
  );

  const [isRentPaid, setIsRentPaid] = useState<boolean>(editOrder?.isRentPaid ?? true);
  const [notes, setNotes] = useState<string>(editOrder?.notes || '');

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert(isBilingual ? 'कृपया ग्राहक का नाम दर्ज करें' : 'Please enter customer name');
      return;
    }
    if (!customerPhone.trim()) {
      alert(isBilingual ? 'कृपया मोबाइल नंबर दर्ज करें' : 'Please enter mobile number');
      return;
    }
    if (!productName.trim()) {
      alert(isBilingual ? 'कृपया सूट या प्रोडक्ट का नाम लिखें' : 'Please enter suit / product name');
      return;
    }

    const numericRent = Number(rentAmount) || 0;
    const numericDeposit = Number(depositAmount) || 0;

    if (editOrder) {
      updateOrder(editOrder.id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        productName: productName.trim(),
        productPhoto,
        pickupDate,
        returnDate,
        rentAmount: numericRent,
        depositAmount: numericDeposit,
        isRentPaid,
        notes: notes.trim(),
      });
    } else {
      addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        productName: productName.trim(),
        productPhoto,
        pickupDate,
        returnDate,
        rentAmount: numericRent,
        depositAmount: numericDeposit,
        isRentPaid,
        depositRefunded: false,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full text-slate-100 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">
                {editOrder
                  ? isBilingual
                    ? 'रेंट आर्डर संपादित करें'
                    : 'Edit Rental Order'
                  : isBilingual
                  ? 'नया रेंट आर्डर जोड़ें'
                  : 'New Rental Order'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBilingual
                  ? 'ग्राहक विवरण, सूट की फोटो, लेने/देने की तारीख एवं सुरक्षा डिपाज़िट'
                  : 'Customer info, suit photo, pickup/return dates & deposit amount'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{isBilingual ? '1. ग्राहक की जानकारी (Customer Details)' : '1. Customer Information'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBilingual ? 'ग्राहक का नाम (Customer Name) *' : 'Customer Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isBilingual ? 'उदा. राहुल शर्मा' : 'e.g. Rahul Sharma'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBilingual ? 'मोबाइल नंबर (Mobile Number) *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isBilingual ? 'पता (Address)' : 'Address'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <textarea
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={isBilingual ? 'ग्राहक का पूरा पता...' : 'Full delivery or shop address...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 2: Product & Suit Photo */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Shirt className="w-4 h-4" />
              <span>{isBilingual ? '2. सूट / प्रोडक्ट एवं फोटो (Suit Name & Photo)' : '2. Suit Details & Photo'}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isBilingual ? 'सूट / प्रोडक्ट का नाम (Suit/Product Name) *' : 'Suit / Product Name *'}
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={isBilingual ? 'उदा. 3-Piece Navy Tuxedo Suit, Bridal Lehenga' : 'e.g. 3-Piece Tuxedo Suit'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Photo Selection / Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                {isBilingual ? 'सूट की फोटो चुनें या अपलोड करें (Suit Photo)' : 'Suit Photo (Select or Upload)'}
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                {/* Image Preview */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative group">
                  <img src={productPhoto} alt="Suit Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Upload & Samples */}
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-2">
                    <label className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isBilingual ? 'फोटो अपलोड / कैमरे से खींचें' : 'Upload / Snap Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {isBilingual
                      ? 'या नीचे दिए गए सैंपल सूट फ़ोटो में से चुनें:'
                      : 'Or select from sample suit templates:'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_SUIT_PHOTOS.map((sample) => (
                      <button
                        type="button"
                        key={sample.name}
                        onClick={() => setProductPhoto(sample.url)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border transition flex items-center gap-1 ${
                          productPhoto === sample.url
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {productPhoto === sample.url && <Check className="w-3 h-3 text-amber-400" />}
                        <span>{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 3: Dates & Money */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{isBilingual ? '3. तारीखें एवं सिक्योरिटी डिपाज़िट (Dates & Deposit)' : '3. Dates & Security Deposit'}</span>
            </h3>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBilingual ? 'कब लेने आएगा (Pickup Date) *' : 'Pickup Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBilingual ? 'कब देने आएगा (Return Date) *' : 'Return Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Money Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">
                  {isBilingual ? 'रेंट किराया (Rent Amount ₹) *' : 'Rent Amount (₹) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-extrabold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-400 mb-1">
                  {isBilingual ? 'सुरक्षा डिपाज़िट (Deposit ₹) *' : 'Security Deposit (₹) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="2000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-extrabold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isBilingual ? 'सूट वापस करने पर यह डिपाज़िट रिफंड किया जाएगा।' : 'Refunded back when suit is returned.'}
                </p>
              </div>
            </div>

            {/* Rent Paid Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isRentPaidCheck"
                checked={isRentPaid}
                onChange={(e) => setIsRentPaid(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <label htmlFor="isRentPaidCheck" className="text-xs font-bold text-slate-200 cursor-pointer">
                {isBilingual
                  ? 'रेंट किराया प्राप्त हो गया है (Rent collected)'
                  : 'Rent charges collected from customer'}
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isBilingual ? 'अतिरिक्त टिप्पणी (Notes / Accessories)' : 'Notes / Accessories'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isBilingual ? 'उदा. कवर बैग व हैंगर साथ दिया गया है' : 'e.g. Includes suit cover bag & hanger'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 transition"
            >
              {isBilingual ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {editOrder
                  ? isBilingual
                    ? 'अपडेट करें'
                    : 'Update Order'
                  : isBilingual
                  ? 'रेंट आर्डर सेव करें'
                  : 'Save Rental Order'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
