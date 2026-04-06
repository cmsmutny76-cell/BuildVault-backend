'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuthSession } from '../../lib/web/authStorage';
import { getAuthUser } from '../../lib/web/authStorage';

export default function SettingsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [availability, setAvailability] = useState<'available' | 'busy' | 'booked'>('available');
  const user = getAuthUser();
  const isContractor = user?.userType === 'contractor';

  const handleLogout = () => {
    clearAuthSession();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-xl font-bold text-blue-400">🏗️ Construction Lead</Link>
          <div className="flex gap-4 items-center">
            <Link href="/feed" className="text-slate-300 hover:text-white transition">Feed</Link>
            <Link href="/categories" className="text-slate-300 hover:text-white transition">Categories</Link>
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
        <h1 className="text-4xl font-bold text-white mb-2">⚙️ Settings</h1>
        <p className="text-slate-400 mb-6">Manage your preferences and account</p>

        <div className="space-y-6">
          <section className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-slate-400 text-sm">Receive notifications for new leads and updates</p>
                </div>
                <button onClick={() => setNotifications(!notifications)} className={`px-4 py-2 rounded-md text-sm font-semibold ${notifications ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{notifications ? 'On' : 'Off'}</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Alerts</p>
                  <p className="text-slate-400 text-sm">Get email notifications for important updates</p>
                </div>
                <button onClick={() => setEmailAlerts(!emailAlerts)} className={`px-4 py-2 rounded-md text-sm font-semibold ${emailAlerts ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{emailAlerts ? 'On' : 'Off'}</button>
              </div>
            </div>
          </section>

          <section className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">App Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto-Save Projects</p>
                  <p className="text-slate-400 text-sm">Automatically save project changes</p>
                </div>
                <button onClick={() => setAutoSave(!autoSave)} className={`px-4 py-2 rounded-md text-sm font-semibold ${autoSave ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{autoSave ? 'On' : 'Off'}</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-slate-400 text-sm">Use dark theme (coming soon)</p>
                </div>
                <button className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-700 text-slate-400 cursor-not-allowed">Coming Soon</button>
              </div>
            </div>
          </section>

          {isContractor && (
            <section className="bg-white/10 border border-white/20 rounded-xl p-6">
              <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-2">Contractor Availability</h2>
              <p className="text-slate-400 text-sm mb-4">Current status influences AI matching results.</p>
              <div className="flex gap-2">
                {(['available', 'busy', 'booked'] as const).map((status) => (
                  <button key={status} onClick={() => setAvailability(status)} className={`px-4 py-2 rounded-full text-sm capitalize ${availability === status ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {status}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">Account</h2>
            <div className="space-y-2 text-white">
              <div className="flex justify-between p-3 rounded-md bg-slate-900/30"><span>Change Password</span><span>›</span></div>
              <Link href="/billing" className="flex justify-between p-3 rounded-md bg-slate-900/30 hover:bg-slate-900/50"><span>Billing Status</span><span>›</span></Link>
              <Link href="/pricing" className="flex justify-between p-3 rounded-md bg-slate-900/30 hover:bg-slate-900/50"><span>Manage Subscription</span><span>›</span></Link>
              <Link href="/privacy" className="flex justify-between p-3 rounded-md bg-slate-900/30 hover:bg-slate-900/50"><span>Privacy Policy</span><span>›</span></Link>
              <Link href="/terms" className="flex justify-between p-3 rounded-md bg-slate-900/30 hover:bg-slate-900/50"><span>Terms of Service</span><span>›</span></Link>
            </div>
          </section>

          <section className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">Support</h2>
            <div className="space-y-2 text-white">
              <div className="flex justify-between p-3 rounded-md bg-slate-900/30"><span>Help Center</span><span>›</span></div>
              <div className="flex justify-between p-3 rounded-md bg-slate-900/30"><span>Contact Support</span><span>›</span></div>
              <div className="flex justify-between p-3 rounded-md bg-slate-900/30"><span>Report a Bug</span><span>›</span></div>
            </div>
          </section>

          <div className="text-center text-slate-400 text-sm">
            <p>Version 1.0.0</p>
            <p>© 2026 BuildVault</p>
          </div>

          <button onClick={handleLogout} className="w-full px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold rounded-lg border border-red-500/30">Log Out</button>
        </div>
      </div>
    </div>
  );
}
