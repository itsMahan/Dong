import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function EditGroupModal({ open, onClose, onSave, group }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  useEffect(() => {
    if (group) {
      setTitle(group.title);
      setBudget(group.total_budget ? Math.round(Number(group.total_budget)) : "");
    }
  }, [group]);

  const handleSave = () => {
    onSave({ 
      ...group, 
      title, 
      total_budget: budget ? Math.round(Number(budget)) : null 
    });
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-lg mx-4 rounded-lg shadow-xl transform transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">{t("Edit Group")}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t("Group Name")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-3 rounded-md border ${
                theme === "light"
                  ? "bg-gray-50 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  : "bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
              } transition duration-150 ease-in-out`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t("Total Budget")}</label>
            <input
              type="number"
              step="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`w-full p-3 rounded-md border ${
                theme === "light"
                  ? "bg-gray-50 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  : "bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
              } transition duration-150 ease-in-out [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]`}
              placeholder={t("Optional budget")}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              theme === "light"
                ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t("Save")}
          </button>
        </div>
      </div>
    </div>
  );
}
