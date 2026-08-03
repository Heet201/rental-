import { RentalOrder, RentalStatus } from '../types';

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatInputDate = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const isOverdue = (returnDate: string, actualReturnDate?: string): boolean => {
  if (actualReturnDate) return false;
  if (!returnDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expected = new Date(returnDate);
  expected.setHours(0, 0, 0, 0);

  return expected < today;
};

export const getDaysOverdue = (returnDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expected = new Date(returnDate);
  expected.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - expected.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const getRentalStatusBadge = (order: RentalOrder): { labelEn: string; labelHi: string; style: string } => {
  if (order.depositRefunded || order.actualReturnDate) {
    return {
      labelEn: 'Returned & Deposit Refunded',
      labelHi: 'वापस मिला - डिपाज़िट रिफंडेड',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  }

  if (isOverdue(order.returnDate)) {
    return {
      labelEn: 'Overdue Return',
      labelHi: 'वापसी में देरी (Overdue)',
      style: 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse',
    };
  }

  const today = formatInputDate();
  if (order.pickupDate > today) {
    return {
      labelEn: 'Upcoming Pickup',
      labelHi: 'लेने आना बाकी है',
      style: 'bg-blue-50 text-blue-800 border-blue-300',
    };
  }

  return {
    labelEn: 'Out on Rent',
    labelHi: 'रेंट पर गया हुआ है',
    style: 'bg-amber-50 text-amber-800 border-amber-300',
  };
};

export const generateWhatsAppReminder = (order: RentalOrder): string => {
  const cleanPhone = order.customerPhone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let message = '';
  if (order.depositRefunded) {
    message = `नमस्ते ${order.customerName} जी,\n\nआपने ${order.productName} सुरक्षित वापस कर दिया है और आपका डिपाज़िट (₹${order.depositAmount}) रिफंड कर दिया गया है।\nहमारी दुकान पर आने के लिए धन्यवाद! 💐`;
  } else if (isOverdue(order.returnDate)) {
    message = `नमस्ते ${order.customerName} जी,\n\nआपकी रेंटेड ${order.productName} की वापसी की तारीख (${formatDate(order.returnDate)}) निकल चुकी है।\nकृपया जल्द से जल्द दुकान पर आकर उत्पाद जमा करवाएं और अपना सिक्योरिटी डिपाज़िट (₹${order.depositAmount}) वापस प्राप्त करें।\nधन्यवाद!`;
  } else {
    message = `नमस्ते ${order.customerName} जी,\n\nआपकी रेंट बुकिंग जानकारी:\n👕 प्रोडक्ट: ${order.productName}\n📅 लेने की तारीख (Pickup): ${formatDate(order.pickupDate)}\n📅 वापसी की तारीख (Return): ${formatDate(order.returnDate)}\n💰 रेंट किराया: ₹${order.rentAmount}\n🔒 जमा डिपाज़िट: ₹${order.depositAmount}\n\nकिसी भी जानकारी के लिए संपर्क करें। धन्यवाद!`;
  }

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
};
