'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import WebBrandMark from '../../../components/WebBrandMark';

// Gold accent color matching mobile app
const GOLD = '#D4AF37';

const CATEGORY_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  icon: string;
  backgroundImage: string;
  stats: Record<string, string | number>;
  quickActions: Array<{ icon: string; title: string; description: string }>;
  features: Array<{ icon: string; title: string; description: string }>;
}> = {
  'residential': {
    title: 'Residential Projects',
    subtitle: 'Manage single-family homes and residential renovations',
    icon: '🏠',
    backgroundImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
    stats: { properties: 8, activeProjects: 3, completed: 24 },
    quickActions: [
      { icon: '🔨', title: 'New Project', description: 'Start a home renovation or construction project' },
      { icon: '👷', title: 'Find Contractors', description: 'Connect with licensed residential contractors' },
      { icon: '💰', title: 'Get Quotes', description: 'Compare pricing from multiple suppliers' },
      { icon: '📋', title: 'Project Timeline', description: 'Track milestones and completion dates' },
    ],
    features: [
      { icon: '🛏️', title: 'Bedroom & Bath', description: 'Master suite upgrades and renovations' },
      { icon: '👨‍🍳', title: 'Kitchen Remodel', description: 'Cabinets, counters, and appliances' },
      { icon: '🏡', title: 'Outdoor Work', description: 'Decks, patios, and landscaping' },
      { icon: '🔧', title: 'Home Systems', description: 'HVAC, plumbing, electrical, and roofing' },
    ],
  },
  'commercial': {
    title: 'Commercial Projects',
    subtitle: 'Manage office, retail, and commercial construction',
    icon: '🏢',
    backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    stats: { properties: 5, activeProjects: 2, sqft: 125000 },
    quickActions: [
      { icon: '🏗️', title: 'New Development', description: 'Plan large-scale commercial projects' },
      { icon: '📊', title: 'Portfolio Dashboard', description: 'Track all commercial properties' },
      { icon: '🤝', title: 'General Contractors', description: 'Connect with commercial construction firms' },
      { icon: '💼', title: 'Project Bidding', description: 'Get competitive bids from multiple contractors' },
    ],
    features: [
      { icon: '🏢', title: 'Office Spaces', description: 'Corporate offices and business centers' },
      { icon: '🏬', title: 'Retail Stores', description: 'Storefronts and shopping centers' },
      { icon: '🏭', title: 'Industrial', description: 'Warehouses and manufacturing facilities' },
      { icon: '📈', title: 'ROI Analysis', description: 'Track costs and return on investment' },
    ],
  },
  'multi-family': {
    title: 'Multi-Family Housing',
    subtitle: 'Manage apartment complexes, condos, and multi-unit properties',
    icon: '🏘️',
    backgroundImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    stats: { properties: 3, units: 156, activeProjects: 4 },
    quickActions: [
      { icon: '🏗️', title: 'New Multi-Family Project', description: 'Start renovation for multi-unit properties' },
      { icon: '👷', title: 'Find Contractors', description: 'Connect with multi-family specialists' },
      { icon: '📊', title: 'Unit Management', description: 'Track projects across multiple units' },
      { icon: '🔧', title: 'Maintenance Request', description: 'Submit maintenance for common areas' },
    ],
    features: [
      { icon: '🚪', title: 'Common Area Work', description: 'Lobbies, hallways, elevators, shared spaces' },
      { icon: '🏊', title: 'Amenities', description: 'Pool, gym, clubhouse upgrades' },
      { icon: '🚗', title: 'Parking & Exterior', description: 'Parking lots, landscaping, building facades' },
      { icon: '📡', title: 'Building Systems', description: 'HVAC, plumbing, electrical systems' },
    ],
  },
  'apartment': {
    title: 'Apartment Projects',
    subtitle: 'Individual apartment renovations and tenant coordination',
    icon: '🏢',
    backgroundImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    stats: { units: 12, activeProjects: 3, completed: 45 },
    quickActions: [
      { icon: '🏠', title: 'Unit Renovation', description: 'Kitchen, bathroom, and full apartment remodels' },
      { icon: '🎨', title: 'Unit Turnover', description: 'Fast-track updates between tenants' },
      { icon: '👔', title: 'Find Contractors', description: 'Licensed professionals for apartment work' },
      { icon: '📅', title: 'Schedule Coordination', description: 'Plan work around tenant occupancy' },
    ],
    features: [
      { icon: '⚡', title: 'Quick Turnovers', description: 'Express services for unit prep' },
      { icon: '🔊', title: 'Noise Management', description: 'Minimize disruption to occupied units' },
      { icon: '🔑', title: 'Tenant Coordination', description: 'Manage around move-in/move-out dates' },
      { icon: '💰', title: 'Budget Planning', description: 'Cost estimation for multiple units' },
    ],
  },
  'landscaping': {
    title: 'Landscaping Projects',
    subtitle: 'Professional landscape design, installation, and maintenance',
    icon: '🌳',
    backgroundImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&q=80',
    stats: { properties: 8, activeProjects: 5, sqft: 125000 },
    quickActions: [
      { icon: '🌱', title: 'New Landscape Project', description: 'Design and installation for residential/commercial' },
      { icon: '💧', title: 'Irrigation Systems', description: 'Smart irrigation and water conservation' },
      { icon: '🪨', title: 'Hardscaping', description: 'Patios, walkways, retaining walls' },
      { icon: '🌿', title: 'Find Landscapers', description: 'Licensed landscape contractors' },
    ],
    features: [
      { icon: '☀️', title: 'Drought-Tolerant', description: 'Native plants and water-wise design' },
      { icon: '💡', title: 'Outdoor Lighting', description: 'Landscape and architectural lighting' },
      { icon: '🌺', title: 'Seasonal Planting', description: 'Year-round color and maintenance' },
      { icon: '🌊', title: 'Water Features', description: 'Fountains, ponds, and decorative elements' },
    ],
  },
  'labor-pool': {
    title: 'Labor Pool',
    subtitle: 'General labor, day workers, and project-based crews',
    icon: '👷',
    backgroundImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    stats: { workers: 45, activeJobs: 12, hiredToday: 8 },
    quickActions: [
      { icon: '👥', title: 'Hire Workers', description: 'Find skilled laborers for your projects' },
      { icon: '📋', title: 'Post Job', description: 'List your labor requirements and budget' },
      { icon: '⏰', title: 'Day Labor', description: 'Hire workers for same-day projects' },
      { icon: '🏆', title: 'Crew Leads', description: 'Find experienced foremen and supervisors' },
    ],
    features: [
      { icon: '🔨', title: 'General Labor', description: 'Demolition, hauling, site cleanup' },
      { icon: '🧱', title: 'Skilled Trades', description: 'Carpenters, masons, painters, specialists' },
      { icon: '💪', title: 'Heavy Lifting', description: 'Material handling and equipment operators' },
      { icon: '🏗️', title: 'Project Crews', description: 'Complete teams for large-scale projects' },
    ],
  },
  'employment': {
    title: 'Employment Opportunities',
    subtitle: 'Find construction jobs and career advancement opportunities',
    icon: '💼',
    backgroundImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
    stats: { openJobs: 234, applications: 45, interviews: 8 },
    quickActions: [
      { icon: '🔍', title: 'Browse Jobs', description: 'Search construction and trade job listings' },
      { icon: '📄', title: 'Submit Resume', description: 'Apply to contractors and companies' },
      { icon: '👔', title: 'My Applications', description: 'Track job applications and responses' },
      { icon: '🎓', title: 'Training Programs', description: 'Certifications and skill development' },
    ],
    features: [
      { icon: '🏆', title: 'Apprenticeships', description: 'Entry-level positions with training' },
      { icon: '⚡', title: 'Immediate Hire', description: 'Jobs starting this week or ASAP' },
      { icon: '💰', title: 'Union Jobs', description: 'Licensed trade positions with benefits' },
      { icon: '📊', title: 'Project Management', description: 'Supervisor and coordinator positions' },
    ],
  },
  'developer': {
    title: 'Developer Projects',
    subtitle: 'Large-scale development and property investment management',
    icon: '🏗️',
    backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    stats: { projects: 12, portfolio: '$45M', inProgress: 5 },
    quickActions: [
      { icon: '🏙️', title: 'New Development', description: 'Plan multi-property or large-scale projects' },
      { icon: '📊', title: 'Portfolio Dashboard', description: 'Track all properties and investments' },
      { icon: '🤝', title: 'General Contractors', description: 'Connect with commercial construction firms' },
      { icon: '💼', title: 'Project Bidding', description: 'Solicit bids from multiple contractors' },
    ],
    features: [
      { icon: '📈', title: 'ROI Analysis', description: 'Cost tracking and investment metrics' },
      { icon: '📅', title: 'Timeline Management', description: 'Multi-project scheduling' },
      { icon: '🏦', title: 'Financing', description: 'Construction loans and project funding' },
      { icon: '🗺️', title: 'Site Planning', description: 'Zoning, permits, regulatory compliance' },
    ],
  },
  'food-service': {
    title: 'Restaurant & Food Service',
    subtitle: 'Commercial kitchen, dining, and food service construction',
    icon: '🍽️',
    backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    stats: { locations: 6, activeProjects: 2, sqft: 45000 },
    quickActions: [
      { icon: '👨‍🍳', title: 'Kitchen Build-Out', description: 'Commercial kitchen design and construction' },
      { icon: '🏪', title: 'Restaurant Renovation', description: 'Dining room, bar, and customer spaces' },
      { icon: '🔥', title: 'Health Code Compliance', description: 'Ensure all work meets regulations' },
      { icon: '🛠️', title: 'Find Specialists', description: 'Contractors experienced in food service' },
    ],
    features: [
      { icon: '❄️', title: 'Refrigeration', description: 'Walk-in coolers, freezers, cold storage' },
      { icon: '🔥', title: 'Cooking Equipment', description: 'Hood systems, ventilation, fire suppression' },
      { icon: '💧', title: 'Plumbing & Drains', description: 'Grease traps, triple sinks, specialized plumbing' },
      { icon: '⚡', title: 'High-Power Electrical', description: 'Commercial-grade electrical systems' },
    ],
  },
  'career-opportunities': {
    title: 'Career Opportunities',
    subtitle: 'Training, certifications, and professional development',
    icon: '🎓',
    backgroundImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80',
    stats: { courses: 24, certifications: 12, graduates: 340 },
    quickActions: [
      { icon: '📚', title: 'Explore Courses', description: 'Browse construction and trade training programs' },
      { icon: '🎯', title: 'Get Certified', description: 'Earn industry-recognized certifications' },
      { icon: '🏫', title: 'Enroll Today', description: 'Start your professional development journey' },
      { icon: '📊', title: 'Track Progress', description: 'Monitor course completion and credentials' },
    ],
    features: [
      { icon: '🔧', title: 'Trade Skills', description: 'Electrician, plumber, carpenter training' },
      { icon: '⚙️', title: 'Equipment Operation', description: 'Heavy machinery and power tools certification' },
      { icon: '🛡️', title: 'Safety Training', description: 'OSHA and site safety certifications' },
      { icon: '📈', title: 'Leadership Programs', description: 'Project management and supervisor training' },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [menuOpen, setMenuOpen] = useState(false);

  const config = CATEGORY_CONFIG[categoryId];

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
          <Link href="/categories" className="text-blue-400 hover:text-blue-300 font-semibold">
            ← Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const handleActionClick = (actionTitle: string) => {
    if (actionTitle.toLowerCase().includes('contractor')) {
      router.push('/find-contractors');
    } else if (actionTitle.toLowerCase().includes('supplier')) {
      router.push('/find-suppliers');
    } else if (actionTitle.toLowerCase().includes('quote') || actionTitle.toLowerCase().includes('bid')) {
      router.push('/photo-analysis');
    } else if (actionTitle.toLowerCase().includes('project')) {
      router.push('/dashboard');
    } else {
      alert(`${actionTitle} coming soon!`);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${config.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark gradient overlay matching mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 to-black/90 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Top Navigation - matching mobile dark theme */}
        <div className="border-b border-white/10 backdrop-blur-sm bg-black/30 sticky top-0 z-[1000]">
          <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
            <WebBrandMark href="/categories" size="featured" textClassName="text-yellow-400" />
            <div className="flex gap-4 items-center">
              <Link href="/dashboard" className="text-white/70 hover:text-white transition text-sm font-medium">Dashboard</Link>
              <Link href="/categories" className="text-white/70 hover:text-white transition text-sm font-medium" style={{ color: GOLD }}>
                Categories
              </Link>
              <Link href="/feed" className="text-white/70 hover:text-white transition text-sm font-medium">Feed</Link>
              <Link href="/messages" className="text-white/70 hover:text-white transition text-sm font-medium">Messages</Link>
              <div className="relative z-[1100]">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)} 
                  className="text-2xl text-white/70 hover:text-white transition"
                >
                  ☰
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-black/90 border border-white/20 rounded-lg shadow-lg z-[1200] backdrop-blur-sm">
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">👤 Profile</Link>
                    <Link href="/photo-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">📸 Photo Analysis</Link>
                    <Link href="/blueprint-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">📐 Blueprint Analysis</Link>
                    <Link href="/building-codes" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">🏛️ Building Codes</Link>
                    <Link href="/price-comparison" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">💰 Price Comparison</Link>
                    <Link href="/find-contractors" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">👷 Find Contractors</Link>
                    <Link href="/find-suppliers" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">🧱 Find Suppliers</Link>
                    <Link href="/permit-assistance" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">📋 Permit Assistance</Link>
                    <Link href="/project-scheduling" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">Project Scheduling</Link>
                    <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">⚙️ Settings</Link>
                    <Link href="/help" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition">ℹ️ Help & Support</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-5xl mx-auto px-5 py-12">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/categories"
              className="inline-flex items-center px-5 py-3 rounded-lg border text-sm font-semibold transition-all"
              style={{
                backgroundColor: `rgba(212, 175, 55, 0.15)`,
                borderColor: GOLD,
                color: GOLD,
              }}
            >
              ← Back to Categories
            </Link>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="text-6xl mb-4">{config.icon}</div>
            <h1 className="text-5xl font-bold text-white mb-3">{config.title}</h1>
            <p className="text-lg text-white/80">{config.subtitle}</p>
          </div>

          {/* Stats Card - matching mobile layout */}
          <div
            className="flex items-center gap-0 rounded-3xl p-6 mb-8 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: `rgba(212, 175, 55, 0.3)`,
            }}
          >
            {Object.entries(config.stats).map(([key, value], index) => (
              <React.Fragment key={key}>
                {index > 0 && (
                  <div className="w-px h-12 mx-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                )}
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: GOLD }}>
                    {typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(1)}K` : value}
                  </div>
                  <div className="text-xs text-white/80 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-5">Quick Actions</h2>
            <div className="space-y-3">
              {config.quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action.title)}
                  className="w-full flex items-start gap-4 p-5 rounded-2xl border transition-all hover:bg-white/10"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="text-3xl flex-shrink-0">{action.icon}</div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base">{action.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Specialized Services Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-5">Specialized Services</h2>
            <div className="space-y-3">
              {config.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-2xl border"
                  style={{
                    backgroundColor: `rgba(212, 175, 55, 0.08)`,
                    borderColor: GOLD,
                  }}
                >
                  <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base" style={{ color: GOLD }}>
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Banner - matching mobile */}
          <div
            className="flex items-start gap-4 p-6 rounded-2xl border mb-0"
            style={{
              backgroundColor: 'rgba(33, 150, 243, 0.15)',
              borderColor: '#2196F3',
            }}
          >
            <div className="text-3xl flex-shrink-0">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Get Started</h3>
              <p className="text-white/80 text-sm">
                Create a project profile to get matched with contractors who specialize in {config.title.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}