import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { ThemeContext } from "../components/ThemeContext";
import Navbar from "../components/Navbar";

export default function VerificationPage({ email, onVerificationSuccess }) {
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
      setError("No email provided for verification.");
      return;
    }
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }

    setLoadingVerify(true);
    try {
      const payload = { email, otp: code };
      console.log("VERIFY payload:", payload);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/users/verify",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("VERIFY response:", res.data);
      setSuccess("Account verified. Please log in.");
      if (onVerificationSuccess) onVerificationSuccess();
    } catch (err) {
      console.error("VERIFY error:", err);
      const serverData = err?.response?.data;
      const msg =
        serverData && Object.keys(serverData).length
          ? serverData
          : err?.message || "Verification failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    setResendMsg("");
    setLoadingResend(true);
    if (!email) {
      setResendMsg("No email provided to resend the code to.");
      setLoadingResend(false);
      return;
    }
    try {
      console.log("RESEND payload:", { email });
      const res = await axios.post(
        "http://127.0.0.1:8000/api/users/resend",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("RESEND response:", res.data);
      setResendMsg("A new code was sent to your email.");
    } catch (err) {
      console.error("RESEND error:", err);
      const serverData = err?.response?.data;
      const msg =
        serverData && Object.keys(serverData).length
          ? serverData
          : err?.message || "Failed to resend code";
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
          <h2 className="text-2xl font-bold">Verify Your Account</h2>
          <p className="text-sm">
            A verification code has been sent to{" "}
            <strong>{email || "(no email)"}</strong>.
          </p>
          <input
            type="text"
            placeholder="Verification Code"
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
              {loadingVerify ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loadingResend}
              className="text-sm text-blue-500 underline"
            >
              {loadingResend ? "Resending..." : "Resend code"}
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
