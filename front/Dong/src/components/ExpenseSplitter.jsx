import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useContext,
  useState,
} from "react";
import ExpenseContext from "../components/ExpenseContext";
import AddExpenseModal from "./AddExpenseModal";
import TransactionRow from "./TransactionRow";
import { ThemeContext } from "./ThemeContext";

function ExpenseSplitterInner(props, ref) {
  const { members, transactions, addTransaction } = useContext(ExpenseContext);
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
    addTransaction(expense);
    setIsAddOpen(false);
  };

  const active = transactions.filter((t) => !t.archived);
  const history = transactions
    .filter((t) => t.archived)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const { theme } = React.useContext(ThemeContext);

  return (
    <div className={`${theme === "light" ? "text-gray-900" : "text-gray-100"}`}>
      {/* Active Transactions panel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-md font-semibold">Active Transactions</h4>
          <div
            className={`text-sm ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {active.length}
          </div>
        </div>
        <div
          className={`${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } rounded-md shadow-sm divide-y`}
        >
          {active.length === 0 ? (
            <div
              className={`p-4 text-sm ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              No active transactions
            </div>
          ) : (
            active.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      {/* History panel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-md font-semibold">History</h4>
          <div
            className={`text-sm ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {history.length}
          </div>
        </div>
        <div
          className={`${
            theme === "light" ? "bg-white" : "bg-gray-800"
          } rounded-md shadow-sm divide-y`}
        >
          {history.length === 0 ? (
            <div
              className={`p-4 text-sm ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              No history yet
            </div>
          ) : (
            history.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      <AddExpenseModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveExpense}
        members={members}
      />
    </div>
  );
}

export default forwardRef(ExpenseSplitterInner);
