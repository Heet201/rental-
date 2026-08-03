import { RentalOrder } from '../types';
import { formatInputDate } from './formatters';

const STORAGE_KEYS = {
  RENTAL_ORDERS: 'suit_shop_rentals_v2',
  LANGUAGE_MODE: 'suit_shop_bilingual_v2',
};

export const getInitialSampleData = (): RentalOrder[] => {
  const today = new Date();

  const daysAgo = (d: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    return formatInputDate(date);
  };

  const daysAhead = (d: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    return formatInputDate(date);
  };

  return [
    {
      id: 'rent-101',
      orderCode: 'RENT-101',
      customerName: 'Rahul Verma',
      customerPhone: '9876543210',
      customerAddress: 'House No 12, Main Market, Delhi',
      productName: '3-Piece Designer Navy Tuxedo Suit',
      productPhoto: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
      pickupDate: daysAgo(1),
      returnDate: daysAhead(2),
      rentAmount: 1800,
      depositAmount: 3000,
      isRentPaid: true,
      depositRefunded: false,
      status: 'Out on Rent',
      notes: 'Clean dry cleaned suit issued with coat hanger & bag.',
      createdAt: daysAgo(1),
    },
    {
      id: 'rent-102',
      orderCode: 'RENT-102',
      customerName: 'Priya Sharma',
      customerPhone: '9812345678',
      customerAddress: 'A-204, Rosewood Heights, Jaipur',
      productName: 'Bridal Heavy Maroon Velvet Suit / Lehenga',
      productPhoto: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
      pickupDate: daysAhead(2),
      returnDate: daysAhead(5),
      rentAmount: 3500,
      depositAmount: 5000,
      isRentPaid: true,
      depositRefunded: false,
      status: 'Upcoming Pickup',
      notes: 'Scheduled for cousin wedding reception.',
      createdAt: daysAgo(2),
    },
    {
      id: 'rent-103',
      orderCode: 'RENT-103',
      customerName: 'Ankit Patel',
      customerPhone: '9988776655',
      customerAddress: 'Flat 102, Sector 14, Gurgaon',
      productName: 'Royal Zari Silk Indo-Western Suit',
      productPhoto: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
      pickupDate: daysAgo(5),
      returnDate: daysAgo(1), // Overdue!
      rentAmount: 2200,
      depositAmount: 3500,
      isRentPaid: true,
      depositRefunded: false,
      status: 'Overdue',
      notes: 'Customer notified on WhatsApp for return.',
      createdAt: daysAgo(5),
    },
    {
      id: 'rent-104',
      orderCode: 'RENT-104',
      customerName: 'Neha Gupta',
      customerPhone: '9711223344',
      customerAddress: 'Model Town, Ludhiana',
      productName: 'Georgette Anarkali Suit with Dupatta',
      productPhoto: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      pickupDate: daysAgo(10),
      returnDate: daysAgo(7),
      actualReturnDate: daysAgo(7),
      rentAmount: 1500,
      depositAmount: 2000,
      isRentPaid: true,
      depositRefunded: true, // Deposit returned back!
      status: 'Returned & Refunded',
      notes: 'Returned in pristine condition. Security deposit ₹2000 refunded.',
      createdAt: daysAgo(10),
    },
  ];
};

export const loadStoredData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage`, e);
    return fallback;
  }
};

export const saveStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage`, e);
  }
};

export const exportDatabaseJSON = (orders: RentalOrder[]) => {
  const exportObject = {
    app: 'SuitShopRentalManager',
    exportedAt: new Date().toISOString(),
    data: orders,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportObject, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `suit_rentals_backup_${formatInputDate(new Date())}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export { STORAGE_KEYS };
