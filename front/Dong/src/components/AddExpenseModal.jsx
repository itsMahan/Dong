import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import ExpenseContext from "../components/ExpenseContext";
import { ThemeContext } from "./ThemeContext";
import ConfirmDialog from "./ConfirmDialog";

export default function AddExpenseModal({
  open,
  onClose,
  onSave,
  members = [],
  expenseToEdit, // New prop for editing
  groupId,
  expenseType,
  totalBudget,
  currentTotalExpenses,
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
  const [quantity, setQuantity] = useState(1);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [includeTax, setIncludeTax] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  const { addExpenseWithParticipants, updateTransaction: ctxUpdateTransaction } =
    useContext(ExpenseContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  useEffect(() => {
    if (open) {
      setAmount(expenseToEdit?.amount || "");
      setTitle(expenseToEdit?.title || "");
      setPayer(getPayerId());
      setSelected(getInitialSelected());
      setQuantity(expenseToEdit?.quantity || 1);
      setTaxPercentage(expenseToEdit?.tax_percentage || 0);
      setIncludeTax(expenseToEdit?.include_tax || false);
      setErrorMsg("");
      setShowBudgetWarning(false);
    }
  }, [open, expenseToEdit, members]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (showBudgetWarning) {
          setShowBudgetWarning(false);
        } else {
          onClose();
        }
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, showBudgetWarning]);

  const toggleMember = (id) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const processSubmit = async (force = false) => {
    if (submitting) return;
    setErrorMsg("");
    try {
      const num = Number(amount);
      if (!amount || isNaN(num) || num <= 0) {
        console.warn("AddExpenseModal: invalid amount", amount);
        return;
      }

      if (!force) {
        // Calculate the total for this specific expense (including tax/quantity)
        let expenseTotal = num * (expenseType === 'individual' ? quantity : 1);
        if (includeTax) {
          expenseTotal += expenseTotal * (taxPercentage / 100);
        }

        // Budget check
        if (totalBudget && (Number(currentTotalExpenses) + expenseTotal > Number(totalBudget))) {
          setShowBudgetWarning(true);
          return;
        }
      }

      setSubmitting(true);
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
        expense_type: expenseType,
        quantity: quantity,
        tax_percentage: taxPercentage,
        include_tax: includeTax,
      };

      console.log("Submitting expense:", expense);

      if (typeof onSave === "function") {
        await Promise.resolve(onSave(expense));
      } else if (expenseToEdit) {
        await ctxUpdateTransaction(groupId, expenseToEdit.id, expense);
      } else if (addExpenseWithParticipants) {
        await addExpenseWithParticipants(groupId, expense);
      } else {
        console.warn(
          "No onSave, expenseToEdit, and no context.addExpenseWithParticipants available"
        );
      }
      
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("AddExpenseModal submit error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg(t("An error occurred while saving the expense"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`relative w-[calc(100%-2rem)] mx-4 md:max-w-lg md:mx-auto rounded-t-lg md:rounded-lg shadow-xl transform transition-all duration-300
          ${
            open
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }
          ${theme === "light" ? "bg-white" : "bg-gray-800"}
          md:w-full md:mx-auto md:bottom-auto md:left-auto md:right-auto md:rounded-b-lg md:translate-y-0`}
        >
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
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

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                {errorMsg}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-2">{t("Amount")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full p-3 rounded-md border ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-300"
                      : "bg-gray-700 border-gray-600 text-white"
                  } focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500 transition duration-150 ease-in-out [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]`}
                  placeholder="0.00"
                  aria-label="amount"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-2">{t("Paid by")}</label>
                <select
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  className={`w-full p-3 rounded-md border ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-300"
                      : "bg-gray-700 border-gray-600 text-white"
                  } focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500 transition duration-150 ease-in-out`}
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
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">{t("Description")}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-3 rounded-md border ${
                  theme === "light"
                    ? "bg-gray-50 border-gray-300"
                    : "bg-gray-700 border-gray-600 text-white"
                } focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500 transition duration-150 ease-in-out`}
                placeholder={t("Dinner, taxi...")}
                aria-label="description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {expenseType === 'individual' && (
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-2">{t("Quantity")}</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={`w-full p-3 rounded-md border ${
                      theme === "light"
                        ? "bg-gray-50 border-gray-300"
                        : "bg-gray-700 border-gray-600 text-white"
                    } focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500 transition duration-150 ease-in-out`}
                    placeholder="1"
                  />
                </div>
              )}
              <div className={`${expenseType === 'individual' ? 'col-span-1' : 'col-span-2'}`}>
                <label className="block text-sm font-medium mb-2">{t("Tax")}</label>
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className={`w-full p-3 rounded-md border ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-300"
                      : "bg-gray-700 border-gray-600 text-white"
                  } focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500 transition duration-150 ease-in-out`}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="col-span-1 flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeTax}
                    onChange={(e) => setIncludeTax(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">{t("Include Tax")}</span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-3">{t("Split with")}</div>
              <div className="flex flex-wrap gap-3">
                {members.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition-all ${
                      selected.includes(m.id)
                        ? "bg-indigo-600 border-transparent text-white"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selected.includes(m.id)}
                      onChange={() => toggleMember(m.id)}
                    />
                    <span className="text-sm font-medium">{m.name}</span>
                  </label>
                ))}
              </div>
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
              onClick={() => processSubmit(false)}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {submitting ? t("Saving...") : t("Save")}
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showBudgetWarning}
        title={t("Budget Warning")}
        description={t("you have used all of the budget")}
        confirmText={t("OK")}
        onConfirm={() => {
          setShowBudgetWarning(false);
        }}
        isDestructive={false}
      />
    </>
  );
}
