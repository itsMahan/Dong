import React, { useEffect, useContext, useRef } from "react";
import ExpenseContext from "../components/ExpenseContext";
import { ThemeContext } from "../components/ThemeContext";
import Navbar from "../components/Navbar";
import ExpenseSplitter from "../components/ExpenseSplitter";
import MembersPanel from "../components/MembersPanel";
import { formatToman } from "../utils/format";

export default function HomePage({
  onLogout,
  showLoginSuccessPopup,
  onCloseLoginSuccessPopup,
}) {
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  const expenseCtx = useContext(ExpenseContext) || {
    members: [],
    transactions: [],
  };
  const { members = [], transactions = [] } = expenseCtx;
  const splitterRef = useRef(null);

  useEffect(() => {
    if (showLoginSuccessPopup) {
      const timer = setTimeout(() => {
        onCloseLoginSuccessPopup();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLoginSuccessPopup, onCloseLoginSuccessPopup]);

  const handleAddClick = () => {
    if (splitterRef.current?.openAddModal) {
      splitterRef.current.openAddModal();
    } else {
      window.dispatchEvent(new CustomEvent("openAddExpense"));
    }
  };

  const activeTransactions = transactions.filter((t) => !t.archived);
  const totalAmount = activeTransactions.reduce(
    (s, t) => s + Number(t.amount || 0),
    0
  );

  const computeBalances = () => {
    const bal = {};
    members.forEach((m) => (bal[m.id] = 0));

    activeTransactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      const parts =
        Array.isArray(t.participants) && t.participants.length > 0
          ? t.participants
          : members.map((m) => m.id);
      const share = parts.length ? amt / parts.length : 0;

      if (t.payer && bal[t.payer] !== undefined) {
        bal[t.payer] += amt - share;
      }

      parts.forEach((pid) => {
        if (bal[pid] === undefined) bal[pid] = 0;
        if (pid !== t.payer) {
          bal[pid] -= share;
        }
      });
    });

    return bal;
  };

  const balances = computeBalances();

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "light"
          ? "bg-gray-50 text-gray-900"
          : "bg-gray-900 text-white"
      }`}
    >
      <Navbar onLogout={onLogout} />

      <header className="sticky top-0 z-20 bg-transparent backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              T
            </div>
            <div>
              <h2 className="text-lg font-semibold">Group</h2>
              <div
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {members.length} members · {activeTransactions.length} active
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div
              className={`${
                theme === "light" ? "bg-white/90" : "bg-gray-800/80"
              } rounded-lg p-3 shadow-sm text-right`}
            >
              <div
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Total
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatToman(totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div
              className={`${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } rounded-lg shadow-sm p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Transactions</h3>
                <div
                  className={`text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  All
                </div>
              </div>

              <div>
                <ExpenseSplitter ref={splitterRef} />
              </div>
            </div>
          </section>

          <aside className="lg:col-span-1 space-y-4">
            <MembersPanel />

            <div
              className={`${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } rounded-lg shadow-sm p-4`}
            >
              <h4
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                } mb-2`}
              >
                Summary
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Total</span>
                  <strong>{totalAmount.toFixed(2)}</strong>
                </li>
                <li className="flex justify-between">
                  <span>Members</span>
                  <strong>{members.length}</strong>
                </li>
              </ul>

              <div className="mt-4">
                <h5
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  } mb-2`}
                >
                  Balances
                </h5>
                <ul className="space-y-2">
                  {members.length === 0 && (
                    <li className="text-gray-500 text-sm">No members</li>
                  )}
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            theme === "light"
                              ? "bg-gray-200 text-gray-800"
                              : "bg-gray-700 text-gray-100"
                          }`}
                        >
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{m.name}</span>
                      </div>
                      <div
                        className={`font-semibold ${
                          balances[m.id] >= 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {balances[m.id] >= 0 ? "+" : "-"}
                        {Math.abs(balances[m.id] || 0).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <button
        onClick={handleAddClick}
        aria-label="Add expense"
        className="fixed right-6 bottom-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl z-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {showLoginSuccessPopup && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          Welcome, you are logged in!
          <button
            onClick={onCloseLoginSuccessPopup}
            className="ml-4 text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
