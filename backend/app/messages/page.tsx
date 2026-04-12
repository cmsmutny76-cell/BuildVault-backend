"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { webApi, type MessageRecord } from "../../lib/web/apiClient";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "../../lib/web/authStorage";
import WebBrandMark from "../../components/WebBrandMark";

export default function MessagesPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [conversations, setConversations] = useState<Array<{ id: string; participantInfo?: { name: string }; projectTitle?: string; unreadCount?: number; lastMessage?: { content: string } }>>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();

    if (!authUser || !token) {
      router.replace("/");
      return;
    }

    setUser(authUser);
    loadConversations(authUser.id);
  }, [router]);

  const loadConversations = async (userId: string) => {
    setLoading(true);
    setError("");

    try {
      const conversationData = await webApi.getConversations(userId);
      const nextConversations = conversationData.conversations || [];
      setConversations(nextConversations);
      if (nextConversations.length > 0) {
        setSelectedConversationId((current) => current || nextConversations[0].id);
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load conversations";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSignOut = () => {
    clearAuthSession();
    router.push("/");
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
        projectId: undefined,
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
          Loading messages...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black/55 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-4xl rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          Loading...
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
                href="/feed"
                className="text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Feed
              </Link>
              <Link
                href="/categories"
                className="text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Categories
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Dashboard
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
                      href="/permit-assistance"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      📋 Permit Assistance
                    </Link>
                      <Link
                        href="/project-scheduling"
                        className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Project Scheduling
                      </Link>
                    <Link
                      href="/settings"
                      className="block w-full px-4 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
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

        {/* Error Message */}
        {error && (
          <section className="rounded-lg border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">{error}</section>
        )}

        {/* Messaging Section */}
        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="mt-1 text-sm text-slate-300">Connect with other users on your projects.</p>

          <select
            className="mt-4 w-full rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
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
            <p className="mt-4 text-sm text-slate-300">No conversations found.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-zinc-100">
                  <div className="font-semibold">{conversation.participantInfo?.name || "Conversation"}</div>
                  <div className="text-slate-300">{conversation.projectTitle || "No project"} • Unread: {conversation.unreadCount || 0}</div>
                  <div className="text-slate-400">{conversation.lastMessage?.content || "No messages yet"}</div>
                </li>
              ))}
            </ul>
          )}

          {selectedConversationId && (
            <div className="mt-6 rounded-md border border-white/10 bg-slate-900/55 p-4">
              <h3 className="font-semibold text-white">Conversation Thread</h3>
              <div className="mt-4 max-h-96 space-y-3 overflow-auto rounded-md bg-slate-950/70 p-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-300">No messages yet.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="rounded-md border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-slate-400">{message.senderId} • {new Date(message.timestamp).toLocaleString()}</div>
                      <div className="mt-1 text-sm text-zinc-100">{message.content}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  className="flex-1 rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100"
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Type a message..."
                />
                <button
                  className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageDraft.trim()}
                >
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