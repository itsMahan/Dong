import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function SummaryPanel({ group, settlementData }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const members = group?.members || [];
  const totalExpenses =
    (group?.transactions || [])
      .filter((tx) => !tx.archived)
      .reduce((s, tx) => s + Number(tx.amount || 0), 0) ||
    settlementData?.summary?.total_expenses ||
    0;

  return (
    <div
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-800"
      } rounded-lg shadow-sm p-4`}
    >
      <h4
        className={`text-sm font-bold ${
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
    </div>
  );
}
