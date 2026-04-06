"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex flex-col items-center justify-center px-6">
      {/* Container */}
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
        {/* Logo */}
        <div className="w-96 h-96 flex items-center justify-center">
          <Image
            src="/buildvault-logo-professional.png"
            alt="BuildVault Logo"
            width={600}
            height={600}
            priority
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold">BuildVault</h1>
          <p className="mt-2 text-zinc-400">Construction Project Management</p>
        </div>

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
      </div>
    </div>
  );
}
