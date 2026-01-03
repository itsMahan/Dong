import React, { useContext, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ExpenseContext from "../components/ExpenseContext";
import ConfirmDialog from "./ConfirmDialog";
import { ThemeContext } from "./ThemeContext";
import { formatToman } from "../utils/format";
import AddExpenseModal from "./AddExpenseModal"; // Import AddExpenseModal

export default function TransactionRow({ tx, members }) {
  const { t, i18n } = useTranslation();
  const { groupId } = useParams();
  const { updateTransaction, removeTransaction } = useContext(ExpenseContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // State for edit modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false); // State for participants visibility
  const { theme } = useContext(ThemeContext);
  const positive = Number(tx.amount) >= 0;
  const dropdownRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = () => {
    setConfirmOpen(true);
    setIsDropdownOpen(false);
  };

  const doDelete = () => {
    removeTransaction(groupId, tx.id);
    setConfirmOpen(false);
  };

  const handleEditClick = () => {
    setIsEditOpen(true);
    setIsDropdownOpen(false);
  };

  const handleSaveEdit = (updatedExpense) => {
    updateTransaction(groupId, tx.id, updatedExpense);
    setIsEditOpen(false);
  };

  const participants = tx.participants || [];
  const numParticipants = participants.length;

  return (
    <>
      <div
        className={`p-4 rounded-lg shadow-sm ${
          theme === "light"
            ? "bg-white text-gray-900"
            : "bg-gray-900 text-gray-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div
                className={`font-medium ${
                  tx.archived
                    ? "line-through text-gray-400"
                    : theme === "light"
                    ? "text-gray-900"
                    : "text-gray-100"
                }`}
              >
                {tx.title || t("Expense")}
              </div>
              <div
                className={`text-xs ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {tx.date ? new Date(tx.date).toLocaleString() : ""}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`${
                positive ? "text-green-600" : "text-red-500"
              } font-semibold`}
            >
              {positive ? "+" : "-"}
              {formatToman(Math.abs(tx.amount))}
            </div>
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                type="button"
                className={`flex items-center p-2 rounded-full cursor-pointer ${
                  theme === "light"
                    ? "text-gray-400 hover:bg-gray-100"
                    : "text-gray-500 hover:bg-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12"
                  ></path>
                </svg>
              </button>
              {isDropdownOpen && (
                <div
                  className={`${
                    isRtl ? "origin-top-left left-0" : "origin-top-right right-0"
                  } absolute mt-2 w-48 rounded-md shadow-lg z-10 ${
                    theme === "light" ? "bg-white" : "bg-gray-800"
                  } ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform ${
                    isDropdownOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <div className="py-1">
                    <button
                      onClick={handleEditClick}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${
                        theme === "light"
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      {t("Edit")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${
                        theme === "light"
                          ? "text-red-700 hover:bg-red-50"
                          : "text-red-400 hover:bg-red-900/50"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("Delete")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-xs text-gray-500 flex items-center"
          >
            {numParticipants}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className={`bi bi-people-fill w-4 h-4 ${isRtl ? "mr-1" : "ml-1"}`}
              viewBox="0 0 16 16"
            >
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              <path
                fillRule="evenodd"
                d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"
              />
              <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
            </svg>
          </button>
          {showParticipants && (
            <div className="mt-2 flex flex-wrap gap-2">
              {participants.map((participantName) => {
                const member = members.find((m) => m.name === participantName);
                return (
                  <div
                    key={participantName}
                    className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                        theme === "light"
                          ? "bg-gray-300 text-gray-800"
                          : "bg-gray-600 text-gray-100"
                      }`}
                    >
                      {member ? member.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span>{member ? member.name : "Unknown"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("Delete expense?")}
        description={
          <span>
            {t("This will permanently remove the expense")}{" "}
            <strong>{tx.title}</strong>. {t("This action cannot be undone.")}
          </span>
        }
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {isEditOpen && (
        <AddExpenseModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveEdit}
          members={members}
          expenseToEdit={tx} // Pass the transaction to be edited
        />
      )}
    </>
  );
}
