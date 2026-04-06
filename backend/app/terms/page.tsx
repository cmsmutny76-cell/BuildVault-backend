import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: April 5, 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-6 text-zinc-700">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Platform Access</h2>
            <p>
              BuildVault provides software tools for project management, matching, and collaboration. You are responsible for maintaining account security and lawful use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Subscriptions and Billing</h2>
            <p>
              Paid accounts are billed monthly through Stripe. Trials and plan terms are presented at checkout. You may cancel according to your plan settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">User Content</h2>
            <p>
              You retain ownership of your content. By submitting project data, you grant BuildVault a limited license to process and display that content for service delivery.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Prohibited Conduct</h2>
            <p>
              Fraud, abuse, unauthorized scraping, and illegal activity are prohibited. BuildVault may suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Liability Limits</h2>
            <p>
              The platform is provided as-is to the extent allowed by law. BuildVault is not liable for indirect or consequential damages resulting from platform use.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4 text-sm font-semibold">
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
          <Link href="/settings" className="text-zinc-700 hover:text-zinc-900">Back to Settings</Link>
        </div>
      </main>
    </div>
  );
}