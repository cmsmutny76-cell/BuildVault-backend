'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthToken } from '../../lib/web/authStorage';

type UploadedBlueprint = {
  id: string;
  projectId?: string;
  assetType: string;
  photoUrl: string;
  storageKey: string;
  uploadedAt: string;
  contentType: string;
  size: number;
  originalFileName: string;
};

export default function BlueprintAnalysisPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectId, setProjectId] = useState('proj1');
  const [userId, setUserId] = useState('user_2');
  const [projectType, setProjectType] = useState('residential-remodel');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [blueprintUrl, setBlueprintUrl] = useState('https://via.placeholder.com/1200x900.png?text=Blueprint+Plan');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploads, setUploads] = useState<UploadedBlueprint[]>([]);
  const [selectedBlueprintUrls, setSelectedBlueprintUrls] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadBlueprintUploads(projectId);
  }, [projectId]);

  const loadBlueprintUploads = async (nextProjectId: string) => {
    if (!nextProjectId.trim()) {
      setUploads([]);
      return;
    }

    try {
      const response = await fetch(`/api/photos/upload?projectId=${encodeURIComponent(nextProjectId)}&assetType=blueprint`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load blueprint uploads');
      }

      const nextUploads = data.uploads || [];
      setUploads(nextUploads);
      if (nextUploads.length > 0 && !nextUploads.some((upload: UploadedBlueprint) => upload.photoUrl === blueprintUrl)) {
        setBlueprintUrl(nextUploads[0].photoUrl);
      }
      if (nextUploads.length > 0 && selectedBlueprintUrls.length === 0) {
        setSelectedBlueprintUrls([nextUploads[0].photoUrl]);
      }
    } catch {
      setUploads([]);
    }
  };

  const handleUploadBlueprint = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('assetType', 'blueprint');
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload blueprint');
      }

      const nextUploads = data.uploads || [];
      const uploadedUrl = nextUploads[0]?.photoUrl || data.photo?.photoUrl;
      if (!uploadedUrl) {
        throw new Error('Upload did not return a valid blueprint URL');
      }

      setBlueprintUrl(uploadedUrl);
      const uploadedUrls = nextUploads.map((upload: UploadedBlueprint) => upload.photoUrl);
      if (uploadedUrls.length > 0) {
        setSelectedBlueprintUrls((current) => Array.from(new Set([...uploadedUrls, ...current])));
      }
      await loadBlueprintUploads(projectId);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload blueprint');
    } finally {
      setUploading(false);
    }
  };

  const handleRenameBlueprint = async (upload: UploadedBlueprint) => {
    const nextName = window.prompt('Rename blueprint file', upload.originalFileName);
    if (!nextName || nextName.trim() === upload.originalFileName) {
      return;
    }

    try {
      const response = await fetch('/api/photos/upload', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: upload.id,
          originalFileName: nextName.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to rename blueprint file');
      }

      await loadBlueprintUploads(projectId);
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : 'Failed to rename blueprint file');
    }
  };

  const handleDeleteBlueprint = async (upload: UploadedBlueprint) => {
    const confirmed = window.confirm(`Delete ${upload.originalFileName}?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/photos/upload?id=${encodeURIComponent(upload.id)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete blueprint file');
      }

      setSelectedBlueprintUrls((current) => current.filter((url) => url !== upload.photoUrl));
      if (blueprintUrl === upload.photoUrl) {
        const next = uploads.find((item) => item.id !== upload.id);
        setBlueprintUrl(next?.photoUrl || '');
      }
      await loadBlueprintUploads(projectId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete blueprint file');
    }
  };

  const runAnalysis = async (overrideBlueprintUrls?: string[]) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const blueprintUrls = (overrideBlueprintUrls && overrideBlueprintUrls.length > 0)
        ? overrideBlueprintUrls
        : selectedBlueprintUrls.length > 0
          ? selectedBlueprintUrls
          : blueprintUrl
            ? [blueprintUrl]
            : [];

      if (blueprintUrls.length === 0) {
        throw new Error('Select at least one blueprint file or provide a blueprint URL');
      }

      const primaryBlueprintUrl = blueprintUrls[0] || blueprintUrl;
      const token = getAuthToken();
      const response = await fetch('/api/ai/analyze-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectId,
          userId,
          projectType,
          blueprintUrl: primaryBlueprintUrl,
          blueprintUrls,
          location: { city, state, zipCode },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze blueprint');
      }

      setResult(data);
      await loadDocuments();
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Failed to analyze blueprint');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSelectedBlueprints = async () => {
    const blueprintUrls = selectedBlueprintUrls.length > 0 ? selectedBlueprintUrls : blueprintUrl ? [blueprintUrl] : [];
    if (blueprintUrls.length === 0) {
      setError('Select at least one blueprint file first');
      return;
    }
    await runAnalysis(blueprintUrls);
  };

  const analyzeSingleBlueprint = async (upload: UploadedBlueprint) => {
    setBlueprintUrl(upload.photoUrl);
    setSelectedBlueprintUrls([upload.photoUrl]);
    await runAnalysis([upload.photoUrl]);
  };

  const loadDocuments = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDocuments(data.documents || []);
      }
    } catch {
      setDocuments([]);
    }
  };

  const printReport = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-950 border-b border-slate-700 sticky top-0 z-[1000]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-xl font-bold text-blue-400">🏗️ Construction Lead</Link>
          <div className="flex gap-4 items-center">
            <Link href="/feed" className="text-slate-300 hover:text-white transition">Feed</Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>
            <Link href="/messages" className="text-slate-300 hover:text-white transition">Messages</Link>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-slate-300 hover:text-white transition">☰</button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-[1200]">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">👤 Profile</Link>
                  <Link href="/photo-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">📸 Photo Analysis</Link>
                  <Link href="/blueprint-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">📐 Blueprint Analysis</Link>
                  <Link href="/building-codes" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">🏛️ Building Codes</Link>
                  <Link href="/price-comparison" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">💰 Price Comparison</Link>
                  <Link href="/find-contractors" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">👷 Find Contractors</Link>
                  <Link href="/permit-assistance" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">📋 Permit Assistance</Link>
                  <Link href="/project-scheduling" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">Project Scheduling</Link>
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
          <h1 className="text-4xl font-bold text-white mt-4">Blueprint Analysis</h1>
        </div>

        <div className="bg-white/10 border border-yellow-600/30 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">📐 Blueprint Analysis</h2>
          <p className="text-slate-300">Analyze blueprint files, run code checks, compare retailer pricing by geography, and store reports by project.</p>

          <div className="grid gap-3 md:grid-cols-2">
            <input value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="Project ID" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={projectType} onChange={(event) => setProjectType(event.target.value)} placeholder="Project Type" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={blueprintUrl} onChange={(event) => setBlueprintUrl(event.target.value)} placeholder="Blueprint URL" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="State" maxLength={2} className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
            <input value={zipCode} onChange={(event) => setZipCode(event.target.value)} placeholder="ZIP Code" className="rounded-md border border-slate-600 bg-slate-900/70 px-3 py-2 text-white" />
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-md bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600">
              {uploading ? 'Uploading...' : 'Upload Blueprint Files'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  void handleUploadBlueprint(event.target.files);
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <p className="text-xs text-slate-400">Current: {blueprintUrl}</p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Project Blueprint Library</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void analyzeSelectedBlueprints()}
                  disabled={loading}
                  className="rounded-md bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Analyzing...' : 'Analyze Selected'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBlueprintUrls(uploads.map((upload) => upload.photoUrl))}
                  className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBlueprintUrls([])}
                  className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Clear
                </button>
                <button onClick={() => void loadBlueprintUploads(projectId)} className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                  Refresh Files
                </button>
              </div>
            </div>
            <p className="mb-3 text-xs text-slate-300">Selected files: {selectedBlueprintUrls.length}</p>
            {uploads.length === 0 ? (
              <p className="text-sm text-slate-400">No blueprint files uploaded for this project yet.</p>
            ) : (
              <ul className="space-y-2">
                {uploads.map((upload) => {
                  const selected = selectedBlueprintUrls.includes(upload.photoUrl);
                  return (
                    <li key={upload.id}>
                      <div className={`rounded-md border px-3 py-2 transition ${selected ? 'border-blue-500 bg-blue-950/40' : 'border-slate-700 bg-slate-900/50'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setBlueprintUrl(upload.photoUrl);
                              setSelectedBlueprintUrls((current) => {
                                if (current.includes(upload.photoUrl)) {
                                  return current.filter((url) => url !== upload.photoUrl);
                                }
                                return [...current, upload.photoUrl];
                              });
                            }}
                            className="flex-1 text-left"
                          >
                            <span className="block font-semibold text-white">{upload.originalFileName}</span>
                            <span className="block text-xs text-slate-400">{upload.contentType} • {(upload.size / 1024).toFixed(1)} KB</span>
                          </button>
                          <span className="text-xs text-slate-300">{selected ? 'Selected' : 'Select File'}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => void analyzeSingleBlueprint(upload)}
                            className="rounded-md bg-blue-800/80 px-2 py-1 text-xs font-semibold text-blue-100 hover:bg-blue-700/80"
                          >
                            Analyze
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRenameBlueprint(upload)}
                            className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteBlueprint(upload)}
                            className="rounded-md bg-red-900/70 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-800/70"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && <p className="rounded-md border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => void runAnalysis()} disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Analyzing...' : 'Analyze Blueprint'}
            </button>
            <button onClick={loadDocuments} className="rounded-md bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600">
              Load Documents
            </button>
            {result && (
              <button onClick={printReport} className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
                Print Report
              </button>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Blueprint Analysis Report</h3>
              <p className="text-slate-300 text-sm mb-3">Files analyzed: {result.analyzedBlueprintCount || 1}</p>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/60 p-4 text-xs text-slate-200">{result.blueprintReportText || 'No text report available yet.'}</pre>
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Code Agencies & Compliance</h3>
              <p className="mb-3 text-sm text-slate-300">{result.complianceSummary || 'Code guidance is generated when state/location is provided.'}</p>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900/60 p-4 text-xs text-slate-200">{result.buildingCodesReportText || 'No code report text available yet.'}</pre>
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Code-Required Hardware (If Applicable)</h3>
              {result.hardwareQuantityMethod && (
                <p className="mb-3 inline-flex rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                  Quantity source: {result.hardwareQuantityMethod === 'ai' ? 'AI estimate' : 'Heuristic estimate'}
                </p>
              )}
              {Array.isArray(result.codeRequiredHardware) && result.codeRequiredHardware.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-200">
                  {result.codeRequiredHardware.map((item: any, index: number) => (
                    <li key={`${item?.name || 'hardware'}-${index}`} className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2">
                      <p className="font-semibold text-white">{item?.name || 'Unnamed hardware item'}</p>
                      <p className="text-slate-300">{item?.quantity || 'As required by code'}{item?.unit ? ` ${item.unit}` : ''}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-300">No additional hardware flagged from current blueprint + code context.</p>
              )}
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Geo Price Comparison</h3>
              <p className="text-green-300 font-semibold mb-2">Total Estimate: ${result.materialQuote?.totalCost}</p>
              <div>
                <p className="text-slate-300 text-sm">Retailers: {(result.materialQuote?.retailersCompared || []).join(', ')}</p>
                <p className="text-slate-400 text-xs mt-1">ℹ️ Retailers ranked by average quoted price</p>
              </div>
              {Array.isArray(result.materialQuote?.materials) && result.materialQuote.materials.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-white mb-2">Quoted Line Items</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {result.materialQuote.materials.slice(0, 8).map((item: any, index: number) => (
                      <li key={`${item.name || 'material'}-${index}`} className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p>{item.quantity} {item.unit || ''}</p>
                        <p>Best Price: ${Number(item.bestPrice || 0).toFixed(2)} each from {item.bestRetailer || 'N/A'}</p>
                        <p className="text-green-300 font-semibold">Line Total: ${Number(item.lineTotal || 0).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Saved Project Documents</h3>
          {documents.length === 0 ? (
            <p className="text-slate-400 text-sm">No documents found for this project.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-200">
              {documents.slice(0, 10).map((doc) => (
                <li key={doc.id} className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2">
                  <p className="font-semibold">{doc.title}</p>
                  <p className="text-slate-400">{doc.type}</p>
                  {typeof doc?.data?.reportText === 'string' && doc.data.reportText.trim() && (
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-300">{doc.data.reportText}</pre>
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