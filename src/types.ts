export type RentalStatus = 'Upcoming Pickup' | 'Out on Rent' | 'Returned & Refunded' | 'Overdue';

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
  
  rentAmount: number; // ₹
  depositAmount: number; // ₹ (Security deposit taken)
  isRentPaid: boolean; // Whether rent charges paid
  depositRefunded: boolean; // Whether deposit returned back to customer on return
  
  status: RentalStatus;
  notes?: string;
  createdAt: string;
}

export type ActiveTab = 'rentals' | 'new_rental' | 'returned_history' | 'summary';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
