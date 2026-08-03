import React, { useRef, useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import {
  Search,
  Globe,
  Download,
  Upload,
  RotateCcw,
  Menu,
  X,
  Database,
  Shirt,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onOpenNewRental: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
  onOpenNewRental,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    isBilingual,
    setIsBilingual,
    exportBackup,
    importBackup,
    resetToSampleData,
    orders,
  } = useBoutique();

  const [showDataModal, setShowDataModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overdueCount = orders.filter(
    (o) => !o.depositRefunded && !o.actualReturnDate && new Date(o.returnDate) < new Date()
  ).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importBackup(content);
          setShowDataModal(false);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-md shrink-0">
              <Shirt className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-100 tracking-tight leading-none">
                  SUIT SHOP RENTAL MANAGER
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Rent & Deposit
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-medium leading-tight">
                {isBilingual ? 'સૂટ રેન્ટ, ડિલિવરી અને ડિપોઝિટ ખાતાવહી' : 'Shop Rental, Pickup & Deposit Management'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isBilingual
                  ? 'ગ્રાહકનું નામ, મોબાઈલ, સૂટ કે ઓર્ડર શોધો...'
                  : 'Search name, phone, suit, order code...'
              }
              className="w-full bg-slate-900 text-slate-100 text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 placeholder-slate-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] bg-slate-800 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-950/80 px-3 py-1.5 rounded-lg border border-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {overdueCount} {isBilingual ? 'મોડા પરત' : 'Overdue'}
            </span>
          )}

          {/* New Order Button */}
          <button
            onClick={onOpenNewRental}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBilingual ? 'નવો રેન્ટ ઓર્ડર' : '+ New Rental'}</span>
          </button>

          {/* Bilingual Toggle */}
          <button
            onClick={() => setIsBilingual(!isBilingual)}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold border transition ${
              isBilingual
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Switch Language (Gujarati / English)"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBilingual ? 'ગુજરાતી' : 'EN'}</span>
          </button>

          {/* Backup */}
          <button
            onClick={() => setShowDataModal(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
            title="Database Backup / Restore"
          >
            <Database className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Backup Modal */}
      {showDataModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-slate-900">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowDataModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Database Backup & Restore</h3>
                <p className="text-xs text-slate-400">Save your shop rental orders locally.</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white">Download Shop Backup</h4>
                  <p className="text-slate-400 text-[11px]">Save backup file containing all suit rental records.</p>
                </div>
                <button
                  onClick={() => {
                    exportBackup();
                    setShowDataModal(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white">Restore Backup File</h4>
                  <p className="text-slate-400 text-[11px]">Import a saved JSON backup.</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition"
                >
                  <Upload className="w-3.5 h-3.5" /> Restore
                </button>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-rose-400">Clear All Database Records</h4>
                  <p className="text-slate-400 text-[11px]">Clear all stored suit rental orders from memory.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all stored rental records?')) {
                      resetToSampleData();
                      setShowDataModal(false);
                    }
                  }}
                  className="bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-mono">
              🔒 100% Secure Offline Shop Storage
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
