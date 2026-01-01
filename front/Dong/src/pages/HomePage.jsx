import React, { useEffect, useContext, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ExpenseContext from "../components/ExpenseContext";
import { ThemeContext } from "../components/ThemeContext";
import Navbar from "../components/Navbar";
import ExpenseSplitter from "../components/ExpenseSplitter";
import MembersPanel from "../components/MembersPanel";
import { formatToman } from "../utils/format";
import MemberDetailSummary from "../components/MemberDetailSummary";
import MemberDetailAccordion from "../components/MemberDetailAccordion";
import SettlementDetail from "../components/SettlementDetail";
import SettlementDropdown from "../components/SettlementDropdown";
import * as dongsApi from "../api/dongs";

export default function HomePage({ onLogout }) {
  const { groupId } = useParams();
  const { t } = useTranslation();
  const { getGroup, groups, loading } = useContext(ExpenseContext);
  const [group, setGroup] = useState(null);
  const [selectedMemberName, setSelectedMemberName] = useState(null);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
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
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const { members = [], transactions = [] } = group;

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

      <header className=" top-0 z-20 bg-transparent ">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {group.title.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <div
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {members.length} {t("members")} · {activeTransactions.length}{" "}
                active
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center ml-auto mr-auto gap-4">
            <div
              className={`${
                theme === "light" ? "bg-white/90" : "bg-gray-800/80"
              } rounded-lg p-3 shadow-sm text-right w-full`}
            >
              <div
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {t("Total")}
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
                <h3 className="text-lg font-semibold">{t("Transactions")}</h3>
                <div
                  className={`text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {t("All")}
                </div>
              </div>

              <div>
                <ExpenseSplitter ref={splitterRef} group={group} />
              </div>
            </div>

            <div
              className={`${
                theme === "light" ? "bg-white" : "bg-gray-800"
              } rounded-lg shadow-sm p-4 my-4`}
            >
              <MemberDetailAccordion
                members={members}
                selectedMemberName={selectedMemberName}
                onSelect={setSelectedMemberName}
                theme={theme}
                onToggle={setShowMemberDetails}
                showDetails={showMemberDetails}
              />
              {showMemberDetails && selectedMemberName && (
                <div className="mt-8">
                  <MemberDetailSummary
                    dongId={groupId}
                    memberName={selectedMemberName}
                    theme={theme}
                  />
                </div>
              )}
            </div>

            <SettlementDropdown
              onToggle={setShowSettlement}
              showSettlement={showSettlement}
              theme={theme}
            />
            {showSettlement && <SettlementDetail dongId={groupId} />}
          </section>

          <aside className="lg:col-span-1 space-y-4">
            <MembersPanel group={group} settlementData={settlementData} />
          </aside>
        </div>
      </main>

      <button
        onClick={handleAddClick}
        aria-label={t("Add expense")}
        className="fixed left-6 bottom-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl z-40"
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
