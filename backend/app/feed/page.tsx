"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "../../lib/web/authStorage";
import { moderateProjectPost } from "../../lib/web/postModeration";

const PROJECT_CATEGORIES: Array<{
  value: string;
  label: string;
  subtitle: string;
  imageUrl: string;
}> = [
  {
    value: "residential",
    label: "Residential",
    subtitle: "Homes & Single-Family",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  },
  {
    value: "commercial",
    label: "Commercial",
    subtitle: "Business & Retail",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    value: "multi-family",
    label: "Multi-Family",
    subtitle: "Condos & Duplexes",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  },
  {
    value: "apartment",
    label: "Apartment",
    subtitle: "Complex & High-Rise",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&sat=-100&brightness=1.1",
  },
  {
    value: "kitchen-remodel",
    label: "Kitchen",
    subtitle: "Cabinets & Finishes",
    imageUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200",
  },
  {
    value: "bathroom-remodel",
    label: "Bathroom",
    subtitle: "Plumbing & Tile",
    imageUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
  },
  {
    value: "roofing",
    label: "Roofing",
    subtitle: "Shingles & Structure",
    imageUrl: "https://images.unsplash.com/photo-1632759145351-1d5920f107e8?w=1200&q=80&fit=crop",
  },
  {
    value: "interior-finishes",
    label: "Interior",
    subtitle: "Paint, Trim & Flooring",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200",
  },
  {
    value: "electrical",
    label: "Electrical",
    subtitle: "Panels & Wiring",
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80",
  },
  {
    value: "plumbing",
    label: "Plumbing",
    subtitle: "Pipes & Fixtures",
    imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200",
  },
  {
    value: "industrial-construction",
    label: "Industrial",
    subtitle: "Warehouses & Facilities",
    imageUrl: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&q=80",
  },
  {
    value: "landscaping",
    label: "Landscaping",
    subtitle: "Outdoor & Hardscape",
    imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
  },
  {
    value: "labor-pool",
    label: "Labor Pool",
    subtitle: "Find Workers & Crews",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  },
  {
    value: "employment",
    label: "Employment",
    subtitle: "Job Opportunities",
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
  },
  {
    value: "developer",
    label: "Developer",
    subtitle: "Property Development",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
  },
  {
    value: "career-opportunities",
    label: "Career Opportunities",
    subtitle: "Training & Development",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",
  },
  {
    value: "food-service",
    label: "Food Service",
    subtitle: "Construction Site Catering",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
  },
];

type FeedPost = {
  id: string;
  authorName: string;
  createdAt: string;
  title: string;
  description: string;
  category: string;
  location: string;
};

export default function FeedPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    {
      id: "post_1",
      authorName: "BuildVault Community",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      title: "Need roofing crew for retail strip repair",
      description: "Seeking licensed roofing team for leak remediation and shingle replacement on a small retail strip center. Project scope includes inspection, material list, and 2-week timeline.",
      category: "roofing",
      location: "Austin, TX",
    },
    {
      id: "post_2",
      authorName: "BuildVault Community",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      title: "Kitchen remodel bid request",
      description: "Homeowner needs a full kitchen remodel including cabinetry, countertops, and lighting updates. Looking for estimates with labor and materials split.",
      category: "kitchen-remodel",
      location: "Round Rock, TX",
    },
    {
      id: "post_3",
      authorName: "BuildVault Community",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      title: "Industrial warehouse electrical upgrade",
      description: "Developer requesting electrical panel and lighting upgrades in warehouse facility. Must meet code compliance and include permit support.",
      category: "industrial-construction",
      location: "Dallas, TX",
    },
  ]);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postCategory, setPostCategory] = useState("residential");
  const [postLocation, setPostLocation] = useState("Austin, TX");
  const [postStatus, setPostStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [feedCategoryFilter, setFeedCategoryFilter] = useState("all");
  const [feedLocationFilter, setFeedLocationFilter] = useState("");
  const [feedQuery, setFeedQuery] = useState("");

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();

    if (!authUser || !token) {
      router.replace("/");
      return;
    }

    setUser(authUser);
  }, [router]);

  const displayName = useMemo(() => {
    if (!user) return "User";
    return `${user.firstName} ${user.lastName}`;
  }, [user]);

  const filteredFeedPosts = useMemo(() => {
    const query = feedQuery.trim().toLowerCase();
    const locationFilter = feedLocationFilter.trim().toLowerCase();

    return feedPosts.filter((post) => {
      const categoryMatches = feedCategoryFilter === "all" || post.category === feedCategoryFilter;
      const locationMatches = !locationFilter || post.location.toLowerCase().includes(locationFilter);
      const queryMatches =
        !query ||
        `${post.title} ${post.description} ${post.category} ${post.location}`.toLowerCase().includes(query);

      return categoryMatches && locationMatches && queryMatches;
    });
  }, [feedPosts, feedCategoryFilter, feedLocationFilter, feedQuery]);

  const handleSignOut = () => {
    clearAuthSession();
    router.push("/");
  };

  const handleCreateFeedPost = () => {
    if (!user) {
      return;
    }

    const moderation = moderateProjectPost({
      title: postTitle,
      description: postDescription,
      category: postCategory,
      location: postLocation,
    });

    if (!moderation.allowed) {
      setPostStatus({
        type: "error",
        message: moderation.reasons.join(" "),
      });
      return;
    }

    const nextPost: FeedPost = {
      id: `post_${Date.now()}`,
      authorName: displayName,
      createdAt: new Date().toISOString(),
      title: postTitle.trim(),
      description: postDescription.trim(),
      category: postCategory,
      location: postLocation.trim(),
    };

    setFeedPosts((current) => [nextPost, ...current]);
    setPostTitle("");
    setPostDescription("");
    setPostStatus({
      type: "success",
      message: "Project post published successfully.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black/45 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/45 px-6 py-10 text-zinc-100">
      <main className="mx-auto w-full max-w-4xl flex-col gap-6">
        {/* Top Navigation */}
        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Dashboard
              </Link>
              <Link
                href="/categories"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Categories
              </Link>
              <Link
                href="/messages"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Messages
              </Link>
            </div>

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
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
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

        {/* Project Feed Section */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <h1 className="text-2xl font-bold text-zinc-900">Project Feed</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Post project opportunities for the community. Only project-related and professional posts are allowed.
          </p>

          {postStatus && (
            <div
              className={`mt-3 rounded-md border p-3 text-sm ${
                postStatus.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {postStatus.message}
            </div>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              placeholder="Post title"
              value={postTitle}
              onChange={(event) => setPostTitle(event.target.value)}
            />
            <select
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              value={postCategory}
              onChange={(event) => setPostCategory(event.target.value)}
            >
              {PROJECT_CATEGORIES.map((category) => (
                <option key={`post-category-${category.value}`} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              placeholder="Location (City, State)"
              value={postLocation}
              onChange={(event) => setPostLocation(event.target.value)}
            />
            <button
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
              type="button"
              onClick={handleCreateFeedPost}
            >
              Publish Post
            </button>
            <textarea
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 sm:col-span-2"
              placeholder="Describe the project scope, timeline, and contractor needs"
              value={postDescription}
              onChange={(event) => setPostDescription(event.target.value)}
              rows={4}
            />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <select
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              value={feedCategoryFilter}
              onChange={(event) => setFeedCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {PROJECT_CATEGORIES.map((category) => (
                <option key={`filter-category-${category.value}`} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              placeholder="Filter by location"
              value={feedLocationFilter}
              onChange={(event) => setFeedLocationFilter(event.target.value)}
            />
            <input
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              placeholder="Search feed"
              value={feedQuery}
              onChange={(event) => setFeedQuery(event.target.value)}
            />
          </div>

          {filteredFeedPosts.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">No posts match current filters.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {filteredFeedPosts.map((post) => {
                const categoryLabel =
                  PROJECT_CATEGORIES.find((category) => category.value === post.category)?.label || post.category;

                return (
                  <li key={post.id} className="rounded-md border border-zinc-200 p-3 text-zinc-900">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-zinc-500">{post.authorName}</div>
                        <div className="text-lg font-semibold">{post.title}</div>
                      </div>
                      <div className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm text-zinc-700">{post.description}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">{categoryLabel}</span>
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">{post.location}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
