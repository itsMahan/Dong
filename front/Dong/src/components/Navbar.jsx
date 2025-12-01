import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Navbar({ onLogout }) {
    const { theme, toggleTheme } = useContext(ThemeContext);

    const logoutButtonClasses = `py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
        theme === "light"
    }`;

    return (
        <nav className={`p-4 shadow-md flex justify-between items-center ${
            theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
        }`}>
            <h1 className="text-xl font-bold cursor-default">Dong</h1>
            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 rounded-full bg-${theme} cursor-pointer">
                    {theme === "light" ? "🌙" : "☀️"}
                </button>
                {onLogout && (
                    <button onClick={onLogout} className="{logoutButtonClasses} cursor-pointer" >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}