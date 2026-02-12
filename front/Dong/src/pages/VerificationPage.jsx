import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { verify, resendCode } from "../api/auth";
import { ThemeContext } from "../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function VerificationPage({ email, onVerificationSuccess }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    // Start countdown on component mount and every time countdown changes if it's > 0
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]); // Rerun effect when countdown changes

  useEffect(() => {
    console.log("VerificationPage email:", email);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError(t("No email provided for verification."));
      return;
    }
    if (!code) {
      setError(t("Please enter the verification code."));
      return;
    }

    setLoadingVerify(true);
    try {
      const payload = { email, otp: code };
      const responseData = await verify(payload);
      setSuccess(t("Account verified. Logging you in..."));
      if (onVerificationSuccess) onVerificationSuccess(responseData.user);
    } catch (err) {
      const serverData = err?.response?.data;
      const msg =
        serverData && Object.keys(serverData).length
          ? serverData
          : err?.message || t("Verification failed");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    setResendMsg("");
    setLoadingResend(true);
    if (!email) {
      setResendMsg(t("No email provided to resend the code to."));
      setLoadingResend(false);
      return;
    }
    try {
      await resendCode(email);
      setResendMsg(t("A new code was sent to your email."));
      setCountdown(120); // Reset timer
    } catch (err) {
      const serverData = err?.response?.data;
      const msg =
        serverData && Object.keys(serverData).length
          ? serverData
          : err?.message || t("Failed to resend code");
      setResendMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900"
      } text-black dark:text-white`}
    >
      <Navbar minimal={true} />
      <div className="flex flex-1 items-center justify-center p-4">
        <div
          className={`w-full max-w-md p-8 space-y-6 rounded-xl shadow-lg ${
            theme === "light" ? "bg-white" : "bg-gray-800"
          }`}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold">{t("Verify Your Account")}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("A verification code has been sent to")}{" "}
              <strong className="font-medium text-gray-800 dark:text-gray-200">
                {email || t("(no email)")}
              </strong>
              .
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="sr-only">
                {t("Verification Code")}
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                placeholder={t("Verification Code")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full text-center p-3 text-lg tracking-[1em] rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center whitespace-pre-wrap">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-500 text-sm text-center">{success}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loadingVerify}
                className="w-full p-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {loadingVerify ? t("Verifying...") : t("Verify")}
              </button>
            </div>
          </form>
          <div className="text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              {t("Didn't receive the code?")}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={loadingResend || countdown > 0}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingResend
                ? t("Resending...")
                : countdown > 0
                ? `${t("Resend code in")} (${Math.floor(
                    countdown / 60
                  )}:${(countdown % 60).toString().padStart(2, "0")})`
                : t("Resend code")}
            </button>
            {resendMsg && (
              <p className="mt-2 text-sm text-green-500 whitespace-pre-wrap">
                {resendMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
