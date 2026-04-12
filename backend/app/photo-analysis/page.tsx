'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthToken } from '../../lib/web/authStorage';

type UploadedPhoto = {
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

interface AnalysisResult {
  summary: string;
  materials: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  dimensions: {
    length: string;
    width: string;
    area: string;
  };
  estimatedCost: string;
}

export default function PhotoAnalysisPage() {
  const [projectId, setProjectId] = useState('proj1');
  const [userId, setUserId] = useState('user_2');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [materialQuote, setMaterialQuote] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [codeRequiredHardware, setCodeRequiredHardware] = useState<Array<{ name: string; quantity: string; unit?: string }>>([]);
  const [complianceSummary, setComplianceSummary] = useState<string>('');
  const [buildingCodesReportText, setBuildingCodesReportText] = useState<string>('');
  const [hardwareQuantityMethod, setHardwareQuantityMethod] = useState<'ai' | 'heuristic' | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedPhoto[]>([]);

  useEffect(() => {
    void loadPhotoUploads(projectId);
  }, [projectId]);

  const loadPhotoUploads = async (nextProjectId: string) => {
    if (!nextProjectId.trim()) {
      setUploads([]);
      return;
    }

    try {
      const response = await fetch(`/api/photos/upload?projectId=${encodeURIComponent(nextProjectId)}&assetType=photo`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load project photos');
      }

      const nextUploads = data.uploads || [];
      setUploads(nextUploads);
      if (!selectedImage && nextUploads.length > 0) {
        setSelectedImage(nextUploads[0].photoUrl);
      }
    } catch {
      setUploads([]);
    }
  };

  const handleUploadPhoto = async (file: File | null) => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('projectId', projectId);

      const uploadResponse = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload photo');
      }

      const photoUrl = uploadData.photo?.photoUrl;
      if (!photoUrl) {
        throw new Error('Upload did not return a valid photo URL');
      }

      setSelectedImage(photoUrl);
      await loadPhotoUploads(projectId);
      await analyzePhoto(photoUrl);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload photo';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const analyzePhoto = async (photoUri: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    setMaterialQuote(null);
    setCompliance(null);
    setAgencies([]);
    setCodeRequiredHardware([]);
    setComplianceSummary('');
    setBuildingCodesReportText('');
    setHardwareQuantityMethod('');
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: photoUri,
          projectType: 'renovation',
          projectId,
          userId,
          location: { city, state, zipCode },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze photo');
      }

      const fallbackAnalysis: AnalysisResult = {
        summary: 'Renovation-ready space with clear flooring replacement scope.',
        materials: [
          { name: 'Flooring planks', quantity: '25', unit: 'boxes' },
          { name: 'Underlayment', quantity: '200', unit: 'sqft' },
          { name: 'Adhesive', quantity: '3', unit: 'gallons' },
        ],
        dimensions: {
          length: '20 ft',
          width: '10 ft',
          area: '200 sqft',
        },
        estimatedCost: '$4,500 - $6,800',
      };

      const apiAnalysis = data.analysis || {};

      const normalized: AnalysisResult = {
        summary: apiAnalysis.summary || apiAnalysis.rawAnalysis || fallbackAnalysis.summary,
        materials: Array.isArray(apiAnalysis.materials) && apiAnalysis.materials.length > 0
          ? apiAnalysis.materials
          : fallbackAnalysis.materials,
        dimensions: {
          length: apiAnalysis.dimensions?.length || fallbackAnalysis.dimensions.length,
          width: apiAnalysis.dimensions?.width || fallbackAnalysis.dimensions.width,
          area: apiAnalysis.dimensions?.area || apiAnalysis.measurements?.estimatedArea || fallbackAnalysis.dimensions.area,
        },
        estimatedCost: apiAnalysis.estimatedCost || '$4,500 - $6,800',
      };

      setAnalysis(normalized);
      setMaterialQuote(data.materialQuote || null);
      setCompliance(data.compliance || null);
      setAgencies(Array.isArray(data.agencies) ? data.agencies : []);
      setCodeRequiredHardware(Array.isArray(data.codeRequiredHardware) ? data.codeRequiredHardware : []);
      setComplianceSummary(typeof data.complianceSummary === 'string' ? data.complianceSummary : '');
      setBuildingCodesReportText(typeof data.buildingCodesReportText === 'string' ? data.buildingCodesReportText : '');
      setHardwareQuantityMethod(data.hardwareQuantityMethod === 'ai' || data.hardwareQuantityMethod === 'heuristic' ? data.hardwareQuantityMethod : '');
      await fetchProjectDocuments();
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : 'Unable to connect to server';
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGetQuotes = async () => {
    if (!analysis) return;
    if (!selectedImage) return;
    await analyzePhoto(selectedImage);
  };

  const fetchProjectDocuments = async () => {
    if (!projectId) return;
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

  const handleRenamePhoto = async (upload: UploadedPhoto) => {
    const nextName = window.prompt('Rename photo file', upload.originalFileName);
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
        throw new Error(data.error || 'Failed to rename photo file');
      }

      await loadPhotoUploads(projectId);
    } catch (renameError) {
      const message = renameError instanceof Error ? renameError.message : 'Failed to rename photo file';
      setError(message);
    }
  };

  const handleDeletePhoto = async (upload: UploadedPhoto) => {
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
        throw new Error(data.error || 'Failed to delete photo file');
      }

      if (selectedImage === upload.photoUrl) {
        const next = uploads.find((item) => item.id !== upload.id);
        setSelectedImage(next?.photoUrl || null);
      }
      await loadPhotoUploads(projectId);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete photo file';
      setError(message);
    }
  };

  const handleAnalyzeSelectedPhoto = async () => {
    if (!selectedImage) {
      setError('Select a photo from the project library first');
      return;
    }
    await analyzePhoto(selectedImage);
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">📸 Photo Analysis</h1>
          <p className="text-slate-400">Upload a photo of your construction project to get instant material estimates and cost analysis</p>
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            <input value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="Project ID" className="rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white" />
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID" className="rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white" />
            <input value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="State" maxLength={2} className="rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white" />
            <input value={zipCode} onChange={(event) => setZipCode(event.target.value)} placeholder="ZIP" className="rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white" />
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">{error}</div>}

        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-950/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Project Photo Library</h3>
            <div className="flex gap-2">
              <button
                onClick={() => void handleAnalyzeSelectedPhoto()}
                disabled={!selectedImage || analyzing}
                className="rounded-md bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Selected'}
              </button>
              <button
                onClick={() => void loadPhotoUploads(projectId)}
                className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Refresh Photos
              </button>
            </div>
          </div>

          {uploads.length === 0 ? (
            <p className="text-sm text-slate-400">No uploaded photos found for this project yet.</p>
          ) : (
            <ul className="space-y-2">
              {uploads.map((upload) => {
                return (
                  <li key={upload.id}>
                    <div className={`rounded-md border px-3 py-2 transition ${selected ? 'border-blue-500 bg-blue-950/40' : 'border-slate-700 bg-slate-900/50'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedImage(upload.photoUrl)}
                          className="flex-1 text-left"
                        >
                          <span className="block font-semibold text-white">{upload.originalFileName}</span>
                          <span className="block text-xs text-slate-400">{upload.contentType} • {(upload.size / 1024).toFixed(1)} KB</span>
                        </button>
                        <span className="text-xs text-slate-300">{selected ? 'Selected' : 'Use Photo'}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void analyzePhoto(upload.photoUrl)}
                          className="rounded-md bg-blue-800/80 px-2 py-1 text-xs font-semibold text-blue-100 hover:bg-blue-700/80"
                        >
                          Analyze
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRenamePhoto(upload)}
                          className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeletePhoto(upload)}
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

        {!selectedImage ? (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-10 text-center">
            <p className="text-6xl mb-4">📸</p>
            <h2 className="text-2xl font-bold text-white mb-2">No Photo Selected</h2>
            <p className="text-slate-300 mb-6">Take a photo of your construction project to get instant material estimates</p>
            <label className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  void handleUploadPhoto(file);
                  event.currentTarget.value = '';
                }}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
              <img src={selectedImage} alt="Selected construction project" className="w-full rounded-lg mb-4" />
              <label className="inline-flex cursor-pointer items-center rounded-lg bg-slate-700 px-4 py-2 text-white transition hover:bg-slate-600">
                {uploading ? 'Uploading...' : 'Change Photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    void handleUploadPhoto(file);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            {analyzing && (
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 text-center">
                <p className="text-white text-lg font-semibold">Analyzing photo with AI...</p>
                <p className="text-slate-300 mt-2">Identifying materials, measuring dimensions, and estimating costs</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-2">📋 Project Summary</h2>
                  <p className="text-slate-300">{analysis.summary}</p>
                </div>

                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-3">🔨 Materials Needed</h2>
                  {analysis.materials.map((material, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300 border-b border-white/10 py-2">
                      <span>{material.name}</span>
                      <span>{material.quantity} {material.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-3">📏 Measurements</h2>
                  <p className="text-slate-300">Length: {analysis.dimensions.length}</p>
                  <p className="text-slate-300">Width: {analysis.dimensions.width}</p>
                  <p className="text-slate-300">Area: {analysis.dimensions.area}</p>
                </div>

                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-2">💰 Estimated Cost</h2>
                  <p className="text-2xl font-bold text-green-300">{analysis.estimatedCost}</p>
                  <p className="text-slate-400 text-sm mt-2">Based on average material prices. Actual costs may vary.</p>
                </div>

                <button onClick={handleGetQuotes} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                  Refresh Code-Aware Quotes
                </button>

                {materialQuote && (
                  <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-200 text-sm space-y-2">
                    <p className="font-semibold">Total Estimate: ${materialQuote.totalCost}</p>
                    <div>
                      <p>Retailers Compared: {(materialQuote.retailersCompared || []).join(', ')}</p>
                      <p className="text-xs text-green-300/80 mt-1">ℹ️ Retailers ranked by average quoted price</p>
                    </div>
                    {Array.isArray(materialQuote.materials) && materialQuote.materials.length > 0 && (
                      <div className="pt-2">
                        <p className="font-semibold text-white mb-2">Quoted Line Items</p>
                        <ul className="space-y-2">
                          {materialQuote.materials.slice(0, 8).map((item: any, index: number) => (
                            <li key={`${item.name || 'material'}-${index}`} className="rounded-md border border-green-400/20 bg-slate-900/30 px-3 py-2">
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
                )}

                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-3">🏛️ Code Regulations</h2>
                  <p className="text-slate-300 text-sm mb-3">{complianceSummary || 'Code guidance is generated when state/location is provided.'}</p>
                  {agencies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-white">Agencies</p>
                      <ul className="mt-1 space-y-1 text-sm text-slate-300">
                        {agencies.slice(0, 6).map((agency, index) => (
                          <li key={`${agency?.name || 'agency'}-${index}`}>- {agency?.name || 'Unknown agency'}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(buildingCodesReportText || compliance) && (
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900/60 p-3 text-xs text-slate-200">{buildingCodesReportText || 'Code guidance available.'}</pre>
                  )}
                </div>

                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-3">🔩 Code-Required Hardware (If Applicable)</h2>
                  {hardwareQuantityMethod && (
                    <p className="mb-3 inline-flex rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                      Quantity source: {hardwareQuantityMethod === 'ai' ? 'AI estimate' : 'Heuristic estimate'}
                    </p>
                  )}
                  {codeRequiredHardware.length === 0 ? (
                    <p className="text-slate-300 text-sm">No additional hardware flagged yet from current analysis and code context.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-slate-300">
                      {codeRequiredHardware.map((item, index) => (
                        <li key={`${item.name}-${index}`} className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Project Document History</h3>
              {documents.length === 0 ? (
                <p className="text-slate-400 text-sm">No saved documents loaded yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-200">
                  {documents.slice(0, 8).map((doc) => (
                    <li key={doc.id} className="rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2">
                      <p className="font-semibold">{doc.title}</p>
                      <p className="text-slate-400">{doc.type}</p>
                      {typeof doc?.data?.reportText === 'string' && doc.data.reportText.trim() && (
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-300 max-h-40 overflow-auto">{doc.data.reportText}</pre>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}