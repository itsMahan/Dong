import React, { useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import TricountsPage from "./pages/TricountsPage";
import HomePage from "./pages/HomePage";
import CreateGroupModal from "./components/CreateGroupModal";
import { UserContext } from "./components/UserContext";

export default function App() {
  const { user, setUser, logout } = useContext(UserContext);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  return (
    <>
      <Routes>
        {user ? (
          <>
            <Route
              path="/"
              element={
                <TricountsPage
                  onLogout={logout}
                  onCreateGroup={() => setShowCreateGroupModal(true)}
                />
              }
            />
            <Route
              path="/group/:groupId"
              element={<HomePage onLogout={logout} />}
            />
          </>
        ) : (
          <Route path="*" element={<AuthPage onLogin={setUser} />} />
        )}
      </Routes>
      <CreateGroupModal
        open={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />
    </>
  );
}
