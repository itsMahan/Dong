import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import * as dongsApi from "../api/dongs";
import { ThemeContext } from "./ThemeContext";

function SettlementDetail({ dongId }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dongId) return;

    const fetchSettlement = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await dongsApi.getDongSettlement(dongId);
        setSettlement(response.data);
      } catch (err) {
        console.error("Error fetching settlement:", err);
        setError(t("Failed to fetch settlement details."));
      } finally {
        setLoading(false);
      }
    };

    fetchSettlement();
  }, [dongId, t]);

  if (loading) {
    return <div className="p-4 text-center">{t("Loading settlement...")}</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  if (!settlement) {
    return <div className="p-4 text-center">{t("No settlement details found.")}</div>;
  }

  return (
    <div
      className={`rounded-lg shadow-sm p-4 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <h3
        className={`text-xl font-semibold mb-4 ${
          theme === "light" ? "text-gray-900" : "text-white"
        }`}
      >
        {t("Settlement for")} {settlement.dong_title}
      </h3>

      {/* Summary Section */}
      <div className="mb-6">
        <h4
          className={`text-lg font-medium mb-2 ${
            theme === "light" ? "text-gray-800" : "text-gray-200"
          }`}
        >
          {t("Summary")}
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p
              className={`${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {t("Total Expenses")}
            </p>
            <p className="font-semibold">
              {settlement.summary.total_expenses}
            </p>
          </div>
          <div>
            <p
              className={`${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {t("Total Transactions")}
            </p>
            <p className="font-semibold">
              {settlement.summary.total_transactions}
            </p>
          </div>
          <div>
            <p
              className={`${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {t("Creditors")}
            </p>
            <ul>
              {settlement.summary.creditors.map((c) => (
                <li key={c.name} className="font-semibold text-green-500">
                  {c.name}: {c.amount}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className={`${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {t("Debtors")}
            </p>
            <ul>
              {settlement.summary.debtors.map((d) => (
                <li key={d.name} className="font-semibold text-red-500">
                  {d.name}: {d.amount}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="mb-6">
        <h4
          className={`text-lg font-medium mb-2 ${
            theme === "light" ? "text-gray-800" : "text-gray-200"
          }`}
        >
          {t("Transactions")}
        </h4>
        <ul className="space-y-2">
          {settlement.transactions.map((t, index) => (
            <li
              key={index}
              className={`p-2 rounded ${
                theme === "light" ? "bg-gray-100" : "bg-gray-700"
              }`}
            >
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-800" : "text-gray-200"
                }`}
              >
                {t.description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Member Balances Section */}
      <div>
        <h4
          className={`text-lg font-medium mb-2 ${
            theme === "light" ? "text-gray-800" : "text-gray-200"
          }`}
        >
          {t("Final Balances")}
        </h4>
        <ul className="space-y-1 text-sm">
          {Object.entries(settlement.member_balances).map(([name, balance]) => (
            <li key={name} className="flex justify-between">
              <span
                className={`${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                {name}
              </span>
              <span
                className={`font-semibold ${
                  balance >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {balance}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SettlementDetail;
