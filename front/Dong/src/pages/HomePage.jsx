import React, { useEffect, useContext, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ExpenseContext from "../components/ExpenseContext";
import { ThemeContext } from "../components/ThemeContext";
import Navbar from "../components/Navbar";
import ExpenseSplitter from "../components/ExpenseSplitter";
import MembersPanel from "../components/MembersPanel";
import { formatToman } from "../utils/format";
import MemberDetailList from "../components/MemberDetailList";
import SettlementDetail from "../components/SettlementDetail";
import * as dongsApi from "../api/dongs";
import BottomNavbar from "../components/BottomNavbar";
import Tabs from "../components/Tabs";
import SummaryPanel from "../components/SummaryPanel";

export default function HomePage({ onLogout }) {
  const { groupId } = useParams();
  const { t } = useTranslation();
  const { getGroup, groups, loading } = useContext(ExpenseContext);
  const [group, setGroup] = useState(null);
  const [settlementData, setSettlementData] = useState(null);

  useEffect(() => {
    if (groups.length > 0) {
      const groupData = getGroup(groupId);
      setGroup(groupData);
    }
  }, [groupId, groups, getGroup]);

  useEffect(() => {
    if (!groupId || !group) return;

    const fetchSettlement = async () => {
      try {
        const response = await dongsApi.getDongSettlement(groupId);
        setSettlementData(response.data);
      } catch (err) {
        console.error("Error fetching settlement data for summary:", err);
      }
    };
    fetchSettlement();
  }, [groupId, group?.transactions]);

  const { theme } = useContext(ThemeContext) || { theme: "light" };

  const splitterRef = useRef(null);

  const handleAddClick = () => {
    if (splitterRef.current?.openAddModal) {
      splitterRef.current.openAddModal();
    } else {
      window.dispatchEvent(new CustomEvent("openAddExpense"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>{t("Loading...")}</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>{t("Group not found")}</div>
      </div>
    );
  }

  const { members = [], transactions = [] } = group;

  const activeTransactions = transactions.filter((t) => !t.archived);
  const totalAmount = activeTransactions.reduce(
    (s, t) => s + Number(t.amount || 0),
    0
  );

  const tabs = [
    {
      label: "Transactions",
      content: (
        <>
          <div className="mb-4">
            <SummaryPanel group={group} settlementData={settlementData} />
          </div>
          <ExpenseSplitter ref={splitterRef} group={group} />
        </>
      ),
    },
    {
      label: "Members",
      content: <MembersPanel group={group} settlementData={settlementData} />,
    },
    {
      label: "Details",
      content: <MemberDetailList dongId={groupId} members={members} />,
    },
    {
      label: "Settlement",
      content: <SettlementDetail dongId={groupId} />,
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "light"
          ? "bg-gray-50 text-gray-900"
          : "bg-gray-900 text-white"
      }`}
    >
      <div className="hidden md:block">
        <Navbar onLogout={onLogout} />
      </div>

      <header className="md:top-0 md:z-20 md:bg-transparent p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              {group.title.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{group.title}</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {members.length} {t("members")} {activeTransactions.length}{" "}
                {t("active")}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("Total Expenses")}
            </div>
            <div className="text-2xl font-bold text-green-500">
              {formatToman(totalAmount)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-20">
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div
              className={`${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } rounded-lg shadow-sm p-4`}
            >
              <h3 className="text-lg font-semibold mb-3">
                {t("Transactions")}
              </h3>
              <ExpenseSplitter ref={splitterRef} group={group} />
            </div>
            <div
              className={`${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } rounded-lg shadow-sm p-4`}
            >
              <h3 className="text-lg font-semibold mb-3">{t("Details")}</h3>
              <MemberDetailList dongId={groupId} members={members} />
            </div>
            <div
              className={`${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } rounded-lg shadow-sm p-4`}
            >
              <h3 className="text-lg font-semibold mb-3">{t("Settlement")}</h3>
              <SettlementDetail dongId={groupId} />
            </div>
          </section>
          <aside className="lg:col-span-1 space-y-4">
            <SummaryPanel group={group} settlementData={settlementData} />
            <MembersPanel group={group} settlementData={settlementData} />
          </aside>
        </div>
        <div className="lg:hidden">
          <Tabs tabs={tabs} t={t} />
        </div>
      </main>

      <div className="md:hidden">
        <BottomNavbar
          onCreateGroup={handleAddClick}
          onLogout={onLogout}
          backTo="/"
        />
      </div>
      <button
        onClick={handleAddClick}
        aria-label={t("Add expense")}
        className="hidden md:flex fixed left-6 bottom-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 items-center justify-center shadow-xl z-40"
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
    </div>
  );
}
