import Link from "next/link";

export default function PricingCancelPage() {
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Checkout Canceled</h1>
        <p className="mt-3 text-zinc-600">
          No changes were made to your subscription. You can return to pricing any time.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/pricing"
            className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Pricing
          </Link>
          <Link
            href="/settings"
            className="rounded-xl border border-zinc-300 px-4 py-3 text-center text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Back to Settings
          </Link>
        </div>
      </main>
    </div>
  );
}