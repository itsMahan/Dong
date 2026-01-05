import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from './ThemeContext';

export default function ChooseExpenseTypeModal({ open, onClose, onSelect, buttonRef }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - rect.height - 100, // Adjust as needed
        left: rect.left - rect.width - 100, // Adjust as needed
      });
    }
  }, [buttonRef, open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute"
        style={{ top: position.top, left: position.left }}
      >
        <div
          className="relative w-full max-w-sm mx-auto flex flex-col items-end gap-2"
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => onSelect('total')}
              className={`w-40 p-2 rounded-2xl border text-base font-semibold shadow-lg flex flex-col items-center
                ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white border-gray-700'}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{t('Total')}</span>
            </button>
            <div className={`absolute top-1/2 -translate-y-1/2 -right-2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ${theme === 'light' ? 'border-l-[10px] border-l-indigo-600' : 'border-l-[10px] border-l-gray-800'}`} />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => onSelect('individual')}
              className={`w-40 p-2 rounded-2xl border text-base font-semibold shadow-lg flex flex-col items-center
                ${theme === 'light' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white border-gray-700'}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{t('Individual')}</span>
            </button>
            <div className={`absolute top-1/2 -translate-y-1/2 -right-2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ${theme === 'light' ? 'border-l-[10px] border-l-green-600' : 'border-l-[10px] border-l-gray-800'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
