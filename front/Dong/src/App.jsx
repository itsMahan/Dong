import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import TricountsPage from "./pages/TricountsPage";
import HomePage from "./pages/HomePage";
import CreateGroupModal from "./components/CreateGroupModal";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("access_token");
  });

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
  };

  return (
    <>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route
              path="/"
              element={
                <TricountsPage
                  onLogout={handleLogout}
                  onCreateGroup={() => setShowCreateGroupModal(true)}
                />
              }
            />
            <Route path="/group/:groupId" element={<HomePage onLogout={handleLogout} />} />
          </>
        ) : (
          <Route path="*" element={<AuthPage onLogin={handleLogin} />} />
        )}
      </Routes>
      <CreateGroupModal
        open={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />
    </>
  );
}
