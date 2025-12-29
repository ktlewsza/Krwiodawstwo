
import React from 'react';

interface OptionButtonProps {
  text: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'info' | 'tile';
  disabled?: boolean;
  isLoading?: boolean;
  badge?: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({ 
  text, 
  description,
  icon,
  iconColor = 'text-white',
  onClick, 
  variant = 'primary',
  disabled = false,
  isLoading = false,
  badge
}) => {
  const getStyles = () => {
    if (disabled) return 'bg-[#1c1c1e] text-gray-600 border-gray-800 opacity-50';
    switch (variant) {
      case 'tile':
        return 'bg-[#1c1c1e] text-gray-100 border-gray-800 hover:bg-[#2c2c2e] py-5 px-6';
      case 'info':
        return 'bg-[#1c1c1e] text-blue-400 border-blue-900/30 hover:bg-blue-900/10 py-4 px-4';
      default:
        return 'bg-[#1c1c1e] text-gray-100 border-gray-800 hover:border-[#ff4d4d]/30 hover:bg-[#2c2c2e] py-4 px-4';
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`w-full flex items-center border rounded-2xl transition-all duration-200 text-left focus:outline-none ${getStyles()}`}
    >
      {icon && <div className={`mr-4 ${iconColor}`}>{icon}</div>}
      <div className="flex-grow">
        <div className="flex items-center">
          <span className={`block font-semibold ${variant === 'tile' ? 'text-base' : 'text-sm'} tracking-tight`}>
            {isLoading ? 'Przetwarzanie...' : text}
          </span>
          {badge && (
            <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {badge}
            </span>
          )}
        </div>
        {description && <span className="block text-xs text-gray-500 mt-1 font-normal">{description}</span>}
      </div>
      <svg className="w-5 h-5 ml-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default OptionButton;
