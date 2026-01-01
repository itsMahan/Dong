import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import ExpenseContext from "../components/ExpenseContext";
import { ThemeContext } from "./ThemeContext";

export default function AddExpenseModal({
  open,
  onClose,
  onSave,
  members = [],
  expenseToEdit, // New prop for editing
  groupId,
}) {
  const { t } = useTranslation();

  const getPayerId = () => {
    if (expenseToEdit && typeof expenseToEdit.paid_by === "string") {
      const payerName = expenseToEdit.paid_by.split(" ")[0];
      const payerMember = members.find((m) => m.name === payerName);
      return payerMember ? parseInt(payerMember.id, 10) : (members[0]?.id ?? "");
    }
    return expenseToEdit?.paid_by || (members[0]?.id ?? "");
  };

  const getInitialSelected = () => {
    if (expenseToEdit && expenseToEdit.participants) {
      return expenseToEdit.participants
        .map((pName) => {
          const member = members.find((m) => m.name === pName);
          return member ? member.id : null;
        })
        .filter((id) => id !== null);
    }
    return members.map((m) => m.id);
  };

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [payer, setPayer] = useState(members[0]?.id ?? "");
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { addExpenseWithParticipants, updateTransaction: ctxUpdateTransaction } =
    useContext(ExpenseContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  useEffect(() => {
    if (open) {
      setAmount(expenseToEdit?.amount || "");
      setTitle(expenseToEdit?.title || "");
      setPayer(getPayerId());
      setSelected(getInitialSelected());
    }
  }, [open, expenseToEdit, members]);
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);
  const toggleMember = (id) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const guardedSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const num = Number(amount);
      if (!amount || isNaN(num) || num <= 0) {
        console.warn("AddExpenseModal: invalid amount", amount);
        setSubmitting(false);
        return;
      }
      const expense = {
        amount: num,
        title: title || "",
        paid_by: parseInt(payer, 10) || (members[0]?.id ?? 0),
        participants:
          Array.isArray(selected) && selected.length > 0
            ? selected
            : members.map((m) => m.id),
        date: new Date().toISOString(),
        archived: false,
      };

      if (typeof onSave === "function") {
        await Promise.resolve(onSave(expense));
      } else if (expenseToEdit) {
        ctxUpdateTransaction(groupId, expenseToEdit.id, expense);
      } else if (addExpenseWithParticipants) {
        addExpenseWithParticipants(groupId, expense, selected);
      } else {
        console.warn(
          "No onSave, expenseToEdit, and no context.addExpenseWithParticipants available"
        );
      }
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("AddExpenseModal submit error:", err);
    } finally {
      setSubmitting(false);
    }
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
          <h3 className="text-lg font-semibold">
            {expenseToEdit ? t("Edit expense") : t("Add expense")}
          </h3>
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

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("Amount")}
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded border focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              placeholder="0.00"
              aria-label="amount"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("Description")}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded border focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500"
              placeholder={t("Dinner, taxi...")}
              aria-label="description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {t("Paid by")}
            </label>
            <select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="w-full p-2 rounded border focus.ring-2 focus.ring-indigo-500"
            >
              {members.length === 0 ? (
                <option value="">{t("No members")}</option>
              ) : (
                members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">{t("Split with")}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                    selected.includes(m.id)
                      ? "bg-indigo-100 dark:bg-indigo-900 border-indigo-500 text-indigo-900 dark:text-indigo-100"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                    checked={selected.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                  />
                  <span className="text-sm font-medium">{m.name}</span>
                </label>
              ))}
            </div>
          </div>
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
            onClick={guardedSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {submitting ? t("Saving...") : t("Save")}
          </button>
        </div>
      </div>
    </div>
  );
}
