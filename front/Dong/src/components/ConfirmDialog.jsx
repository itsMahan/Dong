import React from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import { useContext } from "react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        className={`relative w-full max-w-md mx-4 rounded-lg shadow-lg overflow-hidden ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-sm"
          >
            {cancelText || t("Cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
          >
            {confirmText || t("Delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
