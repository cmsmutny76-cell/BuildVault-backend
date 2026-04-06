"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken, getAuthUser } from "../../lib/web/authStorage";

type Step = "business" | "services" | "certifications" | "area";

const stepOrder: Step[] = ["business", "services", "certifications", "area"];

const categoryOptions = ["residential", "commercial", "apartment", "landscaping"];
const serviceOptions = [
  "full-project",
  "plumbing",
  "roofing",
  "electrical",
  "hvac",
  "painting",
  "flooring",
  "minor-repairs",
  "handyman",
];
const projectTypeOptions = ["standard-remodel", "custom-job"];
const experienceOptions = ["entry-level", "intermediate", "expert", "master-craftsman"];
const budgetOptions = ["under-5k", "5k-15k", "15k-50k", "50k-100k", "100k-250k", "250k-500k", "500k-plus"];

function formatLabel(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ContractorProfilePage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>("business");

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<"sole-proprietor" | "llc" | "corporation" | "partnership">("llc");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [completedProjects, setCompletedProjects] = useState("");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [isInsured, setIsInsured] = useState(false);
  const [isBonded, setIsBonded] = useState(false);

  const [categories, setCategories] = useState<string[]>(["residential"]);
  const [serviceTypes, setServiceTypes] = useState<string[]>(["full-project"]);
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [projectTypes, setProjectTypes] = useState<string[]>(["standard-remodel"]);

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [serviceRadius, setServiceRadius] = useState("25");
  const [additionalZips, setAdditionalZips] = useState("");

  const [budgetRanges, setBudgetRanges] = useState<string[]>(["15k-50k"]);
  const [isAccepting, setIsAccepting] = useState(true);
  const [maxProjects, setMaxProjects] = useState("3");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!user || !token) {
      router.replace("/");
    }
  }, [router]);

  const toggleSelection = (items: string[], setter: (next: string[]) => void, value: string) => {
    if (items.includes(value)) {
      setter(items.filter((item) => item !== value));
      return;
    }
    setter([...items, value]);
  };

  const stepIndex = stepOrder.indexOf(currentStep);

  const previousStep = () => {
    if (stepIndex > 0) {
      setCurrentStep(stepOrder[stepIndex - 1]);
    }
  };

  const nextStep = () => {
    if (stepIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[stepIndex + 1]);
    }
  };

  const handleSave = () => {
    setError("");
    setMessage("");

    if (!businessName || !email || !phone || !city || !state || !zipCode) {
      setError("Please fill in all required fields before saving.");
      return;
    }

    if (categories.length === 0 || serviceTypes.length === 0) {
      setError("Select at least one project category and one service type.");
      return;
    }

    setMessage("Contractor profile saved. Your setup is now ready for AI-powered matching.");
  };

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-10 text-slate-100">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <Link href="/profile" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
            ← Back
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-white">Complete Your Contractor Profile</h1>
          <p className="mt-1 text-sm text-slate-300">
            Set up business details, services, certifications, and service area for project matching.
          </p>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            {stepOrder.map((step, index) => {
              const isActive = step === currentStep;
              const isCompleted = index < stepIndex;
              return (
                <div key={step} className="flex flex-1 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step)}
                    className={`h-9 w-9 rounded-full border text-sm font-bold ${
                      isActive
                        ? "border-amber-400 bg-amber-400 text-slate-900"
                        : isCompleted
                          ? "border-amber-400 bg-amber-400/30 text-amber-300"
                          : "border-slate-600 bg-slate-700 text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                  {index < stepOrder.length - 1 && <div className="h-0.5 flex-1 bg-slate-600" />}
                </div>
              );
            })}
          </div>
        </section>

        {currentStep === "business" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">🏢 Business Information</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Business Name *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Your Company Name LLC" />
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Business Type *</span>
                <div className="flex flex-wrap gap-2">
                  {(["sole-proprietor", "llc", "corporation", "partnership"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setBusinessType(type)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${businessType === type ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {formatLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Years in Business *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={yearsInBusiness} onChange={(event) => setYearsInBusiness(event.target.value)} placeholder="5" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Completed Projects</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={completedProjects} onChange={(event) => setCompletedProjects(event.target.value)} placeholder="50" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Email Address *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="business@example.com" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Phone Number *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(555) 123-4567" />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Website (Optional)</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="www.yourcompany.com" />
              </label>
            </div>
          </section>
        )}

        {currentStep === "services" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">🔨 Services & Specializations</h2>

            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-200">Project Categories *</p>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleSelection(categories, setCategories, category)}
                      className={`rounded-full border px-4 py-2 text-sm ${categories.includes(category) ? "border-amber-400 bg-amber-400/30 text-amber-200" : "border-slate-600 bg-slate-700 text-slate-200"}`}
                    >
                      {formatLabel(category)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-200">Service Types *</p>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleSelection(serviceTypes, setServiceTypes, service)}
                      className={`rounded-full border px-4 py-2 text-sm ${serviceTypes.includes(service) ? "border-amber-400 bg-amber-400/30 text-amber-200" : "border-slate-600 bg-slate-700 text-slate-200"}`}
                    >
                      {formatLabel(service)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-200">Project Type Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {projectTypeOptions.map((projectType) => (
                    <button
                      key={projectType}
                      type="button"
                      onClick={() => toggleSelection(projectTypes, setProjectTypes, projectType)}
                      className={`rounded-full border px-4 py-2 text-sm ${projectTypes.includes(projectType) ? "border-amber-400 bg-amber-400/30 text-amber-200" : "border-slate-600 bg-slate-700 text-slate-200"}`}
                    >
                      {formatLabel(projectType)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-200">Experience Level *</p>
                <div className="flex flex-wrap gap-2">
                  {experienceOptions.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${experienceLevel === level ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}
                    >
                      {formatLabel(level)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-200">Typical Budget Ranges</p>
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map((budgetRange) => (
                    <button
                      key={budgetRange}
                      type="button"
                      onClick={() => toggleSelection(budgetRanges, setBudgetRanges, budgetRange)}
                      className={`rounded-full border px-4 py-2 text-sm ${budgetRanges.includes(budgetRange) ? "border-amber-400 bg-amber-400/30 text-amber-200" : "border-slate-600 bg-slate-700 text-slate-200"}`}
                    >
                      {budgetRange.replace("under-", "< ").replace("-plus", "+").replace(/k/g, "K")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {currentStep === "certifications" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">📜 Licenses & Certifications</h2>

            <div className="mt-5 rounded-lg border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-200">
              🏆 Complete certifications increase your match score and build trust with homeowners.
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">License Number</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} placeholder="CA-123456" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">License State</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={licenseState} onChange={(event) => setLicenseState(event.target.value)} placeholder="CA" maxLength={2} />
              </label>
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex items-center gap-3 text-slate-200">
                <input type="checkbox" checked={isInsured} onChange={(event) => setIsInsured(event.target.checked)} />
                Currently Insured
              </label>
              <label className="flex items-center gap-3 text-slate-200">
                <input type="checkbox" checked={isBonded} onChange={(event) => setIsBonded(event.target.checked)} />
                Currently Bonded
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-violet-500/40 bg-violet-500/10 p-4 text-sm text-violet-200">
              📋 Verification documents can be uploaded in account settings.
            </div>
          </section>
        )}

        {currentStep === "area" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">📍 Service Area & Availability</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">City *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Los Angeles" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">State *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="CA" maxLength={2} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">ZIP Code *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={zipCode} onChange={(event) => setZipCode(event.target.value)} placeholder="90001" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Service Radius (miles) *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={serviceRadius} onChange={(event) => setServiceRadius(event.target.value)} placeholder="25" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Additional ZIP Codes</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={additionalZips} onChange={(event) => setAdditionalZips(event.target.value)} placeholder="90002, 90003, 90004" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Maximum Projects Per Month</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={maxProjects} onChange={(event) => setMaxProjects(event.target.value)} placeholder="3" />
              </label>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 text-slate-200">
                <input type="checkbox" checked={isAccepting} onChange={(event) => setIsAccepting(event.target.checked)} />
                Currently Accepting New Projects
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-200">
              🤖 AI Matching Active: projects in your service area are matched based on your services, budget range, and availability.
            </div>
          </section>
        )}

        {error && <div className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
        {message && <div className="rounded-lg border border-green-400/50 bg-green-500/10 p-3 text-sm text-green-200">{message}</div>}

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex flex-wrap justify-end gap-3">
            {currentStep !== "business" && (
              <button type="button" onClick={previousStep} className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600">
                ← Previous
              </button>
            )}

            {currentStep !== "area" ? (
              <button type="button" onClick={nextStep} className="rounded-lg border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSave} className="rounded-lg border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                💾 Save Contractor Profile
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
