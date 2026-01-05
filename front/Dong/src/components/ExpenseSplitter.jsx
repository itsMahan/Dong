import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useContext,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import ExpenseContext from "../components/ExpenseContext";
import AddExpenseModal from "./AddExpenseModal";
import TransactionRow from "./TransactionRow";
import { ThemeContext } from "./ThemeContext";

function ExpenseSplitterInner({ group }, ref) {
  const { t } = useTranslation();
  const { addTransaction } = useContext(ExpenseContext);
  const { id: groupId, members = [], transactions = [] } = group || {};

  const [isAddOpen, setIsAddOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openAddModal: () => setIsAddOpen(true),
    closeAddModal: () => setIsAddOpen(false),
  }));

  useEffect(() => {
    const handler = () => setIsAddOpen(true);
    window.addEventListener("openAddExpense", handler);
    return () => window.removeEventListener("openAddExpense", handler);
  }, []);

  const handleSaveExpense = (expense) => {
    console.log("[ExpenseSplitter] saving expense", expense);
    addTransaction(groupId, expense);
    setIsAddOpen(false);
  };

  const active = transactions.filter((t) => !t.archived);

  const { theme } = React.useContext(ThemeContext);

  return (
    <div className={`${theme === "light" ? "text-gray-900" : "text-gray-100"}`}>
      {/* Active Transactions panel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-4">
          <h4 className="text-md font-semibold">{t("Active Expenses")}</h4>
        </div>
        <div
          className={`${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } rounded-md shadow-sm space-y-3 p-4`}
        >
          {active.length === 0 ? (
            <div
              className={`p-4 text-sm ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {t("No active expenses")}
            </div>
          ) : (
            active.map((tx) => <TransactionRow key={tx.id} tx={tx} groupId={groupId} members={members} />)
          )}
        </div>
      </div>

      <AddExpenseModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveExpense}
        members={members}
        groupId={groupId}
      />
    </div>
  );
}

export default forwardRef(ExpenseSplitterInner);
