"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken, getAuthUser } from "../../lib/web/authStorage";

type Step = "basic" | "details" | "requirements" | "considerations" | "contact";

const stepOrder: Step[] = ["basic", "details", "requirements", "considerations", "contact"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProjectProfilePage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>("basic");

  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState<"standard-remodel" | "custom-job">("standard-remodel");
  const [projectScale, setProjectScale] = useState<"small-repair" | "medium-remodel" | "large-renovation" | "new-construction">("medium-remodel");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(50000);
  const [propertyType, setPropertyType] = useState<"single-family" | "condo-townhouse" | "multi-family" | "commercial" | "industrial">("single-family");
  const [propertyAge, setPropertyAge] = useState<"new" | "0-10" | "10-30" | "30-50" | "50+">("10-30");
  const [propertySize, setPropertySize] = useState("");
  const [propertyOccupied, setPropertyOccupied] = useState(true);

  const [urgencyLevel, setUrgencyLevel] = useState<"emergency" | "asap" | "1-month" | "3-months" | "6-months" | "flexible">("flexible");
  const [startDate, setStartDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [timelineFlexible, setTimelineFlexible] = useState(true);
  const [requiresLicensed, setRequiresLicensed] = useState(true);
  const [requiresInsured, setRequiresInsured] = useState(true);
  const [requiresBonded, setRequiresBonded] = useState(false);

  const [specialRequirements, setSpecialRequirements] = useState("");
  const [hasPermits, setHasPermits] = useState(false);
  const [hasHoa, setHasHoa] = useState(false);
  const [hoaRestrictions, setHoaRestrictions] = useState("");
  const [noiseRestrictions, setNoiseRestrictions] = useState(false);
  const [workHourRestrictions, setWorkHourRestrictions] = useState("");
  const [parkingAccess, setParkingAccess] = useState("");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState("");
  const [debrisRemoval, setDebrisRemoval] = useState<"contractor" | "homeowner" | "discuss">("contractor");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"email" | "phone" | "text" | "any">("any");
  const [bestTimeToContact, setBestTimeToContact] = useState("");
  const [responseTimeExpectation, setResponseTimeExpectation] = useState<"immediate" | "same-day" | "within-24hrs" | "flexible">("flexible");
  const [preferredMeetingType, setPreferredMeetingType] = useState<"in-person" | "virtual" | "either">("either");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!user || !token) {
      router.replace("/");
    }
  }, [router]);

  const addService = (service: string) => {
    if (!selectedServices.includes(service)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeService = (service: string) => {
    setSelectedServices(selectedServices.filter((item) => item !== service));
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

  const generateAiDescription = () => {
    if (!title) {
      setError("Enter a project title first, then generate AI description.");
      return;
    }

    setError("");
    const generatedText = `Project Overview:\n${title}\n\nScope of Work:\n- Professional ${projectType === "custom-job" ? "custom design and build" : "standard remodel"}\n- Services needed: ${selectedServices.length > 0 ? selectedServices.join(", ") : "service details to be confirmed"}\n- Budget target: ${formatCurrency(budget)}\n- Quality workmanship and clean site management\n\nSpecial Considerations:\n- Property type: ${propertyType}\n- Urgency: ${urgencyLevel}\n- Licensed contractor required: ${requiresLicensed ? "Yes" : "No"}`;

    setDescription(generatedText);
  };

  const handleSave = () => {
    setError("");
    setMessage("");

    if (!title || !street || !city || !state || !zipCode || !contactName || !email || !phone) {
      setError("Please fill in all required fields before saving.");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Add at least one service needed for the project.");
      return;
    }

    setMessage("Project profile saved. Matching contractors can now review your project details.");
  };

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-10 text-slate-100">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <Link href="/profile" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
            ← Back
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-white">Create Project Profile</h1>
          <p className="mt-1 text-sm text-slate-300">Define scope, requirements, special considerations, and contact preferences.</p>
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

        {currentStep === "basic" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">📋 Basic Information</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Project Title *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Kitchen Remodel, New Deck Installation" />
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Project Type *</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setProjectType("standard-remodel")} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${projectType === "standard-remodel" ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                    Standard Remodel
                  </button>
                  <button type="button" onClick={() => setProjectType("custom-job")} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${projectType === "custom-job" ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                    Custom Job
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Project Scale *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["small-repair", "Small Repair"],
                    ["medium-remodel", "Medium Remodel"],
                    ["large-renovation", "Large Renovation"],
                    ["new-construction", "New Construction"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setProjectScale(value as typeof projectScale)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${projectScale === value ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Services Needed *</span>
                {selectedServices.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <span key={service} className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/20 px-3 py-1 text-sm text-amber-100">
                        {service}
                        <button type="button" onClick={() => removeService(service)} className="text-amber-200 hover:text-white">✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {["Plumbing", "Roofing", "Electrical", "HVAC", "Painting", "Flooring", "Full Project", "Handyman"].map((service) => (
                    <button key={service} type="button" onClick={() => addService(service)} className="rounded-full border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-600">
                      + {service}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {currentStep === "details" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">📝 Project Details</h2>

            <div className="mt-5 rounded-lg border border-violet-500/40 bg-violet-500/10 p-4">
              <h3 className="text-sm font-bold text-violet-200">✨ AI-Powered Description</h3>
              <p className="mt-1 text-sm text-violet-100">Generate a detailed project outline from your selected details.</p>
              <button type="button" onClick={generateAiDescription} className="mt-3 rounded-lg border border-violet-400 bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400">
                ✨ Generate Description with AI
              </button>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-semibold text-slate-200">Project Description *</span>
              <textarea className="h-44 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe scope, materials, timeline, and special requirements." />
            </label>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Budget *</span>
                <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
                  <p className="text-lg font-bold text-amber-200">{formatCurrency(budget)}</p>
                  <input type="range" min={0} max={10000000} step={5000} value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-3 w-full" />
                  <div className="mt-1 flex justify-between text-xs text-slate-300">
                    <span>$0</span>
                    <span>$10M</span>
                  </div>
                </div>
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Property Type *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["single-family", "Single Family"],
                    ["condo-townhouse", "Condo/Townhouse"],
                    ["multi-family", "Multi-Family"],
                    ["commercial", "Commercial"],
                    ["industrial", "Industrial"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setPropertyType(value as typeof propertyType)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${propertyType === value ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Property Size (sq ft)</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={propertySize} onChange={(event) => setPropertySize(event.target.value)} placeholder="2000" />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Property Age *</span>
                <div className="flex flex-wrap gap-2">
                  {["new", "0-10", "10-30", "30-50", "50+"].map((age) => (
                    <button key={age} type="button" onClick={() => setPropertyAge(age as typeof propertyAge)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${propertyAge === age ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <label className="md:col-span-2 flex items-center gap-3 text-slate-200">
                <input type="checkbox" checked={propertyOccupied} onChange={(event) => setPropertyOccupied(event.target.checked)} />
                Property is currently occupied
              </label>
            </div>
          </section>
        )}

        {currentStep === "requirements" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">⚙️ Timeline & Contractor Requirements</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-200">Urgency Level *</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["emergency", "🚨 Emergency"],
                    ["asap", "ASAP"],
                    ["1-month", "Within 1 Month"],
                    ["3-months", "Within 3 Months"],
                    ["6-months", "Within 6 Months"],
                    ["flexible", "Flexible"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setUrgencyLevel(value as typeof urgencyLevel)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${urgencyLevel === value ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Desired Start Date</span>
                  <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={startDate} onChange={(event) => setStartDate(event.target.value)} placeholder="MM/DD/YYYY or Flexible" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Target Completion Date</span>
                  <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={completionDate} onChange={(event) => setCompletionDate(event.target.value)} placeholder="MM/DD/YYYY or Flexible" />
                </label>
              </div>

              <label className="flex items-center gap-3 text-slate-200">
                <input type="checkbox" checked={timelineFlexible} onChange={(event) => setTimelineFlexible(event.target.checked)} />
                Timeline is flexible
              </label>

              <div className="rounded-lg border border-slate-600 bg-slate-700 p-4">
                <p className="text-sm font-semibold text-slate-200">Required Certifications</p>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={requiresLicensed} onChange={(event) => setRequiresLicensed(event.target.checked)} />
                    Must be licensed
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={requiresInsured} onChange={(event) => setRequiresInsured(event.target.checked)} />
                    Must be insured
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={requiresBonded} onChange={(event) => setRequiresBonded(event.target.checked)} />
                    Must be bonded
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}

        {currentStep === "considerations" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">🔍 Special Considerations</h2>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Special Requirements</span>
                <textarea className="h-24 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={specialRequirements} onChange={(event) => setSpecialRequirements(event.target.value)} placeholder="Unique needs, preferences, or constraints" />
              </label>

              <div className="space-y-2 text-slate-200">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={hasPermits} onChange={(event) => setHasPermits(event.target.checked)} />
                  Permits already obtained
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={hasHoa} onChange={(event) => setHasHoa(event.target.checked)} />
                  HOA approval required
                </label>
              </div>

              {hasHoa && (
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-200">HOA Restrictions</span>
                  <textarea className="h-20 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={hoaRestrictions} onChange={(event) => setHoaRestrictions(event.target.value)} placeholder="Describe HOA rules" />
                </label>
              )}

              <label className="flex items-center gap-3 text-slate-200">
                <input type="checkbox" checked={noiseRestrictions} onChange={(event) => setNoiseRestrictions(event.target.checked)} />
                Noise restrictions apply
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Work Hours / Scheduling Notes</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={workHourRestrictions} onChange={(event) => setWorkHourRestrictions(event.target.value)} placeholder="Weekends only, after 5pm, etc." />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Parking & Site Access</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={parkingAccess} onChange={(event) => setParkingAccess(event.target.value)} placeholder="Describe access and parking" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-200">Accessibility Needs</span>
                <textarea className="h-20 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={accessibilityNeeds} onChange={(event) => setAccessibilityNeeds(event.target.value)} placeholder="Any accessibility considerations" />
              </label>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-200">Debris & Waste Removal *</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["contractor", "Contractor Handles"],
                    ["homeowner", "I Will Handle"],
                    ["discuss", "Need to Discuss"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setDebrisRemoval(value as typeof debrisRemoval)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${debrisRemoval === value ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {currentStep === "contact" && (
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">📍 Location & Contact</h2>
            <div className="mt-3 rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-200">
              🔒 Map location is only visible to contractors with paid subscriptions.
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Street Address *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={street} onChange={(event) => setStreet(event.target.value)} placeholder="123 Main Street" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">City *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" />
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
                <span className="text-sm font-semibold text-slate-200">Contact Name *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Jane Smith" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Email *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Phone *</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(555) 123-4567" />
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Preferred Contact Method *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["email", "📧 Email"],
                    ["phone", "📞 Phone"],
                    ["text", "💬 Text"],
                    ["any", "Any Method"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setPreferredContactMethod(value as typeof preferredContactMethod)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${preferredContactMethod === value ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Best Time to Contact</span>
                <input className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3" value={bestTimeToContact} onChange={(event) => setBestTimeToContact(event.target.value)} placeholder="Weekday mornings" />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Response Time Expectation *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["immediate", "Immediate"],
                    ["same-day", "Same Day"],
                    ["within-24hrs", "Within 24 Hours"],
                    ["flexible", "Flexible"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setResponseTimeExpectation(value as typeof responseTimeExpectation)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${responseTimeExpectation === value ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-200">Preferred Meeting Type *</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["in-person", "In-Person"],
                    ["virtual", "Virtual"],
                    ["either", "Either"],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setPreferredMeetingType(value as typeof preferredMeetingType)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${preferredMeetingType === value ? "border-amber-400 bg-amber-400 text-slate-900" : "border-slate-600 bg-slate-700 text-slate-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {error && <div className="rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
        {message && <div className="rounded-lg border border-green-400/50 bg-green-500/10 p-3 text-sm text-green-200">{message}</div>}

        <section className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex flex-wrap justify-end gap-3">
            {currentStep !== "basic" && (
              <button type="button" onClick={previousStep} className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600">
                ← Previous
              </button>
            )}
            {currentStep !== "contact" ? (
              <button type="button" onClick={nextStep} className="rounded-lg border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSave} className="rounded-lg border border-amber-400 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                💾 Save Project Profile
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
