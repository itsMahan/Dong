import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";
import DropdownMenu from "./DropdownMenu";

export default function Navbar({ onLogout, minimal }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logoutButtonClasses = `py-2 px-4 rounded-lg font-semibold transition-colors duration-200 cursor-pointer ${
    theme === "light"
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : "bg-gray-700 text-white hover:bg-gray-600"
  }`;

  const getDropdownOptions = () => [
    {
      label: t("Account"),
      onClick: () => {},
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: t("Settings"),
      onClick: () => {},
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: t("Logout"),
      onClick: onLogout,
      isDelete: true,
      icon: (
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
      ),
    },
  ];

  return (
    <nav
      className={`p-4 shadow-md flex justify-between items-center ${
        theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
      }`}
      style={{ direction: "ltr" }}
    >
      <h1 className="text-xl font-bold cursor-default">{t("Dong")}</h1>
      {!minimal && (
        <>
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
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
            {onLogout && <DropdownMenu options={getDropdownOptions()} />}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
          {isMenuOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/30 z-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <div
                className={`fixed top-0 right-0 h-full w-64 p-4 transition-transform transform flex flex-col ${
                  isMenuOpen ? "translate-x-0" : "translate-x-full"
                } ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <LanguageSwitcher />
                  <button onClick={() => setIsMenuOpen(false)}>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex flex-col gap-4 flex-grow">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-2 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {t("Account")}{" "}
                      <span className="text-sm text-gray-500">
                        ({t("Coming Soon")})
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-2 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.608 3.292 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {t("Settings")}{" "}
                      <span className="text-sm text-gray-500">
                        ({t("Coming Soon")})
                      </span>
                    </button>
                  </div>
                  {onLogout && (
                    <div className="mt-auto flex items-center justify-between">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLogout();
                        }}
                        className={logoutButtonClasses}
                      >
                        {t("Logout")}
                      </button>
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </nav>
  );
}
