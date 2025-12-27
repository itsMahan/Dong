import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function AddMemberModal({ open, onClose, onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useContext(ThemeContext);

  const guardedSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (typeof onSave === "function") {
        await Promise.resolve(onSave({ name }));
      }
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("AddMemberModal submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-lg rounded-lg p-6 ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{t("Add new member")}</h3>
          <button type="button" onClick={onClose} className="text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">{t("Member name")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded border"
            placeholder={t("e.g., John Doe")}
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            type="button"
            onClick={guardedSubmit}
            disabled={submitting}
            className="p-2 bg-indigo-600 text-white rounded"
          >
            {submitting ? t("Adding...") : t("Add member")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded border"
          >
            {t("Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
