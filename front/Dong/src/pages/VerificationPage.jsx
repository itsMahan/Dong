import React, { useState, useContext } from "react";
// import axios from "axios";
import { ThemeContext } from "../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function VerificationPage({ phoneNumber, onVerificationSuccess }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const { theme } = useContext(ThemeContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // --- MOCK API ---
        console.log(`Verifying user with phone: ${phoneNumber} and code: ${code}`);
        if (code === "123456") {
            localStorage.setItem(
                "access_token",
                "mock_access_token_after_verification"
            );
            localStorage.setItem(
                "refresh_token",
                "mock_refresh_token_after_verification"
            );
            onVerificationSuccess();
        } else {
            setError("Invalid verification code. Please try again.");
        }
        // --- END MOCK API ---

        /*
        // --- REAL API (Example) ---
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/users/verify/', {
                phone_number: phoneNumber,
                code,
            });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            onVerificationSuccess();
        } catch (err) {
            setError('Invalid verification code. Please try again.');
        }
        */
    };

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-300 ${
                theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
            }`}
        >
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 w-full max-w-sm md:max-w-md"
                >
                    <h2 className="text-2xl md:text-3xl font-bold">
                        Verify Your Account
                    </h2>

                    <p>
                        A verification code has been sent to your mobile device. (Hint: try
                        123456)
                    </p>
                    <input
                        type="text"
                        placeholder="Verification Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className={`p-2 rounded border focus:outline-none ${
                            theme === "light"
                                ? "bg-white text-black placeholder-gray-500 border-gray-300"
                                : "bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                        }`}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className={`p-2 rounded ${
                            theme === "light"
                                ? "bg-blue-500 text-white"
                                : "bg-blue-700 text-white"
                        }`}
                    >
                        Verify
                    </button>
                </form>
            </div>
        </div>
    );
}