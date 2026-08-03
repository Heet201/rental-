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

export const getRentalStatusBadge = (order: RentalOrder): { labelEn: string; labelGu: string; style: string } => {
  if (order.depositRefunded || order.actualReturnDate) {
    return {
      labelEn: 'Returned & Deposit Refunded',
      labelGu: 'પરત મળેલ - ડિપોઝિટ રિફંડ',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    };
  }

  if (isOverdue(order.returnDate)) {
    return {
      labelEn: 'Overdue Return',
      labelGu: 'પરત કરવામાં મોડું (Overdue)',
      style: 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse',
    };
  }

  const today = formatInputDate();
  if (order.pickupDate > today) {
    return {
      labelEn: 'Upcoming Pickup',
      labelGu: 'પિકઅપ બાકી (Upcoming)',
      style: 'bg-blue-50 text-blue-800 border-blue-300',
    };
  }

  return {
    labelEn: 'Out on Rent',
    labelGu: 'ભાડે આપેલ (Out on Rent)',
    style: 'bg-amber-50 text-amber-800 border-amber-300',
  };
};

export const generateWhatsAppReminder = (order: RentalOrder): string => {
  const cleanPhone = order.customerPhone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let message = '';
  if (order.depositRefunded) {
    message = `નમસ્તે ${order.customerName}જી,\n\nતમે ${order.productName} સુરક્ષિત પરત કરી દીધું છે અને તમારું સિક્યુરિટી ડિપોઝિટ (₹${order.depositAmount}) રિફંડ કરી દેવામાં આવ્યું છે.\nઅમારી બુટીક પર પધારવા બદલ આભાર! 💐`;
  } else if (isOverdue(order.returnDate)) {
    message = `નમસ્તે ${order.customerName}જી,\n\nતમારા ભાડે લીધેલ ${order.productName} ની પરત કરવાની તારીખ (${formatDate(order.returnDate)}) વિતી ગઈ છે.\nમહેરબાની કરીને વહેલી તકે બુટીક પર આવીને જમા કરાવો અને તમારું સિક્યુરિટી ડિપોઝિટ (₹${order.depositAmount}) પરત મેળવો.\nઆભાર!`;
  } else {
    message = `નમસ્તે ${order.customerName}જી,\n\nતમારી રેન્ટ બુકિંગ વિગત:\n👕 પ્રોડક્ટ: ${order.productName}\n📅 પિકઅપ તારીખ: ${formatDate(order.pickupDate)}\n📅 પરત તારીખ: ${formatDate(order.returnDate)}\n💰 ભાડું: ₹${order.rentAmount}\n🔒 ડિપોઝિટ: ₹${order.depositAmount}\n\nકોઈપણ માહિતી માટે સંપર્ક કરો. આભાર!`;
  }

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
};
