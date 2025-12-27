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
      console.log("VERIFY payload:", payload);

      await verify(payload);

      console.log("VERIFY success");
      setSuccess(t("Account verified. Please log in."));
      if (onVerificationSuccess) onVerificationSuccess();
    } catch (err) {
      console.error("VERIFY error:", err);
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
      console.log("RESEND payload:", { email });
      await resendCode(email);
      console.log("RESEND success");
      setResendMsg(t("A new code was sent to your email."));
    } catch (err) {
      console.error("RESEND error:", err);
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
          <h2 className="text-2xl font-bold">{t("Verify Your Account")}</h2>
          <p className="text-sm">
            {t("A verification code has been sent to")}{" "}
            <strong>{email || t("(no email)")}</strong>.
          </p>
          <input
            type="text"
            placeholder={t("Verification Code")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="p-2 rounded border"
          />
          {error && <p className="text-red-500 whitespace-pre-wrap">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loadingVerify}
              className="p-2 rounded bg-blue-600 text-white"
            >
              {loadingVerify ? t("Verifying...") : t("Verify")}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loadingResend}
              className="text-sm text-blue-500 underline"
            >
              {loadingResend ? t("Resending...") : t("Resend code")}
            </button>
          </div>
          {resendMsg && (
            <p className="text-sm text-gray-400 whitespace-pre-wrap">
              {resendMsg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
