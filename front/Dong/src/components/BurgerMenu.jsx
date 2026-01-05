import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import { UserContext } from "./UserContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function BurgerMenu({ onLogout, onClose, isOpen }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  return (
    <div
      className={`fixed inset-0 z-40 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      onClick={onClose}
    >
      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 p-4 transition-transform transform flex flex-col ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        } z-50 ${isOpen ? "translate-x-0" : "translate-x-full"} duration-300`}
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "ltr" }}
      >
        <div className="flex flex-col flex-grow">
          {user && (
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p
                  className={`font-semibold ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  {user.full_name}
                </p>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <div className="mt-auto">
            <div className="mb-4">
              <LanguageSwitcher />
            </div>
            <div
              className={`flex items-center justify-between p-2 rounded-lg mb-2 `}
            >
              <label className="flex cursor-pointer gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"   
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
                <input
                  type="checkbox"
                  value="synthwave"
                  className="toggle theme-controller"
                  onChange={toggleTheme}
                  checked={theme === "dark"}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </label>
              <button
                onClick={onLogout}
                className={`flex items-center gap-3 rounded-lg ${
                  theme === "light"
                    ? "text-red-700 hover:bg-red-50"
                    : "text-red-400 hover:bg-red-900/50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("Logout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
