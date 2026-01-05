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

  return (
    <>
      <div
        className={`${
          theme === "light" ? "bg-white" : "bg-gray-800"
        } rounded-lg shadow-sm p-4 w-full`}
      >
        <div className="flex justify-between items-center mb-4">
          <h4
            className={`text-lg font-bold ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            {t("Members")}
          </h4>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="text-indigo-600 font-semibold cursor-pointer text-sm"
          >
            + {t("Add Member")}
          </button>
        </div>
        <ul className="space-y-3">
          {members.length === 0 && (
            <li className="text-gray-500 text-center py-4">
              {t("No members yet")}
            </li>
          )}
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between p-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-medium">{m.name}</span>
              </div>
              <button
                onClick={() => removeMember(group.id, m.name)}
                className="text-gray-400 hover:text-red-500 text-xs mt-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <AddMemberModal
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSave={handleAddMember}
      />
    </>
  );
}
