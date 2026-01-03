import React, { useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Tabs({ tabs, t, onTabChange }) {
  const [activeTab, setActiveTab] = useState(0);
  const { theme } = useContext(ThemeContext);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div>
      <div
        className={`flex border-b ${
          theme === "light" ? "border-gray-200" : "border-gray-700"
        }`}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === index
                ? `border-b-2 border-indigo-600 ${
                    theme === "light" ? "text-indigo-600" : "text-indigo-400"
                  }`
                : `${
                    theme === "light"
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-gray-400 hover:text-gray-200"
                  }`
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
      <div className="py-4">{tabs[activeTab].content}</div>
    </div>
  );
}
