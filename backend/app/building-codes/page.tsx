'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BuildingCodesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState('proj1');
  const [userId, setUserId] = useState('user_2');
  const [projectType, setProjectType] = useState('residential-remodel');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [report, setReport] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/documents?type=building-codes-report`);
      const data = await response.json();
      if (response.ok && data.success) {
        setDocuments(data.documents || []);
      }
    } catch {
      setDocuments([]);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await fetch('/api/building-codes/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId,
          projectType,
          location: { city, state, zipCode },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch building codes');
      }

      setReport(data.report || data);
      await fetchDocuments();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to fetch building codes');
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
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
          <h1 className="text-4xl font-bold text-white mt-4">Building Codes</h1>
        </div>

        <div className="bg-white/10 border border-yellow-600/30 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">🏛️ Building Codes & Regulations</h2>
          <p className="text-slate-300">Generate city/state/federal code reports with agency references and save documents to project history.</p>

          <div className="grid gap-3 md:grid-cols-2">
            <input value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="Project ID" className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID" className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={projectType} onChange={(event) => setProjectType(event.target.value)} placeholder="Project Type" className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="State" className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" maxLength={2} />
            <input value={zipCode} onChange={(event) => setZipCode(event.target.value)} placeholder="ZIP Code" className="rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
          </div>

          {error && <p className="rounded-md border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button onClick={generateReport} disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Generating...' : 'Generate Code Report'}
            </button>
            <button onClick={fetchDocuments} className="rounded-md bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600">
              Load Project Reports
            </button>
            {report && (
              <button onClick={printReport} className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
                Print Report
              </button>
            )}
          </div>
        </div>

        {report && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6 space-y-4">
            <h3 className="text-xl font-bold text-white">Printable Compliance Report</h3>
            <p className="text-slate-300 text-sm">Generated: {new Date(report.generatedAt || Date.now()).toLocaleString()}</p>

            <div>
              <h4 className="font-semibold text-yellow-300 mb-2">Code Enforcement Agencies</h4>
              <div className="space-y-3 text-sm text-slate-200">
                {(report.agencies?.priority || ['federal', 'state', 'city', 'county']).map((scope: string) => {
                  const items = report.agencies?.[scope] || [];
                  if (!Array.isArray(items) || items.length === 0) return null;
                  return (
                    <div key={scope}>
                      <p className="font-semibold uppercase tracking-wide text-slate-300">{scope}</p>
                      <ul className="list-disc ml-5">
                        {items.map((agency: any) => (
                          <li key={agency.url}>
                            <a href={agency.url} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200">
                              {agency.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-300 mb-2">Code Requirements</h4>
              {report.reportText ? (
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/60 p-4 text-xs text-slate-200 max-h-96 overflow-auto">{report.reportText}</pre>
              ) : report.codes ? (
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/60 p-4 text-xs text-slate-200 max-h-96 overflow-auto">{JSON.stringify(report.codes, null, 2)}</pre>
              ) : (
                <p className="text-slate-400 italic">No code requirements data available</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Saved Reports for Project</h3>
          {documents.length === 0 ? (
            <p className="text-slate-400">No saved building code reports yet for this project.</p>
          ) : (
            <ul className="space-y-4 text-slate-200 text-sm">
              {documents.map((doc) => (
                <li key={doc.id} className="rounded-md border border-slate-700 bg-slate-900/40 px-4 py-3">
                  <p className="font-semibold text-white mb-1">{doc.title}</p>
                  <p className="text-slate-400 text-xs mb-2">{new Date(doc.createdAt).toLocaleString()}</p>
                  {doc.data?.reportText && (
                    <pre className="whitespace-pre-wrap rounded-md bg-slate-900/60 p-3 text-xs text-slate-300 max-h-40 overflow-auto">{doc.data.reportText}</pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
