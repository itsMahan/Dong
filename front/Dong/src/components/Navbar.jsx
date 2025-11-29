import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Navbar({ onLogout }) { // Accept onLogout prop
    const { theme, toggleTheme } = useContext(ThemeContext);

    const logoutButtonClasses = `py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
        theme === "light"
    }`;

    return (
        <nav className={`p-4 shadow-md flex justify-between items-center ${
            theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
        }`}>
            <h1 className="text-xl font-bold">Dong</h1> {/* Changed from App to Dong */}
            <div className="flex items-center gap-4"> {/* Container for multiple right-aligned items */}
                <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    {theme === "light" ? "🌙" : "☀️"}
                </button>
                {onLogout && ( // Only render logout button if onLogout prop is provided
                    <button onClick={onLogout} className={logoutButtonClasses}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}