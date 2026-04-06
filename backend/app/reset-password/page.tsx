"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Mode = "request" | "confirm";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const mode: Mode = token ? "confirm" : "request";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const onRequestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || "Could not send reset link.");
        return;
      }

      setMessage(data.message || "If an account exists, a reset link has been sent.");
    } catch {
      setError("Could not send reset link right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirmReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || "Could not reset password.");
        return;
      }

      setMessage(data.message || "Password reset successful. You can now sign in.");
    } catch {
      setError("Could not reset password right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900 md:py-16">
      <main className="mx-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold">{mode === "confirm" ? "Set New Password" : "Reset Password"}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {mode === "confirm"
            ? "Enter a new password to complete your reset."
            : "Enter your email and we will send a password reset link."}
        </p>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        {mode === "request" ? (
          <form className="mt-5 space-y-4" onSubmit={onRequestReset}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={onConfirmReset}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-600">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6">
          <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
}