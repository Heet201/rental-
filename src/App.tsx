import React, { useState } from 'react';
import { BoutiqueProvider, useBoutique } from './context/BoutiqueContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RentalList } from './components/Rentals/RentalList';
import { RentalSummary } from './components/Rentals/RentalSummary';
import { NewRentalModal } from './components/Rentals/NewRentalModal';
import { OrderDetailModal } from './components/Rentals/OrderDetailModal';
import { ReturnSuitModal } from './components/Rentals/ReturnSuitModal';
import { ReceiptModal } from './components/Rentals/ReceiptModal';
import { ToastContainer } from './components/Toast';
import { RentalOrder } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useBoutique();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isNewRentalOpen, setIsNewRentalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<RentalOrder | null>(null);

  const [selectedDetailOrder, setSelectedDetailOrder] = useState<RentalOrder | null>(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<RentalOrder | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<RentalOrder | null>(null);

  const handleOpenNewRental = () => {
    setEditingOrder(null);
    setIsNewRentalOpen(true);
  };

  const handleEditOrder = (order: RentalOrder) => {
    setEditingOrder(order);
    setIsNewRentalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenNewRental={handleOpenNewRental}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          onOpenNewRental={handleOpenNewRental}
        />

        {/* Main Workspace */}
        <main className="flex-1 min-w-0">
          {(activeTab === 'rentals' || activeTab === 'returned_history') && (
            <RentalList
              onOpenNewRental={handleOpenNewRental}
              onOpenReceipt={(order) => setSelectedReceiptOrder(order)}
              onEditOrder={handleEditOrder}
            />
          )}

          {activeTab === 'summary' && <RentalSummary />}
        </main>
      </div>

      {/* Modals */}
      <NewRentalModal
        isOpen={isNewRentalOpen}
        onClose={() => {
          setIsNewRentalOpen(false);
          setEditingOrder(null);
        }}
        editOrder={editingOrder}
      />

      {selectedDetailOrder && (
        <OrderDetailModal
          order={selectedDetailOrder}
          onClose={() => setSelectedDetailOrder(null)}
          onOpenReceipt={(order) => {
            setSelectedDetailOrder(null);
            setSelectedReceiptOrder(order);
          }}
          onEditOrder={(order) => {
            setSelectedDetailOrder(null);
            handleEditOrder(order);
          }}
          onReturnSuit={(order) => {
            setSelectedDetailOrder(null);
            setSelectedReturnOrder(order);
          }}
        />
      )}

      {selectedReturnOrder && (
        <ReturnSuitModal
          order={selectedReturnOrder}
          onClose={() => setSelectedReturnOrder(null)}
        />
      )}

      <ReceiptModal
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />

      {/* Toast Manager */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <BoutiqueProvider>
      <MainAppContent />
    </BoutiqueProvider>
  );
}
