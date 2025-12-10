import React, { useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "./../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function Signup({ onSignupSuccess, onShowLogin }) {
  const { theme } = useContext(ThemeContext);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = { email, full_name: fullName, password, password2 };
      console.log("REGISTER payload:", payload);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/users/register",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("REGISTER response:", res.data);
      setSuccess("Account created. A verification code has been sent.");
      if (onSignupSuccess) onSignupSuccess({ email, phoneNumber });
    } catch (err) {
      console.error("REGISTER error:", err);
      const data = err?.response?.data;
      const msg =
        (data &&
          (data.detail || data.email || data.non_field_errors || data)) ||
        err?.message ||
        "Failed to register";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
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
          <h2 className="text-2xl font-bold">Sign Up</h2>
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="p-2 rounded border"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 rounded border"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
          <input
            type="password"
            placeholder="Confirm password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="p-2 rounded border"
          />
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="p-2 rounded bg-green-600 text-white"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="text-sm text-center mt-2">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={onShowLogin}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
