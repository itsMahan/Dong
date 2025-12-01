import React, { useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../components/ThemeContext";
import ExpenseSplitter from "../components/ExpenseSplitter";

export default function HomePage({ onLogout, showLoginSuccessPopup, onCloseLoginSuccessPopup }) {
    const { theme } = useContext(ThemeContext);


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
            <Navbar onLogout={onLogout} />
            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <ExpenseSplitter />
            </div>


            {showLoginSuccessPopup && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
                    Welcome, you are logged in!
                    <button onClick={onCloseLoginSuccessPopup} className="ml-4 text-white font-bold">✕</button>
                </div>
            )}
        </div>
    );
}