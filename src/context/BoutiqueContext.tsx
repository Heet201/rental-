import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActiveTab, RentalOrder, ToastMessage, PaymentMode } from '../types';
import {
  exportDatabaseJSON,
  getInitialSampleData,
  loadStoredData,
  saveStoredData,
  STORAGE_KEYS,
} from '../utils/storage';
import { formatInputDate } from '../utils/formatters';

interface RentalContextType {
  orders: RentalOrder[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  isBilingual: boolean;
  setIsBilingual: (b: boolean) => void;

  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Order actions
  addOrder: (orderData: Omit<RentalOrder, 'id' | 'orderCode' | 'createdAt' | 'status'>) => void;
  updateOrder: (id: string, data: Partial<RentalOrder>) => void;
  deleteOrder: (id: string) => void;
  returnOrderAndRefundDeposit: (id: string, refundMode?: PaymentMode) => void;

  // Utilities
  resetToSampleData: () => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
}

const BoutiqueContext = createContext<RentalContextType | undefined>(undefined);

export const BoutiqueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialData = getInitialSampleData();

  const [orders, setOrders] = useState<RentalOrder[]>(() =>
    loadStoredData(STORAGE_KEYS.RENTAL_ORDERS, initialData)
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('rentals');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBilingual, setIsBilingual] = useState<boolean>(() =>
    loadStoredData(STORAGE_KEYS.LANGUAGE_MODE, true)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist data
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.RENTAL_ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LANGUAGE_MODE, isBilingual);
  }, [isBilingual]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addOrder = (orderData: Omit<RentalOrder, 'id' | 'orderCode' | 'createdAt' | 'status'>) => {
    const orderCode = `RENT-${Math.floor(100 + Math.random() * 900)}`;
    const today = formatInputDate();

    let initialStatus: RentalOrder['status'] = 'Out on Rent';
    if (orderData.pickupDate > today) {
      initialStatus = 'Upcoming Pickup';
    }

    const newOrder: RentalOrder = {
      ...orderData,
      id: 'rent-' + Date.now(),
      orderCode,
      status: initialStatus,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(
      'Rental Order Created / आर्डर बन गया',
      `Order ${orderCode} for ${newOrder.customerName} saved! Rent: ₹${newOrder.rentAmount}, Deposit: ₹${newOrder.depositAmount}`
    );
  };

  const updateOrder = (id: string, data: Partial<RentalOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...data } : o))
    );
    showToast('Order Updated', 'Rental order saved successfully.');
  };

  const deleteOrder = (id: string) => {
    const target = orders.find((o) => o.id === id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    showToast('Order Deleted', `Order ${target?.orderCode || ''} removed.`, 'info');
  };

  const returnOrderAndRefundDeposit = (id: string, refundMode?: PaymentMode) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const today = formatInputDate();

    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              actualReturnDate: today,
              depositRefunded: true,
              depositRefundMode: refundMode || 'Cash',
              status: 'Returned & Refunded',
            }
          : o
      )
    );

    showToast(
      'Suit Returned & Deposit Refunded / सूट मिला और डिपाज़िट वापस किया',
      `Deposit ₹${target.depositAmount} refunded via ${refundMode || 'Cash'} to ${target.customerName}. Order ${target.orderCode} completed!`
    );
  };

  const resetToSampleData = () => {
    setOrders([]);
    showToast('Database Cleared / डेटा मिटा दिया गया', 'All rental records removed.');
  };

  const exportBackup = () => {
    exportDatabaseJSON(orders);
    showToast('Backup Downloaded', 'Rental records saved as JSON file.');
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.data)) {
        setOrders(parsed.data);
        showToast('Backup Restored', 'All rental orders imported!');
        return true;
      } else if (Array.isArray(parsed)) {
        setOrders(parsed);
        showToast('Backup Restored', 'All rental orders imported!');
        return true;
      }
      throw new Error('Invalid format');
    } catch {
      showToast('Import Error', 'Please select a valid backup JSON file.', 'error');
      return false;
    }
  };

  return (
    <BoutiqueContext.Provider
      value={{
        orders,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isBilingual,
        setIsBilingual,
        toasts,
        showToast,
        dismissToast,
        addOrder,
        updateOrder,
        deleteOrder,
        returnOrderAndRefundDeposit,
        resetToSampleData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </BoutiqueContext.Provider>
  );
};

export const useBoutique = () => {
  const context = useContext(BoutiqueContext);
  if (!context) {
    throw new Error('useBoutique must be used within a BoutiqueProvider');
  }
  return context;
};
