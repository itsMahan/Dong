import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import ExpenseContext from "./ExpenseContext";
import { ThemeContext } from "./ThemeContext";
import AddMemberModal from "./AddMemberModal";

export default function MembersPanel({ group, settlementData }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { addMember, removeMember } = useContext(ExpenseContext);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const handleAddMember = (member) => {
    addMember(group.id, member);
    setIsAddMemberOpen(false);
  };

  const members = group?.members || [];
  const memberBalances = settlementData?.member_balances || {};
  const totalExpenses =
    (group?.transactions || [])
      .filter((tx) => !tx.archived)
      .reduce((s, tx) => s + Number(tx.amount || 0), 0) ||
    settlementData?.summary?.total_expenses ||
    0;

  return (
    <>
      <div
        className={`${
          theme === "light" ? "bg-white" : "bg-gray-800"
        } rounded-lg shadow-sm p-4`}
      >
        <div className="flex justify-between items-center mb-2">
          <h4
            className={`text-sm font-bold ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {t("Members")}
          </h4>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="text-indigo-600 text-sm font-semibold cursor-pointer"
          >
            {t("+ Add")}
          </button>
        </div>
        <ul className="space-y-2">
          {members.length === 0 && (
            <li className="text-gray-500 text-sm">{t("No members yet")}</li>
          )}
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between">
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
              <button
                onClick={() => removeMember(group.id, m.name)}
                className="text-red-500 text-xs cursor-pointer"
              >
                {t("Remove")}
              </button>
            </li>
          ))}
        </ul>
      </div>

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
          {t("Summary")}
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span>{t("Total Expenses")}</span>
            <strong>{totalExpenses.toFixed(2)}</strong>
          </li>
          <li className="flex justify-between">
            <span>{t("Members")}</span>
            <strong>{members.length}</strong>
          </li>
        </ul>

        <div className="mt-4">
          <h5
            className={`text-sm ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            } mb-2`}
          >
            {t("Balances")}
          </h5>
          <ul className="space-y-2">
            {members.length === 0 && (
              <li className="text-gray-500 text-sm">No members</li>
            )}
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
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
                    memberBalances[m.name] >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {memberBalances[m.name] >= 0 ? "+" : "-"}
                  {Math.abs(memberBalances[m.name] || 0).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AddMemberModal
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSave={handleAddMember}
      />
    </>
  );
}

