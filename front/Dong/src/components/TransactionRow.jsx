import React, { useContext, useState } from "react";
import ExpenseContext from "../components/ExpenseContext";
import ConfirmDialog from "./ConfirmDialog";
import { ThemeContext } from "./ThemeContext";
import { formatToman } from "../utils/format";

export default function TransactionRow({ tx }) {
  const { updateTransaction, removeTransaction } = useContext(ExpenseContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { theme } = useContext(ThemeContext);
  const positive = Number(tx.amount) >= 0;

  const markDone = () => {
    updateTransaction({ ...tx, archived: true });
  };

  const restore = () => {
    updateTransaction({ ...tx, archived: false });
  };

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const doDelete = () => {
    removeTransaction(tx.id);
    setConfirmOpen(false);
  };

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
              {tx.description || "Expense"}
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

        <div className="text-right flex flex-col items-end gap-2">
          <div
            className={`${
              positive ? "text-green-600" : "text-red-500"
            } font-semibold`}
          >
            {positive ? "+" : "-"}
            {formatToman(Math.abs(tx.amount))}
          </div>
          <div className="flex items-center gap-2">
            {!tx.archived ? (
              <>
                <button
                  onClick={markDone}
                  className={`${
                    theme === "light"
                      ? "bg-green-100 text-green-700"
                      : "bg-green-900/30 text-green-300"
                  } text-sm px-2 py-1 rounded`}
                >
                  Done
                </button>
                <button
                  onClick={handleDelete}
                  className={`${
                    theme === "light"
                      ? "border text-red-600"
                      : "border text-red-400"
                  } text-sm px-2 py-1 rounded`}
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={restore}
                  className={`${
                    theme === "light"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-yellow-900/30 text-yellow-300"
                  } text-sm px-2 py-1 rounded`}
                >
                  Restore
                </button>
                <button
                  onClick={handleDelete}
                  className={`${
                    theme === "light"
                      ? "border text-red-600"
                      : "border text-red-400"
                  } text-sm px-2 py-1 rounded`}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete transaction?"
        description={
          <span>
            This will permanently remove the transaction{" "}
            <strong>{tx.description}</strong>. This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
