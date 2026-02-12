import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { register } from "../api/auth";
import { ThemeContext } from "./../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function Signup({ onSignupSuccess, onShowLogin }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const [fullName, setFullName] = useState("");
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
      setError(t("Email is required."));
      return;
    }
    if (password !== password2) {
      setError(t("Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      const payload = { email, full_name: fullName, password, password2 };
      console.log("REGISTER payload:", payload);

      await register(payload);

      console.log("REGISTER success");
      setSuccess(t("Account created. A verification code has been sent."));
      if (onSignupSuccess) onSignupSuccess(email);
    } catch (err) {
      console.error("REGISTER error:", err);
      const data = err?.response?.data;
      const msg =
        (data &&
          (data.detail || data.error || data.email || data.non_field_errors || data)) ||
        err?.message ||
        t("Failed to register");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-white" : "bg-gray-900"
      } dark:text-white text-black`}
    >
      <Navbar minimal={true} />
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold dark:text-white">{t("Sign Up")}</h2>
          <input
            type="text"
            placeholder={t("Full name")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <input
            type="email"
            placeholder={t("Email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <input
            type="password"
            placeholder={t("Password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <input
            type="password"
            placeholder={t("Confirm password")}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400"
          />
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="p-2 rounded bg-blue-600 text-white"
          >
            {loading ? t("Creating...") : t("Create account")}
          </button>
          <p className="text-sm text-center mt-2 dark:text-gray-400">
            {t("Already have an account?")}{" "}
            <span
              className="text-blue-500 cursor-pointer dark:text-blue-400"
              onClick={onShowLogin}
            >
              {t("Login")}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
