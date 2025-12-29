
import React from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, showBack = true }) => {
  return (
    <div className="bg-[#1c1c1e] border-b border-gray-800 sticky top-0 z-10 shadow-sm flex items-center px-4 h-16">
      {showBack && (
        <button 
          onClick={onBack}
          className="p-2 -ml-2 mr-2 text-white active:bg-gray-800 rounded-full transition-colors flex items-center justify-center"
          aria-label="Wróć"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      )}
      <h1 className="font-semibold text-gray-100 text-lg tracking-tight truncate">
        {title}
      </h1>
    </div>
  );
};

export default Header;
