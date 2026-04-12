import Link from "next/link";

export default function PricingSuccessPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const free = searchParams?.free === "1";

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Subscription Updated</h1>
        <p className="mt-3 text-zinc-600">
          {free
            ? "Your free plan is active."
            : "Your checkout completed successfully. Your 90-day $10/month introductory pricing is now active."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/billing"
            className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            View Billing Status
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-300 px-4 py-3 text-center text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Continue to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}