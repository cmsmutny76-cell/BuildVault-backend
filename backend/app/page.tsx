"use client";

import Link from "next/link";
import WebPageBrandHeader from "../components/WebPageBrandHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex flex-col items-center justify-center px-6">
      {/* Container */}
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <WebPageBrandHeader
          title="BuildVault"
          subtitle="Construction Project Management"
          textClassName="text-white"
          subtitleClassName="text-zinc-400"
        />

        {/* Auth Entry */}
        <div className="w-full">
          <Link
            href="/login"
            className="w-full block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            Sign In / Create Account
          </Link>
        </div>

        {/* Footer text */}
        <p className="text-center text-zinc-500 text-sm">
          Connect with contractors, manage projects, and secure your investments.
        </p>

          {/* Intro pricing text */}
          <div className="text-center mt-1">
            <p className="text-white text-base font-semibold">
              $10 / month for your first 90 days for all paid subscriptions
            </p>
            <p className="text-zinc-400 text-xs mt-1">
              Then $49.99/mo (Contractor Plan) or $99.99/mo (Business Plan) - cancel anytime.
            </p>
          </div>
      </div>
    </div>
  );
}
