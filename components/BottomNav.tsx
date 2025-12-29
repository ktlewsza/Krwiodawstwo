
import React from 'react';

type Tab = 'Documents' | 'Services' | 'QRCode' | 'More';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    {
      id: 'Documents' as Tab,
      label: 'Dokumenty',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 9h16M4 14h16" />
        </svg>
      ),
    },
    {
      id: 'Services' as Tab,
      label: 'Usługi',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      id: 'QRCode' as Tab,
      label: 'Kod QR',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M12 7v10M7 12h10" />
        </svg>
      ),
    },
    {
      id: 'More' as Tab,
      label: 'Więcej',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-[#1c1c1e] border-t border-gray-800 flex justify-around items-center pt-3 pb-6 px-1 safe-area-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive ? 'text-[#3498db]' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
