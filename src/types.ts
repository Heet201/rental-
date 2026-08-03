export type RentalStatus = 'Upcoming Pickup' | 'Out on Rent' | 'Returned & Refunded' | 'Overdue';

export type PaymentMode = 'Cash' | 'UPI (GPay/PhonePe)' | 'Card' | 'Net Banking' | 'Other';
export type PaymentStatus = 'Paid' | 'Partial / Deposit Only' | 'Pending / Pay on Pickup';

export interface RentalOrder {
  id: string;
  orderCode: string; // e.g. RENT-1001
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  
  productName: string; // e.g. "Designer Bridal Suit / Lehenga", "3-Piece Tuxedo Suit"
  productPhoto: string; // photo URL or uploaded image base64
  
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  actualReturnDate?: string; // YYYY-MM-DD
  returnNotes?: string; // Optional notes upon return (e.g. suit condition)
  
  rentAmount: number; // ₹
  depositAmount: number; // ₹ (Security deposit taken)
  isRentPaid: boolean; // Whether rent charges paid
  paymentMode?: PaymentMode; // Payment method used by customer (Cash, UPI, Card, etc.)
  paymentStatus?: PaymentStatus; // Paid, Pending, Partial
  depositRefunded: boolean; // Whether deposit returned back to customer on return
  depositRefundMode?: PaymentMode; // Cash, UPI, etc when deposit was refunded
  
  status: RentalStatus;
  notes?: string;
  createdAt: string;
}

export type ActiveTab = 'rentals' | 'returned_history' | 'summary';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
