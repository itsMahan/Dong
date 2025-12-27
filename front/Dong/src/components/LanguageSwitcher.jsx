import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

function LanguageSwitcher() {
  const { i18n: i18n_hook } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = i18n.dir(lng);
  };

  return (
    <div className="flex items-center">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded-l-md text-sm font-medium ${
          i18n.language === "en"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("fa")}
        className={`px-3 py-1 rounded-r-md text-sm font-medium ${
          i18n.language === "fa"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
        }`}
      >
        FA
      </button>
    </div>
  );
}

export default LanguageSwitcher;
