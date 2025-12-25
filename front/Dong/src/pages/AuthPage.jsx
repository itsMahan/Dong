import React, { useState } from "react";
import Login from "./Login.jsx";
import Signup from "./SignUp.jsx";
import VerificationPage from "./VerificationPage.jsx";

export default function AuthPage() {
  const [currentView, setCurrentView] = useState("login");
  const [signupEmail, setSignupEmail] = useState("");

  const handleShowLogin = () => setCurrentView("login");
  const handleShowSignup = () => setCurrentView("signup");

  const handleSignupSuccess = (email) => {
    setSignupEmail(email);
    setCurrentView("verification");
  };

  const handleVerificationSuccess = () => {
    setCurrentView("login");
  };

  const renderView = () => {
    if (currentView === "login") {
      return (
        <Login onShowSignup={handleShowSignup} />
      );
    } else if (currentView === "signup") {
      return (
        <Signup
          onSignupSuccess={handleSignupSuccess}
          onShowLogin={handleShowLogin}
        />
      );
    } else if (currentView === "verification") {
      return (
        <VerificationPage
          email={signupEmail}
          onVerificationSuccess={handleVerificationSuccess}
        />
      );
    }
    return null;
  };

  return <div>{renderView()}</div>;
}
