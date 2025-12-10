import React, { useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "./../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function Login({ onLogin, onShowSignup }) {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      if (onLogin) onLogin();
    } catch (err) {
      console.error("LOGIN error:", err);

      const resp = err?.response;
      if (
        resp &&
        typeof resp.data === "string" &&
        resp.data.startsWith("<!DOCTYPE html>")
      ) {
        setError("Server error. Check backend logs (500).");
      } else {
        const msg =
          resp?.data?.detail ||
          resp?.data ||
          err?.message ||
          "Invalid email or password";
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } text-black`}
    >
      <Navbar />
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold">Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 rounded border"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 rounded border"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="p-2 rounded bg-blue-600 text-white"
          >
            {loading ? "Logging in..." : "Login"}
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
