import React, { useState, useContext } from "react";
import ExpenseContext from "./ExpenseContext";
import { ThemeContext } from "./ThemeContext";
import AddMemberModal from "./AddMemberModal";

export default function MembersPanel({ group }) {
  const { theme } = useContext(ThemeContext);
  const { addMember, removeMember } = useContext(ExpenseContext);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const handleAddMember = (member) => {
    addMember(group.id, member);
    setIsAddMemberOpen(false);
  };

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
            Members
          </h4>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="text-indigo-600 text-sm font-semibold"
          >
            + Add
          </button>
        </div>
        <ul className="space-y-2">
          {group.members.length === 0 && (
            <li className="text-gray-500 text-sm">No members yet</li>
          )}
          {group.members.map((m) => (
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
                className="text-red-500 text-xs"
              >
                Remove
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
