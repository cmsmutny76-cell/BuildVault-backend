"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "../../lib/web/authStorage";

type TierKey = "free" | "pro49" | "pro99";

type PlanCard = {
  key: TierKey;
  title: string;
  price: string;
  standardPrice?: string;
  subtitle: string;
  features: string[];
};

const PLANS: PlanCard[] = [
  {
    key: "free",
    title: "Free Access",
    price: "$0",
    subtitle: "Homeowners and employment seekers",
    features: [
      "Post projects and receive contractor interest",
      "Access messages and estimate responses",
      "Basic platform workflows",
    ],
  },
  {
    key: "pro49",
    title: "Contractor Plan",
    price: "$10.00/mo for 90 days",
    standardPrice: "$49.99/mo after intro period",
    subtitle: "Contractors, landscapers, and trade schools",
    features: [
      "AI matching and lead visibility",
      "Profile placement in search and recommendations",
      "90-day introductory billing at $10 per month",
    ],
  },
  {
    key: "pro99",
    title: "Business Plan",
    price: "$10.00/mo for 90 days",
    standardPrice: "$99.99/mo after intro period",
    subtitle: "Commercial and portfolio operators",
    features: [
      "Commercial pipeline and advanced routing",
      "Priority account visibility and matching",
      "90-day introductory billing at $10 per month",
    ],
  },
];

const USER_TIER_BY_TYPE: Record<string, TierKey> = {
  homeowner: "free",
  employment_seeker: "free",
  contractor: "pro49",
  landscaper: "pro49",
  school: "pro49",
  commercial_builder: "pro99",
  multi_family_owner: "pro99",
  apartment_owner: "pro99",
  developer: "pro99",
};

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<TierKey | null>(null);
  const [error, setError] = useState("");
  const user = getAuthUser();

  const userTier = useMemo<TierKey>(() => {
    if (!user) return "free";
    return USER_TIER_BY_TYPE[user.userType] || "free";
  }, [user]);

  const handleCheckout = async (planKey: TierKey) => {
    setError("");

    if (!user) {
      router.push("/login");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          planKey,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to start checkout");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl as string;
        return;
      }

      router.push("/pricing/success");
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 px-4 py-8 md:py-12">
      <main className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/settings" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← Back to Settings
          </Link>
          <Link href="/billing" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900">
            View Billing Status
          </Link>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">BuildVault Pricing</h1>
          <p className="mt-2 text-zinc-600">
            Choose the plan that matches your account type. Paid plans start at $10/month for 90 days, then continue at the standard monthly rate.
          </p>
          {!user && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Sign in to activate or upgrade your subscription.
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = userTier === plan.key;
            const isLoading = loadingPlan === plan.key;

            return (
              <article
                key={plan.key}
                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                  isCurrent ? "border-blue-500" : "border-zinc-200"
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{plan.title}</h2>
                    <p className="text-sm text-zinc-500">{plan.subtitle}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-800">
                    {plan.price}
                  </span>
                </div>
                {plan.standardPrice && (
                  <p className="mb-3 text-xs font-medium text-zinc-500">{plan.standardPrice}</p>
                )}

                <ul className="space-y-2 text-sm text-zinc-700">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={isLoading || isCurrent}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading
                    ? "Starting..."
                    : isCurrent
                    ? "Current Plan"
                    : plan.key === "free"
                    ? "Activate Free"
                    : "Start Checkout"}
                </button>
              </article>
            );
          })}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          <p>
            Questions about billing? Review our <Link href="/terms" className="font-semibold text-blue-600 hover:text-blue-700">Terms of Service</Link>{" "}
            and <Link href="/privacy" className="font-semibold text-blue-600 hover:text-blue-700">Privacy Policy</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}