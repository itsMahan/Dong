import React, { useState, useContext } from "react";
// import axios from "axios";
import { ThemeContext } from "./../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function Signup({ onSignupSuccess, onShowLogin }) {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { theme } = useContext(ThemeContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            setError("Passwords do not match");
            return;
        }

        // --- MOCK API ---
        console.log("Simulating registration for:", {
            fullName,
            email,
            phoneNumber,
        });
        setSuccess("Account created successfully! Please verify.");
        setError("");
        onSignupSuccess(phoneNumber); // Pass phone number for verification
        // --- END MOCK API ---

        /*
        // --- REAL API (Example) ---
        try {
            await axios.post("http://127.0.0.1:8000/api/users/register", {
                full_name: fullName,
                email,
                phone_number: phoneNumber,
                password,
                password2,
            });
            setSuccess("Account created successfully! Please verify.");
            setError("");
            onSignupSuccess(phoneNumber); // Switch to verification page
        } catch (err) {
            setError("Failed to register. Try a different phone number.");
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
                    <h2 className="text-2xl md:text-3xl font-bold cursor-pointer">
                        Sign Up
                    </h2>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className={`p-2 rounded border focus:outline-none ${
                            theme === "light"
                                ? "bg-white text-black placeholder-gray-500 border-gray-300"
                                : "bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                        }`}
                    />

                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className={`p-2 rounded border focus:outline-none ${
                            theme === "light"
                                ? "bg-white text-black placeholder-gray-500 border-gray-300"
                                : "bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                        }`}
                    />

                    <input
                        type="email"
                        placeholder="Email (Optional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`p-2 rounded border focus:outline-none ${
                            theme === "light"
                                ? "bg-white text-black placeholder-gray-500 border-gray-300"
                                : "bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                        }`}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`p-2 rounded border focus:outline-none ${
                            theme === "light"
                                ? "bg-white text-black placeholder-gray-500 border-gray-300"
                                : "bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                        }`}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        className={`p-2 rounded border focus:outline-none ${
                            theme === "light"
                                ? "bg-white text-black placeholder-gray-500 border-gray-300"
                                : "bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                        }`}
                    />

                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}

                    <button
                        type="submit"
                        className={`p-2 rounded ${
                            theme === "light"
                                ? "bg-blue-500 text-white"
                                : "bg-blue-700 text-white"
                        }`}
                    >
                        Sign Up
                    </button>
                    <p className="text-sm text-center mt-2">
                        have an account?{" "}
                        <span
                            className="text-blue-500 cursor-pointer"
                            onClick={onShowLogin}
                        >
                            Log in
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}