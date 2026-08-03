import React from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { ActiveTab } from '../types';
import { Shirt, Plus, CheckCircle2, TrendingUp, X } from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onOpenNewRental: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  onCloseMobileMenu,
  onOpenNewRental,
}) => {
  const { isBilingual, orders } = useBoutique();

  const activeCount = orders.filter((o) => !o.depositRefunded && !o.actualReturnDate).length;
  const returnedCount = orders.filter((o) => o.depositRefunded || !!o.actualReturnDate).length;

  const navItems = [
    {
      id: 'rentals' as ActiveTab,
      labelEn: 'Rentals & Orders',
      labelGu: 'રેન્ટ ઓર્ડર યાદી',
      icon: Shirt,
      badge: activeCount,
      badgeStyle: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'returned_history' as ActiveTab,
      labelEn: 'Returned History',
      labelGu: 'પરત મળેલ (રિફંડેડ)',
      icon: CheckCircle2,
      badge: returnedCount,
      badgeStyle: 'bg-emerald-500 text-slate-950 font-bold',
    },
    {
      id: 'summary' as ActiveTab,
      labelEn: 'Rent & Deposit Ledger',
      labelGu: 'ભાડું અને ડિપોઝિટ ખાતાવહી',
      icon: TrendingUp,
    },
  ];

  const handleTabClick = (id: ActiveTab) => {
    setActiveTab(id);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 text-slate-100 flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Mobile Header Close */}
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-800">
            <span className="font-extrabold text-sm text-amber-400">Navigation Menu</span>
            <button
              onClick={onCloseMobileMenu}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              onOpenNewRental();
              onCloseMobileMenu();
            }}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>{isBilingual ? 'નવો રેન્ટ ઓર્ડર બનાવો' : '+ New Rental Order'}</span>
          </button>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{isBilingual ? item.labelGu : item.labelEn}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-300">
            {isBilingual ? 'ઓફલાઈન રેન્ટ સોફ્ટવેર' : 'Offline Rental Software'}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">v2.0 • Data Saved in Browser</p>
        </div>
      </aside>
    </>
  );
};
