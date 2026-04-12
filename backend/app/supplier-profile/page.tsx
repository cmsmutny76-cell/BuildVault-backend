"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken, getAuthUser, type WebUserType } from "../../lib/web/authStorage";

const categoryOptions = ["Lumber", "Concrete", "Drywall", "Fasteners", "Finishes", "Fixtures", "Landscape Materials", "Equipment Rental"];
const audienceOptions = [
  { value: "homeowner", label: "Homeowners" },
  { value: "employment_seeker", label: "Employment Seekers" },
  { value: "contractor", label: "Contractors" },
  { value: "supplier", label: "Other Suppliers" },
  { value: "commercial_builder", label: "Commercial Builders" },
  { value: "multi_family_owner", label: "Multi-Family Owners" },
  { value: "apartment_owner", label: "Apartment Owners" },
  { value: "developer", label: "Developers" },
  { value: "landscaper", label: "Landscapers" },
  { value: "school", label: "Trade Schools" },
] as const;

export default function SupplierProfilePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>(["Lumber"]);
  const [audience, setAudience] = useState<WebUserType[]>(["contractor", "commercial_builder", "developer", "landscaper"]);
  const [restricted, setRestricted] = useState(true);
  const [specialServices, setSpecialServices] = useState("");
  const [customOrderMaterials, setCustomOrderMaterials] = useState("");
  const [catalogSheetUrls, setCatalogSheetUrls] = useState("");
  const [leadTimeDetails, setLeadTimeDetails] = useState("");
  const [minimumOrderQuantities, setMinimumOrderQuantities] = useState("");
  const [fabricationCapabilities, setFabricationCapabilities] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!user || !token) {
      router.replace("/");
      return;
    }

    if (user.userType !== "supplier") {
      router.replace("/profile");
      return;
    }

    setEmail(user.email);

    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile?userId=${encodeURIComponent(user.id)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok || !data.success || !data.profile) return;

        const profile = data.profile as {
          businessName?: string;
          phone?: string;
          email?: string;
          city?: string;
          state?: string;
          serviceAreas?: string[];
          supplierDescription?: string;
          supplierCategories?: string[];
          supplierAudience?: WebUserType[];
          supplierVisibilityRestricted?: boolean;
          supplierSpecialServices?: string[];
          customOrderMaterials?: string[];
          catalogSheetUrls?: string[];
          leadTimeDetails?: string;
          minimumOrderQuantities?: string;
          fabricationCapabilities?: string;
        };

        setBusinessName(profile.businessName || "");
        setPhone(profile.phone || "");
        setEmail(profile.email || user.email);
        setCity(profile.city || "");
        setState(profile.state || "");
        setServiceAreas(Array.isArray(profile.serviceAreas) ? profile.serviceAreas.join(", ") : "");
        setDescription(profile.supplierDescription || "");
        setCategories(Array.isArray(profile.supplierCategories) && profile.supplierCategories.length > 0 ? profile.supplierCategories : ["Lumber"]);
        setAudience(Array.isArray(profile.supplierAudience) && profile.supplierAudience.length > 0 ? profile.supplierAudience : ["contractor", "commercial_builder", "developer", "landscaper"]);
        setRestricted(profile.supplierVisibilityRestricted !== false);
        setSpecialServices(Array.isArray(profile.supplierSpecialServices) ? profile.supplierSpecialServices.join(", ") : "");
        setCustomOrderMaterials(Array.isArray(profile.customOrderMaterials) ? profile.customOrderMaterials.join(", ") : "");
        setCatalogSheetUrls(Array.isArray(profile.catalogSheetUrls) ? profile.catalogSheetUrls.join(", ") : "");
        setLeadTimeDetails(profile.leadTimeDetails || "");
        setMinimumOrderQuantities(profile.minimumOrderQuantities || "");
        setFabricationCapabilities(profile.fabricationCapabilities || "");
      } catch {
        // Keep the form usable even if prior profile data is unavailable.
      }
    };

    void loadProfile();
  }, [router]);

  const toggleArrayValue = <T extends string>(values: T[], nextValue: T, setter: (next: T[]) => void) => {
    if (values.includes(nextValue)) {
      setter(values.filter((value) => value !== nextValue));
      return;
    }
    setter([...values, nextValue]);
  };

  const handleSave = async () => {
    const user = getAuthUser();
    if (!user) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.id,
          userType: "supplier",
          businessName,
          phone,
          email,
          city,
          state,
          serviceAreas: serviceAreas.split(",").map((item) => item.trim()).filter(Boolean),
          supplierCategories: categories,
          supplierAudience: audience,
          supplierVisibilityRestricted: restricted,
          supplierDescription: description,
          supplierSpecialServices: specialServices.split(",").map((item) => item.trim()).filter(Boolean),
          customOrderMaterials: customOrderMaterials.split(",").map((item) => item.trim()).filter(Boolean),
          catalogSheetUrls: catalogSheetUrls.split(",").map((item) => item.trim()).filter(Boolean),
          leadTimeDetails,
          minimumOrderQuantities,
          fabricationCapabilities,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save supplier profile");
      }

      setMessage("Supplier profile saved. Your visibility, special services, and custom-order material options are updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save supplier profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-10 text-slate-100">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <Link href="/profile" className="text-sm font-semibold text-amber-300 hover:text-amber-200">← Back</Link>
          <h1 className="mt-3 text-3xl font-bold text-white">Complete Your Supplier Profile</h1>
          <p className="mt-1 text-sm text-slate-300">Set your materials, coverage area, special services, custom orders, and choose exactly which account types can see your listing.</p>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-xl font-bold text-white">Supplier Identity</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Business Name *</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="BuildSource Supply Co." />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Email *</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="sales@buildsource.com" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Phone *</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(555) 555-1212" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">City *</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Houston" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">State *</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={state} onChange={(event) => setState(event.target.value)} placeholder="TX" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Service Areas</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={serviceAreas} onChange={(event) => setServiceAreas(event.target.value)} placeholder="Houston Metro, Austin, San Antonio" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Supplier Description</span>
              <textarea className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What products you supply, delivery model, trade pricing, and lead times." />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Special Services Offered</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={specialServices} onChange={(event) => setSpecialServices(event.target.value)} placeholder="Jobsite delivery, takeoff support, rush fulfillment, crane coordination" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Custom Order Materials</span>
              <textarea className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" rows={3} value={customOrderMaterials} onChange={(event) => setCustomOrderMaterials(event.target.value)} placeholder="Custom trusses, special-order stone, fabricated steel, made-to-order doors" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Catalog Sheet Links</span>
              <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={catalogSheetUrls} onChange={(event) => setCatalogSheetUrls(event.target.value)} placeholder="https://...pdf, https://...xlsx" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Lead Time Details</span>
              <textarea className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" rows={3} value={leadTimeDetails} onChange={(event) => setLeadTimeDetails(event.target.value)} placeholder="Standard and special-order lead times by material type." />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Minimum Order Quantities (MOQ)</span>
              <textarea className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" rows={2} value={minimumOrderQuantities} onChange={(event) => setMinimumOrderQuantities(event.target.value)} placeholder="List minimum quantities or pallet requirements." />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-200">Custom Fabrication Capabilities</span>
              <textarea className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" rows={2} value={fabricationCapabilities} onChange={(event) => setFabricationCapabilities(event.target.value)} placeholder="Cut-to-size, prefab kits, custom bending, or other fabrication support." />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-xl font-bold text-white">Products and Visibility</h2>
          <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">Supplier Categories</p>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button key={category} type="button" onClick={() => toggleArrayValue(categories, category, setCategories)} className={`rounded-full border px-4 py-2 text-sm ${categories.includes(category) ? "border-amber-400 bg-amber-400/30 text-amber-200" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">Who Can See This Profile</p>
              <p className="mb-3 text-xs text-slate-400">Click the audience types below to include or exclude them from the supplier list.</p>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => (
                  <button key={option.value} type="button" onClick={() => toggleArrayValue(audience, option.value, setAudience)} className={`rounded-full border px-4 py-2 text-sm ${audience.includes(option.value) ? "border-emerald-400 bg-emerald-400/20 text-emerald-200" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3">
              <input type="checkbox" checked={restricted} onChange={(event) => setRestricted(event.target.checked)} className="h-4 w-4" />
              <span className="text-sm text-slate-200">Only show my supplier profile to the selected audience types above</span>
            </label>
          </div>
        </section>

        {(message || error) && (
          <section className={`rounded-xl border p-4 ${error ? "border-red-500/40 bg-red-950/40 text-red-200" : "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"}`}>
            {error || message}
          </section>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/profile" className="rounded-lg border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">Cancel</Link>
          <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-60">
            {saving ? "Saving..." : "Save Supplier Profile"}
          </button>
        </div>
      </main>
    </div>
  );
}
