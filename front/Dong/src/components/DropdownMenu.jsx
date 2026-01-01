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
          className={`flex items-center p-2 rounded-full cursor-pointer ${
            theme === "light"
              ? "text-gray-400 hover:bg-gray-100"
              : "text-gray-500 hover:bg-gray-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${
                  option.isDelete
                    ? `
                        ${
                          theme === "light"
                            ? "text-red-700 hover:bg-red-50"
                            : "text-red-400 hover:bg-red-900/50"
                        }`
                    : `${
                        theme === "light"
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-300 hover:bg-gray-700"
                      }`
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
