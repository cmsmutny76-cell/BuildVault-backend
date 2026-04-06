'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PriceComparisonPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [projectType, setProjectType] = useState('residential-remodel');
  const [materialsInput, setMaterialsInput] = useState('2x4 lumber\ndrywall sheets\nGFCI outlets');
  const [customStoreInput, setCustomStoreInput] = useState('');
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const addCustomStore = () => {
    const value = customStoreInput.trim();
    if (!value) return;
    if (!customStores.includes(value)) {
      setCustomStores([...customStores, value]);
    }
    setCustomStoreInput('');
  };

  const removeCustomStore = (storeName: string) => {
    setCustomStores(customStores.filter((store) => store !== storeName));
  };

  const runComparison = async () => {
    setLoading(true);
    setError('');

    try {
      const materials = materialsInput
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name, quantity: '1', unit: 'unit' }));

      if (materials.length === 0) {
        throw new Error('Add at least one material item');
      }

      const response = await fetch('/api/material-quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials,
          projectType,
          city,
          state,
          zipCode,
          userAddedStores: customStores,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate comparison');
      }

      setResult(data);
    } catch (comparisonError) {
      setError(comparisonError instanceof Error ? comparisonError.message : 'Failed to run comparison');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold text-white mt-4">Price Comparison</h1>
        </div>

        <div className="bg-white/10 border border-yellow-600/30 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-2xl font-bold text-white mb-3">💰 Price Comparison Tool</h2>
          <p className="text-slate-300">Primary sources are Home Depot and Lowes. AI also searches local stores, and you can add your own stores to include in comparison.</p>

          <div className="grid gap-3 md:grid-cols-2">
            <input value={projectType} onChange={(event) => setProjectType(event.target.value)} placeholder="Project Type" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="State" maxLength={2} className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={zipCode} onChange={(event) => setZipCode(event.target.value)} placeholder="ZIP" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Materials (one per line)</label>
            <textarea value={materialsInput} onChange={(event) => setMaterialsInput(event.target.value)} rows={5} className="w-full rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Add Specific Stores</label>
            <div className="flex gap-2">
              <input value={customStoreInput} onChange={(event) => setCustomStoreInput(event.target.value)} placeholder="Store name" className="flex-1 rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
              <button onClick={addCustomStore} className="rounded-md bg-slate-700 px-4 py-2 text-white hover:bg-slate-600">Add</button>
            </div>
            {customStores.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customStores.map((store) => (
                  <span key={store} className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/20 px-3 py-1 text-xs text-blue-100">
                    {store}
                    <button onClick={() => removeCustomStore(store)} className="text-blue-200 hover:text-white">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-md border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</p>}

          <button onClick={runComparison} disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Searching Stores...' : 'Run AI Price Comparison'}
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          {!result?.quote ? (
            <p className="text-slate-400 text-center">Run comparison to see Home Depot, Lowes, AI-discovered local stores, and your custom stores.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-green-600/40 bg-green-900/20 p-3 text-green-200">
                <p className="font-semibold">Estimated Total: ${result.quote.totalCost}</p>
                <p className="text-sm">Primary Sources: {(result.quote.primaryRetailers || []).join(', ')}</p>
                <p className="text-sm">AI Local Stores: {(result.aiLocalStores || []).join(', ') || 'N/A'}</p>
              </div>

              <div>
                <h3 className="mb-2 text-white font-semibold">Stores Compared</h3>
                <p className="text-slate-300 text-sm">{(result.quote.retailersCompared || []).join(', ')}</p>
              </div>

              <div>
                <h3 className="mb-2 text-white font-semibold">Material Breakdown</h3>
                <div className="space-y-2">
                  {(result.quote.materials || []).map((material: any) => (
                    <div key={material.name} className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
                      <p className="font-semibold text-slate-100">{material.name}</p>
                      <p className="text-xs text-slate-400 mb-2">Best: {material.bestRetailer} (${Number(material.bestPrice).toFixed(2)})</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {material.prices.map((price: any) => (
                          <li key={`${material.name}-${price.retailer}`}>
                            <a className="text-blue-300 hover:text-blue-200" href={price.url} target="_blank" rel="noreferrer">
                              {price.retailer}
                            </a>
                            {' '}— ${Number(price.price).toFixed(2)} {price.inStock ? '(In Stock)' : '(Check Stock)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
