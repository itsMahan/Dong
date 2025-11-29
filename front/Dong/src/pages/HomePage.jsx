import React, { useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../components/ThemeContext";
import ExpenseSplitter from "../components/ExpenseSplitter"; // Import ExpenseSplitter

export default function HomePage({ onLogout, showLoginSuccessPopup, onCloseLoginSuccessPopup }) {
    const { theme } = useContext(ThemeContext);

    // Effect to automatically close the pop-up after 3 seconds
    useEffect(() => {
        if (showLoginSuccessPopup) {
            const timer = setTimeout(() => {
                onCloseLoginSuccessPopup();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showLoginSuccessPopup, onCloseLoginSuccessPopup]);

    return (
        <div className={`min-h-screen flex flex-col ${
            theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}>
            <Navbar onLogout={onLogout} /> {/* Pass onLogout to Navbar */}
            <div className="flex-grow flex flex-col items-center justify-center p-4">
                {/* Removed "Your Homepage Content" and "This is where your main application content will go." */}
                {/* Removed Logout button from here */}

                {/* Render the ExpenseSplitter component here */}
                <ExpenseSplitter />
            </div>

            {/* Login Success Pop-up */}
            {showLoginSuccessPopup && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
                    Welcome, you are logged in!
                    <button onClick={onCloseLoginSuccessPopup} className="ml-4 text-white font-bold">✕</button>
                </div>
            )}
        </div>
    );
}