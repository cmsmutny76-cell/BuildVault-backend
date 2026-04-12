"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  webApi,
  type Project,
  type UserProfile,
  type CreateProjectInput,
  type AnalyzePhotoResponse,
  type ContractorMatch,
  type MessageRecord,
} from "../../lib/web/apiClient";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "../../lib/web/authStorage";
import { moderateProjectPost } from "../../lib/web/postModeration";
import WebBrandMark from "../../components/WebBrandMark";

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

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectType, setProjectType] = useState("residential");
  const [projectCity, setProjectCity] = useState("Austin");
  const [projectState, setProjectState] = useState("TX");
  const [projectZipCode, setProjectZipCode] = useState("78701");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [analysisPhotoUrl, setAnalysisPhotoUrl] = useState("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200");
  const [analysisProjectType, setAnalysisProjectType] = useState("residential");
  const [analysisResult, setAnalysisResult] = useState<AnalyzePhotoResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [matchBudget, setMatchBudget] = useState(85000);
  const [matchCity, setMatchCity] = useState("Austin");
  const [matchState, setMatchState] = useState("TX");
  const [matchZipCode, setMatchZipCode] = useState("78701");
  const [matchServices, setMatchServices] = useState("Remodeling, General Contractor");
  const [matches, setMatches] = useState<ContractorMatch[]>([]);
  const [matching, setMatching] = useState(false);

  const [conversations, setConversations] = useState<Array<{ id: string; participantInfo?: { name: string }; projectTitle?: string; unreadCount?: number; lastMessage?: { content: string } }>>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [estimates, setEstimates] = useState<Array<{ id: string; contractorId: string; totalAmount: number; status: string }>>([]);
  const [creatingEstimate, setCreatingEstimate] = useState(false);
  const [estimateContractorId, setEstimateContractorId] = useState("cont_1");
  const [estimateDescription, setEstimateDescription] = useState("Cabinet installation labor");
  const [estimateQuantity, setEstimateQuantity] = useState(1);
  const [estimateUnitPrice, setEstimateUnitPrice] = useState(12000);

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();

    if (!authUser || !token) {
      router.replace("/");
      return;
    }

    setUser(authUser);
  }, [router]);

  const loadDashboard = async (activeUser: AuthUser) => {
      setLoading(true);
      setError("");

      try {
        const [profileData, projectsData] = await Promise.all([
          webApi.getProfile(activeUser.id),
          webApi.getProjects(),
        ]);

        setProfile(profileData.profile || null);
        const userProjects = (projectsData.projects || []).filter((project) => project.ownerId === activeUser.id);
        setProjects(userProjects);
        if (userProjects.length > 0) {
          setSelectedProjectId((current) => current || userProjects[0].id);
        }

        const conversationData = await webApi.getConversations(activeUser.id);
        const nextConversations = conversationData.conversations || [];
        setConversations(nextConversations);
        if (nextConversations.length > 0) {
          setSelectedConversationId((current) => current || nextConversations[0].id);
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!user) {
      return;
    }

    loadDashboard(user);
  }, [user]);

  useEffect(() => {
    if (!selectedProjectId) {
      setEstimates([]);
      return;
    }

    const loadEstimates = async () => {
      try {
        const estimateData = await webApi.getEstimates(selectedProjectId);
        setEstimates(
          (estimateData.estimates || []).map((estimate) => ({
            id: estimate.id,
            contractorId: estimate.contractorId,
            totalAmount: estimate.total,
            status: estimate.status,
          }))
        );
      } catch {
        setEstimates([]);
      }
    };

    loadEstimates();
  }, [selectedProjectId]);

  useEffect(() => {
    if (!user || !selectedConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const messageData = await webApi.getMessages(user.id, selectedConversationId);
        setMessages(messageData.messages || []);
      } catch {
        setMessages([]);
      }
    };

    loadMessages();
  }, [user, selectedConversationId]);

  const displayName = useMemo(() => {
    if (!user) return "User";
    return `${user.firstName} ${user.lastName}`;
  }, [user]);

  const handleSignOut = () => {
    clearAuthSession();
    router.push("/");
  };

  const handleCreateProject = async () => {
    if (!user || !projectTitle.trim()) {
      return;
    }

    setCreatingProject(true);
    setError("");

    const payload: CreateProjectInput = {
      ownerId: user.id,
      title: projectTitle.trim(),
      projectType,
      location: {
        city: projectCity.trim(),
        state: projectState.trim(),
        zipCode: projectZipCode.trim(),
      },
    };

    try {
      await webApi.createProject(payload);
      setProjectTitle("");
      await loadDashboard(user);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Failed to create project";
      setError(message);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleAnalyzePhoto = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const result = await webApi.analyzePhoto(analysisPhotoUrl, analysisProjectType);
      setAnalysisResult(result);
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : "Failed to analyze photo";
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatchContractors = async () => {
    setMatching(true);
    setError("");
    try {
      const result = await webApi.matchContractors({
        projectType: analysisProjectType,
        budget: matchBudget,
        location: { city: matchCity, state: matchState, zipCode: matchZipCode },
        services: matchServices
          .split(",")
          .map((service) => service.trim())
          .filter(Boolean),
      });
      setMatches(result.matches || []);
    } catch (matchError) {
      const message = matchError instanceof Error ? matchError.message : "Failed to match contractors";
      setError(message);
    } finally {
      setMatching(false);
    }
  };

  const handleCreateEstimate = async () => {
    const selectedProject = projects.find((project) => project.id === selectedProjectId);

    if (!user || !selectedProject || !estimateDescription.trim()) {
      return;
    }

    setCreatingEstimate(true);
    setError("");

    try {
      await webApi.createEstimate({
        projectId: selectedProject.id,
        contractorId: estimateContractorId,
        projectTitle: selectedProject.title,
        lineItems: [
          {
            description: estimateDescription.trim(),
            quantity: estimateQuantity,
            unitPrice: estimateUnitPrice,
            category: "labor",
          },
        ],
      });

      const estimateData = await webApi.getEstimates(selectedProject.id);
      setEstimates(
        (estimateData.estimates || []).map((estimate) => ({
          id: estimate.id,
          contractorId: estimate.contractorId,
          totalAmount: estimate.total,
          status: estimate.status,
        }))
      );
    } catch (estimateError) {
      const message = estimateError instanceof Error ? estimateError.message : "Failed to create estimate";
      setError(message);
    } finally {
      setCreatingEstimate(false);
    }
  };

  const handleEstimateAction = async (estimateId: string, action: "accept" | "reject") => {
    if (!user || !selectedProjectId) {
      return;
    }

    setError("");
    try {
      if (action === "accept") {
        await webApi.acceptEstimate({ estimateId, userId: user.id, projectId: selectedProjectId });
      } else {
        await webApi.rejectEstimate({ estimateId, userId: user.id, projectId: selectedProjectId });
      }

      setEstimates((current) =>
        current.map((estimate) =>
          estimate.id === estimateId
            ? { ...estimate, status: action === "accept" ? "accepted" : "rejected" }
            : estimate
        )
      );
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : `Failed to ${action} estimate`;
      setError(message);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversationId || !messageDraft.trim()) {
      return;
    }

    const conversation = conversations.find((item) => item.id === selectedConversationId);
    const receiverId = conversation?.participantInfo && "id" in conversation.participantInfo
      ? (conversation.participantInfo as { id?: string }).id || "user_1"
      : "user_1";
    const safeReceiverId = receiverId === user.id ? "user_1" : receiverId;

    setSendingMessage(true);
    setError("");

    try {
      await webApi.sendMessage({
        conversationId: selectedConversationId,
        senderId: user.id,
        receiverId: safeReceiverId,
        content: messageDraft.trim(),
        projectId: selectedProjectId || undefined,
      });

      const messageData = await webApi.getMessages(user.id, selectedConversationId);
      setMessages(messageData.messages || []);
      setMessageDraft("");
    } catch (messageError) {
      const message = messageError instanceof Error ? messageError.message : "Failed to send message";
      setError(message);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/55 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-4xl rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/55 px-6 py-10 text-zinc-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {/* Top Navigation */}
        <section className="relative z-[1000] overflow-visible rounded-lg border border-amber-300/20 bg-slate-950/75 p-4 text-zinc-100 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <WebBrandMark href="/dashboard" textClassName="text-white" />
              <Link
                href="/categories"
                className="text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Categories
              </Link>
              <Link
                href="/feed"
                className="text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Feed
              </Link>
              <Link
                href="/messages"
                className="text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Messages
              </Link>
            </div>

            {/* User Dropdown Menu */}
            <div className="relative z-[1100]">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md border border-amber-300/25 bg-slate-900/80 px-3 py-2 text-sm text-zinc-100 hover:bg-slate-800"
              >
                ☰
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-[1200] mt-2 w-56 rounded-md border border-amber-300/20 bg-slate-950/95 text-zinc-100 shadow-lg backdrop-blur-sm">
                  <div>
                    <Link
                      href="/profile"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/photo-analysis"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      📸 Photo Analysis
                    </Link>
                    <Link
                      href="/blueprint-analysis"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      📐 Blueprint Analysis
                    </Link>
                    <Link
                      href="/building-codes"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      🏛️ Building Codes
                    </Link>
                    <Link
                      href="/price-comparison"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      💰 Price Comparison
                    </Link>
                    <Link
                      href="/find-contractors"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      👷 Find Contractors
                    </Link>
                    <Link
                      href="/find-suppliers"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      🧱 Find Suppliers
                    </Link>
                    <Link
                      href="/permit-assistance"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      📋 Permit Assistance
                    </Link>
                      <Link
                        href="/project-scheduling"
                        className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                        onClick={() => setMenuOpen(false)}
                      >
                        Project Scheduling
                      </Link>
                    <Link
                      href="/settings"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      ⚙️ Settings
                    </Link>
                    <div className="border-t border-white/10"></div>
                    <Link
                      href="/help"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-slate-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      ℹ️ Help & Support
                    </Link>
                    <div className="border-t border-white/10"></div>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-slate-800"
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

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">BuildVault Dashboard</h1>
              <p className="mt-1 text-sm text-slate-300">Connected web platform using shared backend APIs.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="text-slate-400">Signed in as</div>
              <div className="font-semibold">{displayName}</div>
              <div>{user?.email}</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="text-slate-400">Account type</div>
              <div className="font-semibold capitalize">{user?.userType}</div>
              <div>ID: {user?.id}</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Project Context</h2>
          <p className="mt-1 text-sm text-slate-300">Select a project to scope estimates and messaging, same pattern as app project selector.</p>
          <select
            className="mt-3 w-full rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
          >
            <option value="">No project selected</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title} ({project.projectType})
              </option>
            ))}
          </select>
        </section>

        {error && (
          <section className="rounded-lg border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">{error}</section>
        )}

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Profile (API: /api/users/profile)</h2>
          {profile ? (
            <div className="mt-3 text-sm text-slate-200">
              <div>
                {profile.firstName} {profile.lastName}
              </div>
              <div>{profile.email}</div>
              <div>
                {profile.city || "-"}, {profile.state || "-"}
              </div>
              <div className="capitalize">{profile.userType || "-"}</div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-300">No profile data available.</p>
          )}
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Create Project (Same flow as mobile API)</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
              placeholder="Project title"
              value={projectTitle}
              onChange={(event) => setProjectTitle(event.target.value)}
            />
            <input
              className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
              placeholder="Project type"
              value={projectType}
              onChange={(event) => setProjectType(event.target.value)}
            />
            <input
              className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
              placeholder="City"
              value={projectCity}
              onChange={(event) => setProjectCity(event.target.value)}
            />
            <input
              className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
              placeholder="State"
              value={projectState}
              onChange={(event) => setProjectState(event.target.value)}
            />
            <input
              className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
              placeholder="ZIP"
              value={projectZipCode}
              onChange={(event) => setProjectZipCode(event.target.value)}
            />
            <button
              className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              type="button"
              onClick={handleCreateProject}
              disabled={creatingProject || !projectTitle.trim()}
            >
              {creatingProject ? "Creating..." : "Create Project"}
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">My Projects (API: /api/projects)</h2>
          {projects.length === 0 ? (
            <p className="mt-3 text-sm text-slate-300">No projects found for this user yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {projects.map((project) => (
                <li key={project.id} className="rounded-md border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="font-semibold">{project.title}</div>
                  <div className="text-slate-300 capitalize">{project.projectType} • {project.status}</div>
                  <div className="text-slate-400">
                    {project.location?.city || "-"}, {project.location?.state || "-"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">AI Photo Analysis (API: /api/ai/analyze-photo)</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100 sm:col-span-2"
              placeholder="Photo URL"
              value={analysisPhotoUrl}
              onChange={(event) => setAnalysisPhotoUrl(event.target.value)}
            />
            <input
              className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
              placeholder="Project type"
              value={analysisProjectType}
              onChange={(event) => setAnalysisProjectType(event.target.value)}
            />
            <button
              className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              type="button"
              onClick={handleAnalyzePhoto}
              disabled={analyzing || !analysisPhotoUrl.trim()}
            >
              {analyzing ? "Analyzing..." : "Analyze Photo"}
            </button>
          </div>
          {analysisResult?.analysis && (
            <div className="mt-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <div className="font-semibold">Condition: {analysisResult.analysis.condition || "N/A"}</div>
              <div className="mt-1">Materials: {(analysisResult.analysis.materials || []).map((material) => `${material.name} (${material.quantity} ${material.unit})`).join(', ') || 'N/A'}</div>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Contractor Matching (API: /api/ai/match-contractors)</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" value={String(matchBudget)} onChange={(event) => setMatchBudget(Number(event.target.value || 0))} placeholder="Budget" />
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" value={matchCity} onChange={(event) => setMatchCity(event.target.value)} placeholder="City" />
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" value={matchState} onChange={(event) => setMatchState(event.target.value)} placeholder="State" />
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" value={matchZipCode} onChange={(event) => setMatchZipCode(event.target.value)} placeholder="ZIP" />
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100 sm:col-span-2" value={matchServices} onChange={(event) => setMatchServices(event.target.value)} placeholder="Services (comma separated)" />
            <button className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60" type="button" onClick={handleMatchContractors} disabled={matching}>
              {matching ? "Matching..." : "Find Matches"}
            </button>
          </div>
          {matches.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {matches.slice(0, 5).map((match) => (
                <li key={match.contractor.id} className="rounded-md border border-white/10 bg-white/5 p-2">
                  <div className="font-semibold">{match.contractor.name} • Score {match.matchScore}</div>
                  <div className="text-slate-300">{match.matchReasons.join(' • ')}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Estimates (API: /api/estimates)</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" value={estimateContractorId} onChange={(event) => setEstimateContractorId(event.target.value)} placeholder="Contractor ID" />
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" value={estimateDescription} onChange={(event) => setEstimateDescription(event.target.value)} placeholder="Line item" />
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" type="number" value={estimateQuantity} onChange={(event) => setEstimateQuantity(Number(event.target.value || 1))} placeholder="Qty" />
            <input className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" type="number" value={estimateUnitPrice} onChange={(event) => setEstimateUnitPrice(Number(event.target.value || 0))} placeholder="Unit price" />
          </div>
          <button className="mt-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60" type="button" onClick={handleCreateEstimate} disabled={creatingEstimate || !selectedProjectId}>
            {creatingEstimate ? "Creating estimate..." : "Create Estimate"}
          </button>
          {!selectedProjectId ? (
            <p className="mt-2 text-sm text-slate-300">Select a project to load estimates.</p>
          ) : estimates.length === 0 ? (
            <p className="mt-2 text-sm text-slate-300">No estimates yet for this project.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {estimates.map((estimate) => (
                <li key={estimate.id} className="rounded-md border border-white/10 bg-white/5 p-2">
                  <div className="font-semibold">{estimate.id}</div>
                  <div className="text-slate-300">Contractor: {estimate.contractorId} • ${estimate.totalAmount} • {estimate.status}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-md border border-green-300 px-2 py-1 text-xs text-green-700" type="button" onClick={() => handleEstimateAction(estimate.id, "accept")}>Accept</button>
                    <button className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700" type="button" onClick={() => handleEstimateAction(estimate.id, "reject")}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Messaging (API: /api/messages)</h2>
          <select
            className="mt-2 w-full rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
            value={selectedConversationId}
            onChange={(event) => setSelectedConversationId(event.target.value)}
          >
            <option value="">Select conversation</option>
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>
                {conversation.participantInfo?.name || conversation.id}
              </option>
            ))}
          </select>
          {conversations.length === 0 ? (
            <p className="mt-2 text-sm text-slate-300">No conversations found.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="rounded-md border border-white/10 bg-white/5 p-2">
                  <div className="font-semibold">{conversation.participantInfo?.name || 'Conversation'}</div>
                  <div className="text-slate-300">{conversation.projectTitle || 'No project'} • Unread: {conversation.unreadCount || 0}</div>
                  <div className="text-slate-400">{conversation.lastMessage?.content || 'No messages yet'}</div>
                </li>
              ))}
            </ul>
          )}
          {selectedConversationId && (
            <div className="mt-4 rounded-md border border-white/10 bg-slate-900/55 p-3">
              <h3 className="font-semibold">Conversation Thread</h3>
              <div className="mt-2 max-h-56 space-y-2 overflow-auto text-sm">
                {messages.length === 0 ? (
                  <p className="text-slate-300">No messages loaded.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="rounded-md border border-white/10 bg-white/5 p-2">
                      <div className="text-xs text-slate-400">{message.senderId} • {new Date(message.timestamp).toLocaleString()}</div>
                      <div>{message.content}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Type a message"
                />
                <button className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60" type="button" onClick={handleSendMessage} disabled={sendingMessage || !messageDraft.trim()}>
                  {sendingMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}