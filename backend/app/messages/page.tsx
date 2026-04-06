"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { webApi, type MessageRecord } from "../../lib/web/apiClient";
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from "../../lib/web/authStorage";

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
      <div className="min-h-screen bg-black/45 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          Loading messages...
        </div>
      </div>
    );
  }

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
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {/* Top Navigation */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/feed"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Feed
              </Link>
              <Link
                href="/categories"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Categories
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Dashboard
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

        {/* Error Message */}
        {error && (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section>
        )}

        {/* Messaging Section */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-900">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="mt-1 text-sm text-zinc-600">Connect with other users on your projects.</p>

          <select
            className="mt-4 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
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
            <p className="mt-4 text-sm text-zinc-600">No conversations found.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-900">
                  <div className="font-semibold">{conversation.participantInfo?.name || "Conversation"}</div>
                  <div className="text-zinc-600">{conversation.projectTitle || "No project"} • Unread: {conversation.unreadCount || 0}</div>
                  <div className="text-zinc-500">{conversation.lastMessage?.content || "No messages yet"}</div>
                </li>
              ))}
            </ul>
          )}

          {selectedConversationId && (
            <div className="mt-6 rounded-md border border-zinc-200 p-4">
              <h3 className="font-semibold text-zinc-900">Conversation Thread</h3>
              <div className="mt-4 max-h-96 space-y-3 overflow-auto rounded-md bg-zinc-50 p-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-zinc-600">No messages yet.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="rounded-md bg-white p-3">
                      <div className="text-xs text-zinc-500">{message.senderId} • {new Date(message.timestamp).toLocaleString()}</div>
                      <div className="mt-1 text-sm text-zinc-900">{message.content}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Type a message..."
                />
                <button
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
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
