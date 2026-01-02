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
    <div className="flex flex-col gap-2">
      <button
        onClick={() => changeLanguage("en")}
        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 rounded-lg ${
          i18n_hook.language === "en"
            ? "bg-indigo-600 text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <span className="fi fi-gb"></span>
        English
      </button>
      <button
        onClick={() => changeLanguage("fa")}
        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 rounded-lg ${
          i18n_hook.language === "fa"
            ? "bg-indigo-600 text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <span className="fi fi-ir"></span>
        فارسی
      </button>
    </div>
  );
}

export default LanguageSwitcher;
