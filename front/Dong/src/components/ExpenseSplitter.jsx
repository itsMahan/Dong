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
import ChooseExpenseTypeModal from "./ChooseExpenseTypeModal";

function ExpenseSplitterInner({ group }, ref) {
  const { t } = useTranslation();
  const { addTransaction } = useContext(ExpenseContext);
  const { id: groupId, members = [], transactions = [] } = group || {};

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isChooseTypeOpen, setIsChooseTypeOpen] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState("total");
  const [addButtonRef, setAddButtonRef] = useState(null);

  useImperativeHandle(ref, () => ({
    openAddModal: (buttonRef) => {
      setAddButtonRef(buttonRef);
      setIsChooseTypeOpen(true);
    },
    closeAddModal: () => {
      setIsAddOpen(false);
      setIsChooseTypeOpen(false);
    },
  }));

  useEffect(() => {
    const handler = (event) => {
      if (event.detail?.buttonRef) {
        setAddButtonRef(event.detail.buttonRef);
      }
      setIsChooseTypeOpen(true);
    };
    window.addEventListener("openAddExpense", handler);
    return () => window.removeEventListener("openAddExpense", handler);
  }, []);

  const handleSaveExpense = (expense) => {
    addTransaction(groupId, { ...expense, expense_type: selectedExpenseType });
    setIsAddOpen(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedExpenseType(type);
    setIsChooseTypeOpen(false);
    setIsAddOpen(true);
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

      <ChooseExpenseTypeModal
        open={isChooseTypeOpen}
        onClose={() => setIsChooseTypeOpen(false)}
        onSelect={handleTypeSelect}
        buttonRef={addButtonRef}
      />

      <AddExpenseModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveExpense}
        members={members}
        groupId={groupId}
        expenseType={selectedExpenseType}
        totalBudget={group.total_budget}
        currentTotalExpenses={group.total_expenses}
      />
    </div>
  );
}

export default forwardRef(ExpenseSplitterInner);
