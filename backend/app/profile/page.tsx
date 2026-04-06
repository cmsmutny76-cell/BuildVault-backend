"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { webApi, type UserProfile } from "../../lib/web/apiClient";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser, type WebUserType } from "../../lib/web/authStorage";

const ACCOUNT_META: Record<
  WebUserType,
  {
    label: string;
    description: string;
    badge: string;
    href?: string;
    ctaTitle?: string;
    ctaDescription?: string;
    ctaClassName: string;
  }
> = {
  homeowner: {
    label: 'Homeowner',
    description: 'Free access for managing projects and finding contractors.',
    badge: 'Free',
    href: '/project-profile',
    ctaTitle: 'Create Project Profile',
    ctaDescription: 'Define scope and preferences to match with the right contractors.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 text-zinc-900 hover:bg-blue-100',
  },
  employment_seeker: {
    label: 'Employment Seeker',
    description: 'Free access for job and career opportunity discovery.',
    badge: 'Free',
    ctaClassName: 'mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-zinc-900',
  },
  contractor: {
    label: 'Contractor',
    description: 'Paid lead generation and project matching profile.',
    badge: '$49.99 / Month',
    href: '/contractor-profile',
    ctaTitle: 'Complete Contractor Profile',
    ctaDescription: 'Set up detailed profile for AI-powered project matching.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-300 bg-blue-900 px-4 py-4 text-white hover:bg-blue-800',
  },
  commercial_builder: {
    label: 'Commercial Builder',
    description: 'Paid commercial project pipeline and qualification profile.',
    badge: '$99.99 / Month',
    href: '/commercial-builder-profile',
    ctaTitle: 'Complete Commercial Builder Profile',
    ctaDescription: 'Set up commercial project types, scale, and service area.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-300 bg-blue-900 px-4 py-4 text-white hover:bg-blue-800',
  },
  multi_family_owner: {
    label: 'Multi-Family Owner',
    description: 'Paid portfolio management and renovation matching profile.',
    badge: '$99.99 / Month',
    href: '/multi-family-profile',
    ctaTitle: 'Complete Multi-Family Profile',
    ctaDescription: 'Set up portfolio size, unit counts, and renovation scope.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-300 bg-blue-900 px-4 py-4 text-white hover:bg-blue-800',
  },
  apartment_owner: {
    label: 'Apartment Owner',
    description: 'Paid apartment portfolio and turnover matching profile.',
    badge: '$99.99 / Month',
    href: '/apartment-owner-profile',
    ctaTitle: 'Complete Apartment Owner Profile',
    ctaDescription: 'Set up unit count, class, and renovation focus.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-300 bg-blue-900 px-4 py-4 text-white hover:bg-blue-800',
  },
  developer: {
    label: 'Developer',
    description: 'Paid development pipeline and partner matching profile.',
    badge: '$99.99 / Month',
    href: '/developer-profile',
    ctaTitle: 'Complete Developer Profile',
    ctaDescription: 'Set up development focus, portfolio scale, and markets.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-300 bg-blue-900 px-4 py-4 text-white hover:bg-blue-800',
  },
  landscaper: {
    label: 'Landscaper',
    description: 'Paid outdoor services and property matching profile.',
    badge: '$49.99 / Month',
    href: '/landscaper-profile',
    ctaTitle: 'Complete Landscaper Profile',
    ctaDescription: 'Set up services, certifications, and client mix.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-300 bg-blue-900 px-4 py-4 text-white hover:bg-blue-800',
  },
  school: {
    label: 'Trade School',
    description: 'Paid career partnership and placement matching profile.',
    badge: '$49.99 / Month',
    href: '/school-profile',
    ctaTitle: 'Complete School Profile',
    ctaDescription: 'Set up programs, placement data, and employer alignment.',
    ctaClassName: 'mt-4 flex items-center justify-between rounded-lg border border-blue-300 bg-blue-900 px-4 py-4 text-white hover:bg-blue-800',
  },
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    userType: "homeowner",
  });

  const [contractorInfo, setContractorInfo] = useState({
    businessName: "",
    licenseNumber: "",
    serviceAreas: "",
    specialties: "",
  });

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();

    if (!authUser || !token) {
      router.replace("/");
      return;
    }

    setUser(authUser);
    loadProfile(authUser.id);
  }, [router]);

  const loadProfile = async (userId: string) => {
    setLoading(true);
    setError("");

    try {
      const profileData = await webApi.getProfile(userId);
      const loadedProfile: UserProfile = profileData.profile || {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        userType: "homeowner",
      };

      setProfile({
        firstName: loadedProfile.firstName || "",
        lastName: loadedProfile.lastName || "",
        email: loadedProfile.email || "",
        phone: loadedProfile.phone || "",
        address: loadedProfile.address || "",
        city: loadedProfile.city || "",
        state: loadedProfile.state || "",
        zipCode: loadedProfile.zipCode || "",
        userType: loadedProfile.userType || "homeowner",
      });

      if (loadedProfile.userType === "contractor") {
        setContractorInfo({
          businessName: loadedProfile.businessName || "",
          licenseNumber: loadedProfile.licenseNumber || "",
          serviceAreas: Array.isArray(loadedProfile.serviceAreas)
            ? loadedProfile.serviceAreas.join(", ")
            : loadedProfile.serviceAreas || "",
          specialties: Array.isArray(loadedProfile.specialties)
            ? loadedProfile.specialties.join(", ")
            : loadedProfile.specialties || "",
        });
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const profileData = {
        ...profile,
        ...(profile.userType === "contractor" && {
          businessName: contractorInfo.businessName,
          licenseNumber: contractorInfo.licenseNumber,
          serviceAreas: contractorInfo.serviceAreas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          specialties: contractorInfo.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      };

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...profileData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save profile");
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to save profile";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    clearAuthSession();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/45 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <div className="text-center text-zinc-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black/45 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <div className="text-center text-zinc-600">Loading...</div>
        </div>
      </div>
    );
  }

  const accountMeta = ACCOUNT_META[(profile.userType || user.userType || 'homeowner') as WebUserType];

  return (
    <div className="min-h-screen bg-black/45 px-6 py-10 text-zinc-100">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Top Navigation */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              ← Back
            </Link>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                ☰
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-zinc-300 bg-white text-zinc-900 shadow-lg">
                  <div>
                    <Link
                      href="/profile"
                      className="block w-full px-4 py-2 text-left text-sm font-semibold text-blue-600 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/photo-analysis"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      📸 Photo Analysis
                    </Link>
                    <Link
                      href="/blueprint-analysis"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      📐 Blueprint Analysis
                    </Link>
                    <Link
                      href="/building-codes"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      🏛️ Building Codes
                    </Link>
                    <Link
                      href="/price-comparison"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      💰 Price Comparison
                    </Link>
                    <Link
                      href="/find-contractors"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      👷 Find Contractors
                    </Link>
                    <Link
                      href="/permit-assistance"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      📋 Permit Assistance
                    </Link>
                    <Link
                      href="/settings"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      ⚙️ Settings
                    </Link>
                    <div className="border-t border-zinc-200"></div>
                    <Link
                      href="/help"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      ℹ️ Help & Support
                    </Link>
                    <div className="border-t border-zinc-200"></div>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-100"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Profile Header */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <h1 className="text-2xl font-bold text-zinc-900">Profile</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage your account settings</p>
        </section>

        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>
        )}

        {/* Account Type */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-zinc-900">Account Type</h3>
              <p className="text-sm text-zinc-600">{accountMeta.label}</p>
              <p className="mt-1 text-sm text-zinc-500">{accountMeta.description}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accountMeta.badge === 'Free' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
              {accountMeta.badge}
            </span>
          </div>

          {accountMeta.href && accountMeta.ctaTitle && accountMeta.ctaDescription ? (
            <Link href={accountMeta.href} className={accountMeta.ctaClassName}>
              <div>
                <p className="text-base font-semibold">{accountMeta.ctaTitle}</p>
                <p className={accountMeta.href === '/project-profile' ? 'text-sm text-zinc-700' : 'text-sm text-blue-100'}>
                  {accountMeta.ctaDescription}
                </p>
              </div>
              <span className={accountMeta.href === '/project-profile' ? 'text-xl font-bold text-blue-700' : 'text-xl font-bold text-amber-300'}>→</span>
            </Link>
          ) : (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              Career opportunity accounts stay free. Profile enhancements for this account type are managed through the category experience.
            </div>
          )}
        </section>

        {/* Basic Information */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Basic Information</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">First Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                placeholder="John"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Last Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Phone</label>
              <input
                type="tel"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Address</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">Street Address</label>
              <input
                type="text"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">City</label>
              <input
                type="text"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Austin"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">State</label>
                <input
                  type="text"
                  maxLength={2}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value.toUpperCase() })}
                  placeholder="TX"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">ZIP Code</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                  value={profile.zipCode}
                  onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                  placeholder="78701"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contractor Information */}
        {profile.userType === "contractor" && (
          <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Contractor Information</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Business Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                  value={contractorInfo.businessName}
                  onChange={(e) =>
                    setContractorInfo({ ...contractorInfo, businessName: e.target.value })
                  }
                  placeholder="ABC Construction LLC"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">License Number</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                  value={contractorInfo.licenseNumber}
                  onChange={(e) =>
                    setContractorInfo({ ...contractorInfo, licenseNumber: e.target.value })
                  }
                  placeholder="C-12345678"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Service Areas (comma-separated ZIP codes)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                  value={contractorInfo.serviceAreas}
                  onChange={(e) =>
                    setContractorInfo({ ...contractorInfo, serviceAreas: e.target.value })
                  }
                  placeholder="78701, 78702, 78703"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Specialties (comma-separated)
                </label>
                <textarea
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                  value={contractorInfo.specialties}
                  onChange={(e) =>
                    setContractorInfo({ ...contractorInfo, specialties: e.target.value })
                  }
                  placeholder="Roofing, Flooring, Painting"
                  rows={3}
                />
              </div>
            </div>
          </section>
        )}

        {/* Save Button */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </section>
      </main>
    </div>
  );
}
