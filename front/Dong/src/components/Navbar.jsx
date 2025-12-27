import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar({ onLogout }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const logoutButtonClasses = `py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
    theme === "light"
      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
      : "bg-gray-700 text-white hover:bg-gray-600"
  }`;

  return (
    <nav
      className={`p-4 shadow-md flex justify-between items-center ${
        theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
      }`}
      style={{ direction: "ltr" }}
    >
      <h1 className="text-xl font-bold cursor-default">{t("Dong")}</h1>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            theme === "light" ? "bg-gray-200" : "bg-gray-700"
          } cursor-pointer`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {onLogout && (
          <button onClick={onLogout} className={logoutButtonClasses}>
            {t("Logout")}
          </button>
        )}
      </div>
    </nav>
  );
}