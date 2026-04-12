"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { webApi, type LoginResponse } from "../../lib/web/apiClient";
import { saveAuthSession } from "../../lib/web/authStorage";
import WebPageBrandHeader from "../../components/WebPageBrandHeader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data: LoginResponse = await webApi.login(email, password);

      if (data.success && data.token && data.user) {
        saveAuthSession(data.token, data.user, keepSignedIn);
        router.push("/categories");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-12" style={{ background: 'linear-gradient(135deg, #060d1a 0%, #0f172a 60%, #111827 100%)' }}>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="text-sm font-medium transition-colors" style={{ color: '#9ca3af' }}>
            ← Back
          </Link>
        </div>

        <div className="mb-8">
          <WebPageBrandHeader title="BuildVault" subtitle="Sign in to your account" />
        </div>

        <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}>
          {error && (
            <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold" style={{ color: '#e5e7eb' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{ backgroundColor: '#111827', border: '1px solid #4b5563', color: '#f9fafb' }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold" style={{ color: '#e5e7eb' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{ backgroundColor: '#111827', border: '1px solid #4b5563', color: '#f9fafb' }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#9ca3af' }}>
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: '#ea580c' }}
                />
                Keep me signed in
              </label>
              <Link href="/reset-password" className="font-medium transition-colors" style={{ color: '#fb923c' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-3 text-base font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#ea580c' }}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm" style={{ color: '#6b7280' }}>
            <div className="h-px flex-1" style={{ backgroundColor: '#374151' }} />
            <span className="font-semibold">OR</span>
            <div className="h-px flex-1" style={{ backgroundColor: '#374151' }} />
          </div>

          <Link
            href="/signup"
            className="block w-full rounded-xl py-3 text-center text-base font-semibold transition-colors"
            style={{ border: '1px solid #ea580c', color: '#fb923c' }}
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}


