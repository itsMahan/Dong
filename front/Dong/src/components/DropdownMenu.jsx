import React, { useState, useRef, useEffect, useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function DropdownMenu({ options }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useContext(ThemeContext);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={`flex items-center text-gray-400 hover:text-gray-600 focus:outline-none`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 5v.01M12 12v.01M12 19v.01M12"
            ></path>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } ring-1 ring-black ring-opacity-5 divide-y divide-gray-100`}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  option.isDelete
                    ? "text-red-700 hover:bg-red-100 hover:text-red-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
