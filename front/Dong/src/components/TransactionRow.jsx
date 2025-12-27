import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ExpenseContext from "../components/ExpenseContext";
import ConfirmDialog from "./ConfirmDialog";
import { ThemeContext } from "./ThemeContext";
import { formatToman } from "../utils/format";
import AddExpenseModal from "./AddExpenseModal"; // Import AddExpenseModal
import DropdownMenu from "./DropdownMenu";

export default function TransactionRow({ tx, members }) {
  const { t } = useTranslation();
  const { groupId } = useParams();
  const { updateTransaction, removeTransaction } = useContext(ExpenseContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // State for edit modal
  const { theme } = useContext(ThemeContext);
  const positive = Number(tx.amount) >= 0;

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const doDelete = () => {
    removeTransaction(groupId, tx.id);
    setConfirmOpen(false);
  };

  const handleEditClick = () => {
    setIsEditOpen(true);
  };

  const handleSaveEdit = (updatedExpense) => {
    updateTransaction(tx.id, updatedExpense);
    setIsEditOpen(false);
  };

  const dropdownOptions = [
    {
      label: t("Edit"),
      onClick: handleEditClick,
    },
    {
      label: t("Delete"),
      onClick: handleDelete,
      isDelete: true,
    },
  ];

  return (
    <>
      <div
        className={`flex items-center justify-between p-3 border-b last:border-b-0 ${
          theme === "light"
            ? "bg-white text-gray-900"
            : "bg-gray-900 text-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              theme === "light"
                ? "bg-gray-200 text-gray-800"
                : "bg-gray-800 text-gray-100"
            }`}
          >
            {String(tx.payer || "U")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div
              className={`font-medium ${
                tx.archived
                  ? "line-through text-gray-400"
                  : theme === "light"
                  ? "text-gray-900"
                  : "text-gray-100"
              }`}
            >
              {tx.title || t("Expense")}
            </div>
            <div
              className={`text-xs ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {new Date(tx.date).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`${
              positive ? "text-green-600" : "text-red-500"
            } font-semibold`}
          >
            {positive ? "+" : "-"}
            {formatToman(Math.abs(tx.amount))}
          </div>
          <DropdownMenu options={dropdownOptions} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("Delete transaction?")}
        description={
          <span>
            {t("This will permanently remove the transaction")}{" "}
            <strong>{tx.title}</strong>. {t("This action cannot be undone.")}
          </span>
        }
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {isEditOpen && (
        <AddExpenseModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveEdit}
          members={members}
          expenseToEdit={tx} // Pass the transaction to be edited
        />
      )}
    </>
  );
}
