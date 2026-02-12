import React, { useContext, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../components/ThemeContext";
import ExpenseContext from "../components/ExpenseContext";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import EditGroupModal from "../components/EditGroupModal";
import BottomNavbar from "../components/BottomNavbar";
import { formatToman } from "../utils/format";

export default function TricountsPage({ onCreateGroup, onLogout }) {
  const { t, i18n } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { groups, loading, error, removeGroup, updateGroup } =
    useContext(ExpenseContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDong, setSelectedDong] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteClick = (group) => {
    setSelectedDong(group);
    setDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleEditClick = (group) => {
    setSelectedDong(group);
    setIsEditModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedDong) {
      removeGroup(selectedDong.id);
    }
    setDialogOpen(false);
    setSelectedDong(null);
  };

  const handleSaveEdit = (updatedGroup) => {
    updateGroup(updatedGroup);
    setIsEditModalOpen(false);
    setSelectedDong(null);
  };

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
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">{t("My Dongs")}</h1>
        </div>
        {loading && (
          <p className="text-center py-10">{t("Loading Dongs...")}</p>
        )}
        {error && (
          <p className="text-red-500 text-center py-10">{t(error.message)}</p>
        )}
        {!loading && !error && Array.isArray(groups) && groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              {t("Welcome!")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {t("Create your first Dong to get started.")}
            </p>
            <button
              onClick={onCreateGroup}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("Create your first Dong")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {Array.isArray(groups) &&
              groups.map((group) => (
                <div
                  key={group.id}
                  className={`relative rounded-xl shadow-lg p-6 h-full flex flex-col justify-between transition-all duration-300 ${
                    theme === "light"
                      ? "bg-white hover:shadow-2xl"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <Link to={`/group/${group.id}`} className="absolute inset-0 z-0" />
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-2">{group.title}</h3>
                    <div className="flex items-center text-base text-gray-500 dark:text-gray-400 mb-3">
                      {group.members?.length || 0}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        className={`bi bi-people-fill w-5 h-5 ${isRtl ? "mr-1" : "ml-1"}`}
                        viewBox="0 0 16 16"
                      >
                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        <path
                          fillRule="evenodd"
                          d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"
                        />
                        <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                      </svg>
                    </div>

                    {group.total_budget && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{t("Budget")}:</span>
                          <span>{formatToman(group.total_budget)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              (group.burn_rate !== undefined ? group.burn_rate : (group.total_expenses / group.total_budget * 100)) >= 80 ? 'bg-red-500' : 
                              (group.burn_rate !== undefined ? group.burn_rate : (group.total_expenses / group.total_budget * 100)) >= 50 ? 'bg-yellow-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, group.burn_rate !== undefined ? group.burn_rate : ((group.total_expenses / group.total_budget) * 100))}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{t("Remaining")}:</span>
                          <span className={`font-medium ${group.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {formatToman(group.remaining_budget)}
                          </span>
                        </div>
                        {group.budget_forecast && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                            {group.budget_forecast.status === 'budget_exhausted' ? (
                                <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {t("Budget Exhausted")}
                                </span>
                            ) : group.budget_forecast.status === 'active' ? (
                                <div className="flex flex-col gap-1">
                                  {group.budget_forecast.days_remaining !== null && (
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                      <span>{t("Forecast")}:</span>
                                      <span>{Math.ceil(group.budget_forecast.days_remaining)} {t("days")}</span>
                                    </div>
                                  )}
                                </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex items-end justify-between relative z-10 pointer-events-none">
                    <div className="flex flex-col items-start">
                      {group.total_budget && (
                        <span className={`text-lg font-bold ${
                          (group.burn_rate !== undefined ? group.burn_rate : (group.total_expenses / group.total_budget * 100)) >= 80 ? 'text-red-500' : 
                          (group.burn_rate !== undefined ? group.burn_rate : (group.total_expenses / group.total_budget * 100)) >= 50 ? 'text-yellow-500' : 'text-indigo-500'
                        }`}>
                          {Math.round(group.burn_rate !== undefined ? group.burn_rate : ((group.total_expenses / group.total_budget) * 100))}%
                        </span>
                      )}
                    </div>
                    <span className="text-3xl font-bold">
                      {formatToman(group.total_expenses || 0)}
                    </span>
                  </div>
                  <div className={`absolute top-0 p-4 z-10 ${isRtl ? "left-0" : "right-0"}`}>
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        className={`p-2 rounded-full cursor-pointer ${
                          theme === "light"
                            ? "hover:bg-gray-100"
                            : "hover:bg-gray-700"
                        }`}
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === group.id ? null : group.id
                          )
                        }
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
                            d="M12 5v.01M12 12v.01M12 19v.01"
                          ></path>
                        </svg>
                      </button>
                      {openDropdownId === group.id && (
                        <div
                          ref={dropdownRef}
                          className={`${
                            isRtl ? "origin-top-left left-0" : "origin-top-right right-0"
                          } absolute mt-2 w-48 rounded-md shadow-lg z-10 ${
                            theme === "light" ? "bg-white" : "bg-gray-800"
                          } ring-1 ring-black ring-opacity-5`}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => handleEditClick(group)}
                              className="w-full text-left px-4 py-2 text-sm flex items-center gap-3"
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
                              onClick={() => handleDeleteClick(group)}
                              className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-red-600"
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
              ))}
          </div>
        )}
      </main>
      <div className="md:hidden">
        <BottomNavbar onCreateGroup={onCreateGroup} onLogout={onLogout} />
      </div>
      <ConfirmDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("Delete Dong")}
        description={t(
          "Are you sure you want to delete this dong? This action cannot be undone."
        )}
      />
      <EditGroupModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        group={selectedDong}
      />
    </div>
  );
}
