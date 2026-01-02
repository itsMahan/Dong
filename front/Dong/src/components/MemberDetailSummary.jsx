import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as membersApi from "../api/members";

function MemberDetailSummary({ dongId, memberName, theme }) {
  const { t } = useTranslation();
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dongId || !memberName) {
      setError(t("Dong ID and Member Name are required."));
      setLoading(false);
      return;
    }

    const fetchMemberDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await membersApi.getMemberDetail(dongId, memberName);
        setMemberDetails(response.data);
      } catch (err) {
        console.error("Error fetching member details:", err);
        setError(t("Failed to fetch member details."));
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [dongId, memberName, t]);

  if (loading) {
    return <div className="p-4 text-center">{t("Loading member details...")}</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  if (!memberDetails) {
    return <div className="p-4 text-center">{t("No member details found.")}</div>;
  }

  return (
    <div
      className={`shadow-md rounded-lg p-4 mb-4 ${
        theme === "light" ? "bg-white" : "bg-gray-800"
      }`}
    >
      <h3
        className={`text-xl font-semibold mb-3 ${
          theme === "light" ? "text-gray-900" : "text-white"
        }`}
      >
        {t("Details for")} {memberDetails.member}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
        <div>
          <p
            className={`text-sm ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {t("Total Paid")}
          </p>
          <p className="text-lg font-semibold text-green-600">
            {memberDetails.total_paid}
          </p>
        </div>
        <div>
          <p
            className={`text-sm ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {t("Total Share")}
          </p>
          <p className="text-lg font-semibold text-red-500">
            {memberDetails.total_share}
          </p>
        </div>
        <div>
          <p
            className={`text-sm ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {t("Balance")}
          </p>
          <p
            className={`text-lg font-semibold ${
              memberDetails.balance >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {memberDetails.balance}
          </p>
        </div>
        <div>
          <p
            className={`text-sm ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {t("Status")}
          </p>
          <p className="text-lg font-semibold">{t(memberDetails.status)}</p>
        </div>
      </div>

      {memberDetails.paid_expenses &&
        memberDetails.paid_expenses.length > 0 && (
          <div className="mb-4">
            <h4
              className={`text-lg font-medium mb-2 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              {t("Expenses Paid:")}
            </h4>
            <ul className="list-disc list-inside">
              {memberDetails.paid_expenses.map((expense, index) => (
                <li
                  key={index}
                  className={`${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  {expense.title}: {expense.amount}
                </li>
              ))}
            </ul>
          </div>
        )}

      {memberDetails.participated_expenses &&
        memberDetails.participated_expenses.length > 0 && (
          <div>
            <h4
              className={`text-lg font-medium mb-2 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              {t("Expenses Participated In:")}
            </h4>
            <ul className="list-disc list-inside">
              {memberDetails.participated_expenses.map((expense, index) => (
                <li
                  key={index}
                  className={`${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  {expense.title}{" "}
                  {t("(Paid by {{name}})", { name: expense.paid_by })}:{" "}
                  {t("Your share is")} {expense.your_share}
                </li>
              ))}
            </ul>
          </div>
        )}

      {(!memberDetails.paid_expenses ||
        memberDetails.paid_expenses.length === 0) &&
        (!memberDetails.participated_expenses ||
          memberDetails.participated_expenses.length === 0) && (
          <p
            className={`${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {t("No expense data available for this member.")}
          </p>
        )}
    </div>
  );
}

export default MemberDetailSummary;
