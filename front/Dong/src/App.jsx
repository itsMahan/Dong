import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

export default function App() {
    // Temporarily set isLoggedIn to true to directly view HomePage for development
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Changed from !!localStorage.getItem("access_token")
    const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false); // New state for pop-up

    const handleLogin = () => {
        setIsLoggedIn(true);
        setShowLoginSuccessPopup(true); // Show pop-up on successful login
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsLoggedIn(false);
        setShowLoginSuccessPopup(false); // Hide pop-up on logout
    };

    const handleCloseLoginSuccessPopup = () => {
        setShowLoginSuccessPopup(false);
    };

    return isLoggedIn ? (
        <HomePage
            onLogout={handleLogout}
            showLoginSuccessPopup={showLoginSuccessPopup}
            onCloseLoginSuccessPopup={handleCloseLoginSuccessPopup}
        />
    ) : (
        <AuthPage onLogin={handleLogin} />
    );
}