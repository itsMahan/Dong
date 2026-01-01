import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function EditGroupModal({ open, onClose, onSave, group }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  useEffect(() => {
    if (group) {
      setTitle(group.title);
    }
  }, [group]);

  const handleSave = () => {
    onSave({ ...group, title });
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
        className={`relative w-full max-w-lg mx-auto rounded-lg shadow-xl transform transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{t("Edit Group Name")}</h3>
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
        <div className="p-4">
          <label className="block text-sm font-medium mb-1">{t("Group Name")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500"
          />
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {t("Save")}
          </button>
        </div>
      </div>
    </div>
  );
}
