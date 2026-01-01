import React from 'react';
import { useTranslation } from 'react-i18next';

function SettlementDropdown({ onToggle, showSettlement, theme }) {
  const { t } = useTranslation();
  const handleToggle = () => {
    onToggle(!showSettlement);
  };

  return (
    <div className="my-4">
      <button
        onClick={handleToggle}
        className={`w-full flex justify-between items-center px-4 py-2 text-sm font-medium rounded-lg cursor-pointer ${
          theme === 'light'
            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        <span>{showSettlement ? t('Hide Settlement Details') : t('Show Settlement Details')}</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            showSettlement ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
    </div>
  );
}

export default SettlementDropdown;
