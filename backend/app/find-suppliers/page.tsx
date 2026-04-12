"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthToken, getAuthUser, type WebUserType } from "../../lib/web/authStorage";
import { webApi, type SupplierDirectoryEntry } from "../../lib/web/apiClient";

export default function FindSuppliersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierDirectoryEntry[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();

    if (!user || !token) {
      router.replace("/");
      return;
    }

    const load = async () => {
      try {
        const result = await webApi.getSuppliers(user.userType);
        setSuppliers(result.suppliers || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const user = getAuthUser();
  const canView = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="sticky top-0 z-[1000] border-b border-slate-700 bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-amber-300">BuildVault</Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-300 transition hover:text-white">Dashboard</Link>
            <Link href="/categories" className="text-slate-300 transition hover:text-white">Categories</Link>
            <Link href="/messages" className="text-slate-300 transition hover:text-white">Messages</Link>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-slate-300 transition hover:text-white">☰</button>
              {menuOpen && (
                <div className="absolute right-0 z-[1200] mt-2 w-56 rounded-lg border border-slate-700 bg-slate-900 shadow-lg">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">Profile</Link>
                  <Link href="/find-contractors" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">Find Contractors</Link>
                  <Link href="/find-suppliers" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">Find Suppliers</Link>
                  <Link href="/project-scheduling" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white">Project Scheduling</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="font-semibold text-amber-300">← Back</Link>
          <h1 className="mt-4 text-4xl font-bold text-white">Find Suppliers</h1>
          <p className="mt-2 max-w-3xl text-slate-300">Discover suppliers based on the visibility audiences they selected for their listing.</p>
        </div>

        {loading && <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-200">Loading suppliers...</div>}
        {error && <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 text-red-100">{error}</div>}

        {canView && !loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {suppliers.map((supplier) => (
              <article key={supplier.id} className="rounded-xl border border-amber-300/20 bg-slate-900/80 p-5 text-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{supplier.businessName}</h2>
                    <p className="mt-1 text-sm text-slate-400">{supplier.city}{supplier.state ? `, ${supplier.state}` : ""}</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Audience Controlled</span>
                </div>
                <p className="mt-4 text-sm text-slate-300">{supplier.supplierDescription || "Regional supplier profile"}</p>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.supplierCategories.map((category) => (
                      <span key={category} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200">{category}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-300">
                  <div>Service Areas: {supplier.serviceAreas.join(", ") || "Not listed"}</div>
                  <div>Special Services: {supplier.supplierSpecialServices.join(", ") || "Not listed"}</div>
                  <div>Custom Orders: {supplier.customOrderMaterials.join(", ") || "Not listed"}</div>
                  <div>Catalog Links: {supplier.catalogSheetUrls.join(", ") || "Not listed"}</div>
                  <div>Lead Times: {supplier.leadTimeDetails || "Not listed"}</div>
                  <div>MOQ: {supplier.minimumOrderQuantities || "Not listed"}</div>
                  <div>Fabrication: {supplier.fabricationCapabilities || "Not listed"}</div>
                  <div>Visible To: {supplier.supplierAudience.join(", ") || "All users"}</div>
                  <div>Phone: {supplier.phone || "Not listed"}</div>
                  <div>Email: {supplier.email}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`mailto:${supplier.email}?subject=${encodeURIComponent('BuildVault Supplier Inquiry')}`} className="rounded border border-blue-300/40 px-3 py-1 text-xs font-semibold text-blue-200 hover:bg-blue-900/30">
                    Message Supplier
                  </a>
                  <a href={`mailto:${supplier.email}?subject=${encodeURIComponent('BuildVault Quote Request')}&body=${encodeURIComponent('Please provide pricing and lead time details for the following scope:')}`} className="rounded border border-emerald-300/40 px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/30">
                    Request Quote
                  </a>
                </div>
              </article>
            ))}
            {suppliers.length === 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-300">No supplier profiles are visible for your account type yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
