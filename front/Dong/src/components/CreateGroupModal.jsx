import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import ExpenseContext from "./ExpenseContext";

export default function CreateGroupModal({ open, onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [members, setMembers] = useState([{ name: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { addGroup } = useContext(ExpenseContext);
  const navigate = useNavigate();

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index].name = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { name: "" }]);
  };

  const removeMember = (index) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const guardedSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const group = {
        title: name,
        members: members.filter((m) => m.name.trim() !== ""),
      };
      const newGroup = await addGroup(group);
      if (newGroup) {
        navigate(`/group/${newGroup.id}`);
      }
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("CreateGroupModal submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center md:items-end md:justify-center transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-[calc(100%-2rem)] mx-4 md:max-w-lg md:mx-auto rounded-lg md:rounded-xl shadow-xl transform transition-all duration-300
        ${
          open
            ? "scale-100 opacity-100 md:translate-y-0"
            : "scale-95 opacity-0 md:translate-y-full"
        }
        ${theme === "light" ? "bg-white" : "bg-gray-800"}
        md:w-full md:mx-auto md:bottom-0 md:left-0 md:right-0 md:rounded-b-none md:rounded-t-lg`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            theme === "light" ? "border-gray-200" : "border-gray-700"
          }`}
        >
          <h3
            className={`text-lg font-semibold ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            {t("Create new Dong")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-full ${
              theme === "light"
                ? "hover:bg-gray-200 text-gray-700"
                : "hover:bg-gray-700 text-gray-300"
            } cursor-pointer`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              {t("Dong name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2 rounded border ${
                theme === "light"
                  ? "border-gray-300 focus:ring-indigo-500 hover:border-indigo-500 text-gray-900"
                  : "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 hover:border-indigo-500"
              }`}
              placeholder={t("e.g., Weekend Trip")}
            />
          </div>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-1 ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              {t("Members")}
            </label>
            {members.map((member, index) => (
              <div key={index} className="relative flex items-center mb-2">
                <input
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  className={`w-full p-2 pr-10 rounded border ${
                    theme === "light"
                      ? "border-gray-300 focus:ring-indigo-500 hover:border-indigo-500 text-gray-900"
                      : "border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 hover:border-indigo-500"
                  }`}
                  placeholder={`${t("Member")} ${index + 1}`}
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 cursor-pointer p-1 rounded-full"
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
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMember}
              className="text-indigo-600 cursor-pointer hover:text-indigo-700"
            >
              {t("+ Add member")}
            </button>
          </div>
        </div>

        <div
          className={`flex items-center justify-end gap-3 p-4 border-t ${
            theme === "light" ? "border-gray-200" : "border-gray-700"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded border ${
              theme === "light"
                ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                : "border-gray-600 hover:bg-gray-700 text-gray-300"
            } cursor-pointer`}
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={guardedSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 cursor-pointer"
          >
            {submitting ? t("Creating...") : t("Create")}
          </button>
        </div>
      </div>
    </div>
  );
}
