"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
    setUserId(params.get("userId") || "");
  }, []);

  useEffect(() => {
    async function verify() {
      if (!token || !userId) {
        setStatus("error");
        setMessage("Missing verification details. Please request a new verification email.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setStatus("error");
          setMessage(data.error || "Verification failed. Please request a new verification email.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully. You can now sign in.");
      } catch {
        setStatus("error");
        setMessage("Unable to verify your email right now. Please try again.");
      }
    }

    verify();
  }, [token, userId]);

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900 md:py-16">
      <main className="mx-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold">Email Verification</h1>
        <p className="mt-3 text-sm text-zinc-600">{message}</p>

        {status === "loading" && (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Please wait while we verify your account.
          </div>
        )}

        {status === "success" && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Your account is verified.
          </div>
        )}

        {status === "error" && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Verification could not be completed.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            Go to Login
          </Link>
          <Link href="/reset-password" className="rounded-xl border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-100">
            Reset Password
          </Link>
        </div>
      </main>
    </div>
  );
}