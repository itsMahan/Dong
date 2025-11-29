import React, { useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "./../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function Login({ onLogin, onShowSignup }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { theme } = useContext(ThemeContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/token/", {
                phone_number: phoneNumber,
                password,
            });
            localStorage.setItem("access_token", res.data.access);
            localStorage.setItem("refresh_token", res.data.refresh);
            onLogin();
            setError("");
        } catch (err) {
            setError("Invalid phone number or password");
        }
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
                        Login
                    </h2>

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

                    {error && <p className="text-red-500">{error}</p>}

                    <button
                        type="submit"
                        className={`p-2 rounded ${
                            theme === "light"
                                ? "bg-blue-500 text-white"
                                : "bg-blue-700 text-white"
                        }`}
                    >
                        Login
                    </button>

                    <p className="text-sm text-center mt-2">
                        Don't have an account?{" "}
                        <span
                            className="text-blue-500 cursor-pointer"
                            onClick={onShowSignup}
                        >
                            Sign up
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}