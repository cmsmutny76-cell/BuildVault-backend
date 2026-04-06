'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  {
    id: 'residential',
    title: 'Residential',
    subtitle: 'Homes & Single-Family',
    icon: '🏠',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    dashboardUrl: '/category/residential',
  },
  {
    id: 'commercial',
    title: 'Commercial',
    subtitle: 'Business & Retail',
    icon: '🏢',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    dashboardUrl: '/category/commercial',
  },
  {
    id: 'multi-family',
    title: 'Multi-Family',
    subtitle: 'Condos & Duplexes',
    icon: '🏘️',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    dashboardUrl: '/category/multi-family',
  },
  {
    id: 'apartment',
    title: 'Apartment',
    subtitle: 'Complex & High-Rise',
    icon: '🏢',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&sat=-100&brightness=1.1',
    dashboardUrl: '/category/apartment',
  },
  {
    id: 'landscaping',
    title: 'Landscaping',
    subtitle: 'Outdoor & Hardscape',
    icon: '🌳',
    imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80',
    dashboardUrl: '/category/landscaping',
  },
  {
    id: 'labor-pool',
    title: 'Labor Pool',
    subtitle: 'Find Workers & Crews',
    icon: '👷',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    dashboardUrl: '/category/labor-pool',
  },
  {
    id: 'employment',
    title: 'Employment',
    subtitle: 'Job Opportunities',
    icon: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    dashboardUrl: '/category/employment',
  },
  {
    id: 'developer',
    title: 'Developer',
    subtitle: 'Property Development',
    icon: '🏗️',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    dashboardUrl: '/category/developer',
  },
  {
    id: 'food-service',
    title: 'Food Service',
    subtitle: 'Construction Site Catering',
    icon: '🍽️',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    dashboardUrl: '/category/food-service',
  },
  {
    id: 'career-opportunities',
    title: 'Career Opportunities',
    subtitle: 'Training & Development',
    icon: '🎓',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
    dashboardUrl: '/category/career-opportunities',
  },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCategorySelect = (dashboardUrl: string) => {
    router.push(dashboardUrl);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&blur=2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark gradient overlay matching mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 to-black/90 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Top Navigation */}
        <div className="border-b border-white/10 backdrop-blur-sm bg-black/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-400">🏗️ Construction Lead</Link>
            <div className="flex gap-4 items-center">
              <Link href="/dashboard" className="text-white/70 hover:text-white transition text-sm font-medium">Dashboard</Link>
              <Link href="/categories" className="text-white/70 hover:text-white transition text-sm font-medium font-semibold text-blue-400">Categories</Link>
              <Link href="/feed" className="text-white/70 hover:text-white transition text-sm font-medium">Feed</Link>
              <Link href="/messages" className="text-white/70 hover:text-white transition text-sm font-medium">Messages</Link>
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-white/70 hover:text-white transition">☰</button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/80 border border-white/20 rounded-lg shadow-lg z-50 backdrop-blur-sm">
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">👤 Profile</Link>
                    <Link href="/photo-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">📸 Photo Analysis</Link>
                    <Link href="/blueprint-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">📐 Blueprint Analysis</Link>
                    <Link href="/building-codes" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">🏛️ Building Codes</Link>
                    <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">⚙️ Settings</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-6xl mx-auto px-5 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-white mb-3">Project Categories</h1>
            <p className="text-white/80 text-lg">Choose your project type to get started</p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.dashboardUrl)}
                className="group relative h-64 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-105 border border-white/10"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110"
                  style={{ backgroundImage: `url(${category.imageUrl})` }}
                />

                {/* Overlay - matching mobile gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 group-hover:from-black/30 group-hover:to-black/70 transition-all" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-10">
                  <h3 className="text-2xl font-bold text-white mb-1">{category.title}</h3>
                  <p className="text-white/90 text-sm">{category.subtitle}</p>
                </div>

                {/* Border accent */}
                <div className="absolute inset-0 border-2 border-white/20 group-hover:border-white/40 rounded-xl transition-all pointer-events-none" />
              </button>
            ))}
          </div>

          {/* Info Section - matching mobile banner style */}
          <div
            className="rounded-xl p-8 text-center border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">Get Started Today</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Select a project category above to access specialized tools, contractors, and resources tailored to your construction needs.
            </p>
            <Link href="/dashboard" className="inline-block text-white/70 hover:text-white transition font-semibold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
