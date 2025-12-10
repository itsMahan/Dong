import React, { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const FORCE_SHOW_LOGIN = false;

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (FORCE_SHOW_LOGIN) return false;
    return !!localStorage.getItem("access_token");
  });

  const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);

  useEffect(() => {
    if (FORCE_SHOW_LOGIN) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginSuccessPopup(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    setShowLoginSuccessPopup(false);
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
