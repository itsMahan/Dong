import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../components/ThemeContext";
import ExpenseContext from "../components/ExpenseContext";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";

export default function TricountsPage({ onCreateGroup, onLogout }) {
  const { theme } = useContext(ThemeContext);
  const { groups, loading, error, removeGroup } = useContext(ExpenseContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDong, setSelectedDong] = useState(null);

  const handleDeleteClick = (group) => {
    setSelectedDong(group);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDong) {
      removeGroup(selectedDong.id);
    }
    setDialogOpen(false);
    setSelectedDong(null);
  };

  console.log("Groups in TricountsPage:", groups);

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
          <h2 className="text-2xl font-semibold mb-4 md:mb-0">My Dongs</h2>
          <button
            onClick={onCreateGroup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Create Dong
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
                <Link to={`/group/${group.id}`} className="flex-grow">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {group.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {group.members?.length || 0} members
                    </p>
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-sm text-gray-500">Total: </span>
                    <span className="font-semibold">
                      {group.transactions?.reduce(
                        (acc, tx) => acc + tx.amount,
                        0
                      ) || 0}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => handleDeleteClick(group)}
                  className="text-red-500 text-sm self-end mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      </main>
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Dong"
        description="Are you sure you want to delete this dong? This action cannot be undone."
      />
    </div>
  );
}
