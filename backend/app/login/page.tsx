"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { webApi, type LoginResponse } from "../../lib/web/apiClient";
import { saveAuthSession } from "../../lib/web/authStorage";

const DEMO_ACCOUNT_GROUPS = [
  {
    title: "Free",
    accounts: [
      { label: "Homeowner", email: "homeowner@test.com" },
      { label: "Employment Seeker", email: "employment@test.com" },
    ],
  },
  {
    title: "$49.99 / Month",
    accounts: [
      { label: "Contractor", email: "contractor@test.com" },
      { label: "Landscaper", email: "landscaper@test.com" },
      { label: "Trade School", email: "school@test.com" },
    ],
  },
  {
    title: "$99.99 / Month",
    accounts: [
      { label: "Commercial Builder", email: "commercialbuilder@test.com" },
      { label: "Multi-Family Owner", email: "multifamily@test.com" },
      { label: "Apartment Owner", email: "apartmentowner@test.com" },
      { label: "Developer", email: "developer@test.com" },
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("homeowner@test.com");
  const [password, setPassword] = useState("password123");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

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
    <div className="min-h-screen bg-zinc-100 text-zinc-900 px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Back
          </Link>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center">
            <span className="text-4xl">🏗️</span>
          </div>
          <h1 className="text-5xl font-bold text-zinc-900">BuildVault</h1>
          <p className="mt-2 text-lg text-zinc-500">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-600">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-400 accent-blue-600"
                />
                Keep me signed in
              </label>
              <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="font-semibold">OR</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <Link
            href="/signup"
            className="block w-full rounded-xl border-2 border-blue-500 py-3 text-center text-lg font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Create New Account
          </Link>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Demo Accounts</p>
                <p className="mt-1 text-blue-800">Click any account to autofill credentials.</p>
              </div>
              <p className="font-medium italic">Password: password123</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {DEMO_ACCOUNT_GROUPS.map((group) => (
                <div key={group.title} className="rounded-lg border border-blue-200 bg-white/70 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">{group.title}</p>
                  <div className="space-y-2">
                    {group.accounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => fillDemoAccount(account.email)}
                        className="flex w-full items-start justify-between rounded-lg border border-blue-100 bg-white px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-100"
                      >
                        <span>
                          <span className="block font-semibold text-zinc-900">{account.label}</span>
                          <span className="block text-xs text-zinc-600">{account.email}</span>
                        </span>
                        <span className="ml-3 text-blue-600">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
