import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: April 5, 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-6 text-zinc-700">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Data We Collect</h2>
            <p>
              BuildVault collects account details, project content, communications, and billing-related metadata needed to operate the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">How We Use Data</h2>
            <p>
              We use your data to provide platform features, improve matching results, support security monitoring, and deliver billing services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Billing Processors</h2>
            <p>
              Payment details are processed by Stripe. BuildVault does not store full card numbers. Stripe may process personal information according to its own policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Retention and Security</h2>
            <p>
              We retain data as needed for legal, contractual, and service operations. We use reasonable technical and organizational controls to protect account information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Your Rights</h2>
            <p>
              You may request access, correction, or deletion of personal data by contacting support. Some records may be retained where required by law.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4 text-sm font-semibold">
          <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
          <Link href="/settings" className="text-zinc-700 hover:text-zinc-900">Back to Settings</Link>
        </div>
      </main>
    </div>
  );
}