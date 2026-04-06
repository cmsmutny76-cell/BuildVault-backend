"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getAuthUser } from "../../lib/web/authStorage";

type SubscriptionStatus = {
  status?: string;
  plan?: string;
  price?: number;
  trialEndsAt?: string;
  daysRemaining?: number;
};

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const user = getAuthUser();
  const token = getAuthToken();

  useEffect(() => {
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    const loadBilling = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/subscription/create?userId=${encodeURIComponent(user.id)}`, {
          method: "GET",
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load billing status");
        }
        setSubscription(data.subscription || null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, [router, token, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
        <main className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-zinc-600">Loading billing status...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Billing Status</h1>
        <p className="mt-2 text-zinc-600">Current subscription details for your BuildVault account.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && (
          <div className="mt-6 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700">
            <p><span className="font-semibold">Status:</span> {subscription?.status || "none"}</p>
            <p><span className="font-semibold">Plan:</span> {subscription?.plan || "free"}</p>
            <p><span className="font-semibold">Price:</span> {typeof subscription?.price === "number" ? `$${subscription.price.toFixed(2)}` : "$0.00"}</p>
            <p><span className="font-semibold">Trial Ends:</span> {subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "N/A"}</p>
            <p><span className="font-semibold">Days Remaining:</span> {typeof subscription?.daysRemaining === "number" ? subscription.daysRemaining : "N/A"}</p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/pricing" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
            Manage Plan
          </Link>
          <Link href="/settings" className="rounded-xl border border-zinc-300 px-4 py-3 text-center text-sm font-semibold text-zinc-800 hover:bg-zinc-50">
            Back to Settings
          </Link>
        </div>
      </main>
    </div>
  );
}