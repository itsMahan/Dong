import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function MembersPanel({ group }) {
  const { members = [] } = group || {};
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-800"
      } rounded-lg shadow-sm p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold">Members</h3>
        <div
          className={`text-sm ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {members.length}
        </div>
      </div>
      <ul className="space-y-2">
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
          </li>
        ))}
      </ul>
    </div>
  );
}
