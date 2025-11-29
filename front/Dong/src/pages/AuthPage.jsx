import React, { useState } from 'react';
import Login from './Login';
import Signup from './SignUp';

export default function AuthPage({ onLogin }) {
    const [showLogin, setShowLogin] = useState(true); // State to toggle between Login and Signup

    const handleShowSignup = () => setShowLogin(false);
    const handleShowLogin = () => setShowLogin(true);

    const handleSignupSuccess = (phoneNumber) => {
        // After successful signup, typically you'd switch to login or a verification page.
        // For this example, we'll switch back to the login form.
        handleShowLogin();
    };

    return (
        <div>
            {showLogin ? (
                <Login onLogin={onLogin} onShowSignup={handleShowSignup} />
            ) : (
                <Signup onSignupSuccess={handleSignupSuccess} onShowLogin={handleShowLogin} />
            )}
        </div>
    );
}