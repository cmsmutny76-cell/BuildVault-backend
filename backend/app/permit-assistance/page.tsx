'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PermitAssistancePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-xl font-bold text-blue-400">🏗️ Construction Lead</Link>
          <div className="flex gap-4 items-center">
            <Link href="/feed" className="text-slate-300 hover:text-white transition">Feed</Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>
            <Link href="/messages" className="text-slate-300 hover:text-white transition">Messages</Link>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-slate-300 hover:text-white transition">☰</button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">👤 Profile</Link>
                  <Link href="/photo-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">📸 Photo Analysis</Link>
                  <Link href="/blueprint-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">📐 Blueprint Analysis</Link>
                  <Link href="/building-codes" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">🏛️ Building Codes</Link>
                  <Link href="/price-comparison" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">💰 Price Comparison</Link>
                  <Link href="/find-contractors" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">👷 Find Contractors</Link>
                  <Link href="/permit-assistance" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">📋 Permit Assistance</Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">⚙️ Settings</Link>
                  <Link href="/help" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">ℹ️ Help & Support</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/feed" className="text-yellow-400 font-semibold">← Back</Link>
          <h1 className="text-4xl font-bold text-white mt-4">Permit Assistance</h1>
        </div>

        <div className="bg-white/10 border border-yellow-600/30 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">📋 Building Permit Assistance</h2>
          <p className="text-slate-300 mb-4">Streamline your permit application process with expert guidance.</p>
          <div className="space-y-2 text-slate-400 mb-5">
            <p>✓ Permit requirement lookup</p>
            <p>✓ Application preparation</p>
            <p>✓ Document checklist</p>
            <p>✓ Status tracking</p>
            <p>✓ Expert consultation</p>
          </div>
          <span className="inline-block bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-md font-semibold">Coming Soon</span>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <p className="text-slate-400 text-center">This feature will guide you through the permit application process, ensuring you have all required documentation and approvals.</p>
        </div>
      </div>
    </div>
  );
}
