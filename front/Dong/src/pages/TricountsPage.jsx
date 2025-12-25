import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../components/ThemeContext";
import ExpenseContext from "../components/ExpenseContext";
import { Link } from "react-router-dom";

export default function TricountsPage({ onCreateGroup, onLogout }) {
    const { theme } = useContext(ThemeContext);
    const { groups, loading, error } = useContext(ExpenseContext);

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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">My Tricounts</h2>
                    <button
                        onClick={onCreateGroup}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                        Create Tricount
                    </button>
                </div>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error.message}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(groups) && groups.map((group) => (
                        <Link to={`/group/${group.id}`} key={group.id}>
                            <div
                                className={`rounded-lg shadow-sm p-4 h-full flex flex-col justify-between cursor-pointer ${
                                    theme === "light" ? "bg-white" : "bg-gray-800"
                                }`}
                            >
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
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
                                        {group.transactions?.reduce((acc, tx) => acc + tx.amount, 0) || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
