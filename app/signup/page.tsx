"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WebUserType } from "../../lib/web/authStorage";

type AccountOption = {
  userType: WebUserType;
  label: string;
  description: string;
  priceLabel: string;
  priceValue: number;
  group: "free" | "pro49" | "pro99";
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  {
    userType: "homeowner",
    label: "Homeowner",
    description: "I need construction work done",
    priceLabel: "Free",
    priceValue: 0,
    group: "free",
  },
  {
    userType: "employment_seeker",
    label: "Employment Seeker",
    description: "I am looking for work opportunities",
    priceLabel: "Free",
    priceValue: 0,
    group: "free",
  },
  {
    userType: "contractor",
    label: "Contractor",
    description: "I provide construction services",
    priceLabel: "$49.99/month",
    priceValue: 49.99,
    group: "pro49",
  },
  {
    userType: "supplier",
    label: "Supplier",
    description: "I supply materials, products, or jobsite deliveries",
    priceLabel: "Free",
    priceValue: 0,
    group: "free",
  },
  {
    userType: "landscaper",
    label: "Landscaper",
    description: "I provide landscaping and outdoor services",
    priceLabel: "$49.99/month",
    priceValue: 49.99,
    group: "pro49",
  },
  {
    userType: "school",
    label: "Trade School",
    description: "We train students for skilled trade careers",
    priceLabel: "$49.99/month",
    priceValue: 49.99,
    group: "pro49",
  },
  {
    userType: "commercial_builder",
    label: "Commercial Builder",
    description: "We build commercial projects and facilities",
    priceLabel: "$99.99/month",
    priceValue: 99.99,
    group: "pro99",
  },
  {
    userType: "multi_family_owner",
    label: "Multi-Family Owner",
    description: "We manage condos, duplexes, and multi-unit properties",
    priceLabel: "$99.99/month",
    priceValue: 99.99,
    group: "pro99",
  },
  {
    userType: "apartment_owner",
    label: "Apartment Owner",
    description: "We manage apartment communities and portfolios",
    priceLabel: "$99.99/month",
    priceValue: 99.99,
    group: "pro99",
  },
  {
    userType: "developer",
    label: "Developer",
    description: "We develop residential, commercial, or mixed-use projects",
    priceLabel: "$99.99/month",
    priceValue: 99.99,
    group: "pro99",
  },
];

const ACCOUNT_GROUPS: Array<{ key: AccountOption["group"]; title: string; subtitle: string }> = [
  { key: "free", title: "Free Access", subtitle: "Homeowners, job seekers, and suppliers" },
  { key: "pro49", title: "$49.99 / Month", subtitle: "Field services and career partners" },
  { key: "pro99", title: "$99.99 / Month", subtitle: "Commercial and portfolio operators" },
];

function getSelectedAccountOption(userType: WebUserType) {
  return ACCOUNT_OPTIONS.find((option) => option.userType === userType) ?? ACCOUNT_OPTIONS[0];
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<WebUserType>("homeowner");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedAccount = getSelectedAccountOption(userType);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    console.info("[signup-trace] submit handler invoked", {
      step,
      email,
      userType,
      hasFullName: Boolean(fullName.trim()),
      hasPassword: Boolean(password),
    });
    
    if (step === 1) {
      console.info("[signup-trace] returning early at step 1; advancing to step 2", {
        step,
      });
      setStep(2);
      return;
    }

    setSubmitting(true);
    
    try {
      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      const lastName = rest.join(" ") || "User";
      const registrationPath = "/api/users/register";
      const resolvedRegistrationUrl =
        typeof window !== "undefined"
          ? new URL(registrationPath, window.location.origin).toString()
          : registrationPath;

      console.info("[signup-trace] executing registration fetch", {
        step,
        registrationPath,
        resolvedRegistrationUrl,
        origin: typeof window !== "undefined" ? window.location.origin : null,
      });

      const response = await fetch(registrationPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccess(data.message || "Account created successfully.");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <span className="mr-2">←</span>
          Back
        </Link>

        {/* Form container */}
        <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-8">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-zinc-400 mb-6">
            {step === 1 ? "Tell us about yourself" : "Set up your credentials"}
          </p>

          {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">{success}</div>}

          <form className="space-y-4" onSubmit={onSubmit}>
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-3">Choose account type:</label>
                  <div className="space-y-5">
                    {ACCOUNT_GROUPS.map((group) => (
                      <div key={group.key} className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
                        <div className="mb-3 flex items-baseline justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">{group.title}</h2>
                            <p className="text-xs text-zinc-400">{group.subtitle}</p>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {ACCOUNT_OPTIONS.filter((option) => option.group === group.key).map((option) => {
                            const isSelected = userType === option.userType;
                            return (
                              <button
                                key={option.userType}
                                type="button"
                                onClick={() => setUserType(option.userType)}
                                className={`rounded-xl border p-4 text-left transition-colors ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-500/10"
                                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-white">{option.label}</p>
                                    <p className="mt-1 text-xs text-zinc-400">{option.description}</p>
                                  </div>
                                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isSelected ? "bg-orange-500 text-white" : "bg-zinc-700 text-zinc-300"}`}>
                                    {option.priceLabel}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!fullName}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors mt-6"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-zinc-700/50 border border-zinc-600 text-sm text-zinc-300 mb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span><span className="font-medium">{fullName}</span> • {selectedAccount.label}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${selectedAccount.priceValue === 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-orange-500/20 text-orange-300"}`}>
                      {selectedAccount.priceLabel}
                    </span>
                  </div>
                </div>

                {selectedAccount.priceValue > 0 && (
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {selectedAccount.priceLabel}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-zinc-400 mt-1">At least 8 characters</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-zinc-600 hover:border-zinc-500 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !email || !password}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {submitting ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-zinc-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Info note */}
        <div className="mt-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-600 text-sm text-zinc-400">
          <p className="text-xs">
            Homeowners and employment seekers have free access. Professional accounts have paid subscription options.
          </p>
        </div>
      </div>
    </div>
  );
}
