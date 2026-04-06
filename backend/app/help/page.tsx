'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const onboardingSlides = [
  'Slide 1: Welcome + choose your user category (contractor, homeowner, property manager).',
  'Slide 2: Profile setup checklist for your selected category.',
  'Slide 3: How to create and track leads, estimates, and project updates.',
  'Slide 4: Messaging workflow with clients/teams and notification settings.',
  'Slide 5: Save, review, and export key project details before going live.',
];

const faqItems = [
  {
    question: 'How do I create my first lead?',
    answer: 'Open the dashboard, tap Create Lead, complete required fields, and save to start tracking immediately.',
  },
  {
    question: 'How do I send an estimate to a client?',
    answer: 'Create or open a quote, confirm pricing and scope, then use the Send action to email the estimate PDF.',
  },
  {
    question: 'Can I update project status after sharing?',
    answer: 'Yes. Project status and notes can be updated anytime, and changes are reflected in your project timeline.',
  },
  {
    question: 'What if I need help quickly?',
    answer: 'Use Contact Support for AI guidance first, then escalate to human support when live answering is enabled.',
  },
];

const videoStoryboard = [
  'Scene 1 (0:00-0:20): BuildVault intro and who the app is for.',
  'Scene 2 (0:20-1:00): Category selection and account setup walkthrough.',
  'Scene 3 (1:00-2:00): Creating leads and organizing project information.',
  'Scene 4 (2:00-2:45): Building and sending estimates.',
  'Scene 5 (2:45-3:30): Messaging, updates, and follow-up workflow.',
  'Scene 6 (3:30-4:00): Support options (AI + upcoming live support) and next steps.',
];

export default function HelpPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <h1 className="text-4xl font-bold text-white mb-2">ℹ️ Help & Support</h1>
        <p className="text-slate-400 mb-6">Find answers and get assistance</p>

        <div className="bg-white/10 border border-yellow-600/30 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-5">❓ How Can We Help?</h2>

          <div className="space-y-5">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-white font-semibold">📚 Getting Started Guide</h3>
              <p className="text-slate-400 text-sm mt-1">Interactive page-by-page presentation flow based on user category:</p>
              {onboardingSlides.map((slide) => (
                <p key={slide} className="text-slate-300 text-sm mt-1">• {slide}</p>
              ))}
            </div>

            <div className="border-b border-white/10 pb-4">
              <h3 className="text-white font-semibold">💬 Contact Support</h3>
              <p className="text-slate-400 text-sm mt-1">AI-first support for app questions, with live answering service routing planned.</p>
              <p className="text-slate-300 text-sm mt-1">• Current live channel: catalystcreations86@gmail.com</p>
            </div>

            <div className="border-b border-white/10 pb-4">
              <h3 className="text-white font-semibold">📖 FAQs</h3>
              {faqItems.map((item) => (
                <div key={item.question} className="mt-2">
                  <p className="text-slate-300 text-sm"><span className="text-yellow-400 font-semibold">Q:</span> {item.question}</p>
                  <p className="text-slate-300 text-sm"><span className="text-yellow-400 font-semibold">A:</span> {item.answer}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-white font-semibold">🎥 Video Tutorials</h3>
              <p className="text-slate-400 text-sm mt-1">Video tutorial created as a production-ready storyboard outline:</p>
              {videoStoryboard.map((scene) => (
                <p key={scene} className="text-slate-300 text-sm mt-1">• {scene}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-600/30 rounded-xl p-6">
          <h2 className="text-yellow-300 text-xl font-bold mb-3">Need Immediate Help?</h2>
          <p className="text-slate-300">Email: catalystcreations86@gmail.com</p>
          <p className="text-slate-300">Phone: Not currently available</p>
          <p className="text-slate-300">Hours: Mon-Fri 8am-6pm EST</p>
        </div>
      </div>
    </div>
  );
}
