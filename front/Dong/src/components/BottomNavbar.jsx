import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";
import { Link } from "react-router-dom";
import BurgerMenu from "./BurgerMenu";

export default function BottomNavbar({ onCreateGroup, onLogout, backTo, activeTabIndex }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [isBurgerMenuOpen, setBurgerMenuOpen] = useState(false);

  const handleBurgerMenuClose = () => {
    setBurgerMenuOpen(false);
  };

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 shadow-lg md:hidden ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
        style={{ direction: "ltr" }}
      >
        <div className="flex justify-between items-center h-16 px-4">
          <div className="w-1/3">
            {backTo && (
              <Link
                to={backTo}
                className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
                <span className="text-xs">{t("Back")}</span>
              </Link>
            )}
          </div>

          <div className="w-1/3 flex justify-center">
            {(activeTabIndex === undefined || activeTabIndex === 0) && (
              <button
                onClick={onCreateGroup}
                className="flex flex-col items-center justify-center text-white bg-indigo-600 rounded-full w-14 h-14 -mt-4 shadow-lg"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </button>
            )}
          </div>

          <div className="w-1/3 flex justify-end">
            <button
              onClick={() => setBurgerMenuOpen(!isBurgerMenuOpen)}
              className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <BurgerMenu
        isOpen={isBurgerMenuOpen}
        onLogout={onLogout}
        onClose={handleBurgerMenuClose}
      />
    </>
  );
}
