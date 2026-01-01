import React, { useContext, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../components/ThemeContext";
import ExpenseContext from "../components/ExpenseContext";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import EditGroupModal from "../components/EditGroupModal";

export default function TricountsPage({ onCreateGroup, onLogout }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { groups, loading, error, removeGroup, updateGroup } =
    useContext(ExpenseContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDong, setSelectedDong] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

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
      <Navbar onLogout={onLogout} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-2xl font-semibold mb-4 md:mb-0">
            {t("My Dongs")}
          </h2>
          <button
            onClick={onCreateGroup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
          >
            {t("Create Dong")}
          </button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error.message}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(groups) &&
            groups.map((group) => (
              <div
                key={group.id}
                className={`rounded-lg shadow-sm p-4 h-full flex flex-col justify-between ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
              >
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <Link to={`/group/${group.id}`} className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">
                        {group.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {group.members?.length || 0} {t("members")}
                      </p>
                    </Link>
                    <div className="relative inline-block text-left" ref={dropdownRef}>
                      <button
                        type="button"
                        className={`flex items-center p-2 rounded-full cursor-pointer ${
                          theme === "light"
                            ? "text-gray-400 hover:bg-gray-100"
                            : "text-gray-500 hover:bg-gray-700"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        onClick={() => setOpenDropdownId(openDropdownId === group.id ? null : group.id)}
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
                      {openDropdownId === group.id && (
                        <div
                          className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                            theme === "light" ? "bg-white" : "bg-gray-800"
                          } ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform ${
                            openDropdownId === group.id
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-95"
                          }`}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => handleEditClick(group)}
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
                              onClick={() => handleDeleteClick(group)}
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
                  <div className="mt-4 text-right">
                    <span className="text-sm text-gray-500">
                      {t("Total:")}{" "}
                    </span>
                    <span className="font-semibold">
                      {group.transactions?.reduce(
                        (acc, tx) => acc + tx.amount,
                        0
                      ) || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
