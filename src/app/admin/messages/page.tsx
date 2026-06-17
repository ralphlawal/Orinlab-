"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Send, MessageSquare, Mail, CheckCheck, ArrowLeft,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ChatMsg = {
  id: string;
  artist_email: string;
  artist_name: string;
  sender: "admin" | "artist";
  content: string;
  created_at: string;
  read_at: string | null;
};

type ArtistThread = {
  email: string;
  name: string;
  unread: number;
  lastContent: string;
  lastAt: string;
};

type ContactMsg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiry_type: string;
  created_at: string;
};

const READ_KEY = "orinlabi_read_contacts";

// ── Admin Messages Page ────────────────────────────────────────────────────────

export default function AdminMessagesPage() {
  const [tab, setTab] = useState<"chats" | "contact">("chats");

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 flex-shrink-0 border-b border-white/[0.06] pb-4">
        {(["chats", "contact"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[#007bff]/15 text-[#007bff]"
                : "text-white/40 hover:text-white"
            }`}
          >
            {t === "chats" ? "Artist Chats" : "Contact Forms"}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "chats" ? <ArtistChats /> : <ContactForms />}
      </div>
    </div>
  );
}

// ── Artist Chats ──────────────────────────────────────────────────────────────

function ArtistChats() {
  const [threads, setThreads] = useState<ArtistThread[]>([]);
  const [selected, setSelected] = useState<ArtistThread | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  useEffect(() => {
    loadThreads();
  }, []);

  async function loadThreads() {
    const [{ data: releases }, { data: allMsgs }] = await Promise.all([
      supabase.from("releases").select("email, artist_name").order("submitted_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: true }),
    ]);

    const chatMsgs = (allMsgs ?? []) as ChatMsg[];

    // Build map from releases
    const seen = new Map<string, string>();
    for (const r of releases ?? []) {
      if (!seen.has(r.email)) seen.set(r.email, r.artist_name ?? r.email);
    }

    // Also add any emails from messages not already in releases
    for (const m of chatMsgs) {
      if (!seen.has(m.artist_email)) {
        seen.set(m.artist_email, m.artist_name || m.artist_email);
      }
    }

    const artistList: ArtistThread[] = Array.from(seen.entries()).map(([email, name]) => {
      const mine = chatMsgs.filter(m => m.artist_email === email);
      const unread = mine.filter(m => m.sender === "artist" && !m.read_at).length;
      const last = mine[mine.length - 1];
      return { email, name, unread, lastContent: last?.content ?? "", lastAt: last?.created_at ?? "" };
    });

    artistList.sort((a, b) => {
      if (!a.lastAt && !b.lastAt) return a.name.localeCompare(b.name);
      if (!a.lastAt) return 1;
      if (!b.lastAt) return -1;
      return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
    });

    setThreads(artistList);
    setLoadingThreads(false);
  }

  // Poll every 3 s — full refresh of threads + open thread
  useEffect(() => {
    const poll = async () => {
      // Reload thread list
      loadThreads();

      // Reload open thread messages (full replace)
      setSelected(sel => {
        if (!sel) return sel;
        supabase.from("messages").select("*")
          .eq("artist_email", sel.email)
          .order("created_at", { ascending: true })
          .then(({ data }) => {
            if (!data) return;
            const dbMsgs = data as ChatMsg[];
            setMsgs(prev => {
              const dbIds = new Set(dbMsgs.map(m => m.id));
              const pending = prev.filter(m => m.id.startsWith("temp-") && !dbIds.has(m.id));
              // Mark new artist messages as read
              const prevIds = new Set(prev.map(m => m.id));
              dbMsgs.filter(m => m.sender === "artist" && !m.read_at && !prevIds.has(m.id)).forEach(m => {
                supabase.from("messages").update({ read_at: new Date().toISOString() })
                  .eq("id", m.id).then(() => {});
              });
              return [...dbMsgs, ...pending];
            });
          });
        return sel;
      });
    };

    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function openThread(thread: ArtistThread) {
    setSelected(thread);
    setMobileView("chat");
    setLoadingMsgs(true);
    setText("");

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("artist_email", thread.email)
      .order("created_at", { ascending: true });

    setMsgs((data ?? []) as ChatMsg[]);
    setLoadingMsgs(false);

    // Mark all unread as read
    await supabase.from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("artist_email", thread.email).eq("sender", "artist").is("read_at", null);

    setThreads(prev => prev.map(t =>
      t.email === thread.email ? { ...t, unread: 0 } : t
    ));
  }

  async function sendMsg() {
    const content = text.trim();
    if (!content || !selected || sending) return;
    setSending(true);
    setSendError("");
    setText("");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMsg = {
      id: tempId,
      artist_email: selected.email,
      artist_name: selected.name,
      sender: "admin",
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMsgs((prev) => [...prev, tempMsg]);

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({ artist_email: selected.email, artist_name: selected.name, sender: "admin", content })
      .select()
      .single();

    if (error) {
      setMsgs((prev) => prev.filter((m) => m.id !== tempId));
      setSendError(error.message || "Failed to send. Please try again.");
      setText(content);
    } else if (inserted) {
      setMsgs((prev) => prev.map((m) => m.id === tempId ? (inserted as ChatMsg) : m));
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin-message",
          data: { artist_name: selected.name, email: selected.email, content },
        }),
      }).catch(() => {});
    }
    setSending(false);
  }

  if (loadingThreads) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-0 border border-white/[0.06] rounded-2xl overflow-hidden">

      {/* Artist list — hidden on mobile when chat is open */}
      <div className={`flex-shrink-0 w-72 border-r border-white/[0.06] flex flex-col bg-black/30
        ${mobileView === "chat" ? "hidden lg:flex" : "flex"}
      `}>
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Artists</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm px-4">
              No artists yet.
            </div>
          )}
          {threads.map((t) => (
            <button
              key={t.email}
              onClick={() => openThread(t)}
              className={`w-full text-left px-4 py-4 border-b border-white/[0.04] transition-colors hover:bg-white/[0.04] ${
                selected?.email === t.email ? "bg-[#007bff]/10 border-l-2 border-l-[#007bff]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-white text-sm font-semibold truncate">{t.name}</p>
                {t.unread > 0 && (
                  <span className="flex-shrink-0 bg-[#007bff] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {t.unread}
                  </span>
                )}
              </div>
              <p className="text-white/30 text-xs mt-0.5 truncate">{t.email}</p>
              {t.lastContent && (
                <p className="text-white/40 text-xs mt-1.5 truncate">{t.lastContent}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <MessageSquare size={32} className="text-white/10 mb-3" />
            <p className="text-white/30 text-sm">Select an artist to open their chat</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0">
              <button
                className="lg:hidden text-white/40 hover:text-white mr-1"
                onClick={() => { setMobileView("list"); setSelected(null); }}
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#007bff]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-[#007bff] text-xs font-bold">
                  {selected.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{selected.name}</p>
                <p className="text-white/30 text-xs">{selected.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="text-[#007bff] animate-spin" />
                </div>
              ) : msgs.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm">
                  No messages yet. Start the conversation.
                </div>
              ) : (
                msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.sender === "admin"
                        ? "bg-[#007bff] text-white rounded-br-sm"
                        : "bg-white/[0.07] text-white/85 rounded-bl-sm"
                    }`}>
                      {m.sender === "artist" && (
                        <p className="text-[#007bff] text-[10px] font-bold uppercase tracking-widest mb-1">
                          {m.artist_name || selected.name}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <p className={`text-[10px] mt-1.5 ${m.sender === "admin" ? "text-white/50" : "text-white/30"}`}>
                        {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        {" · "}
                        {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex-shrink-0">
              {sendError && (
                <p className="text-red-400 text-xs mb-2">{sendError}</p>
              )}
              <div className="flex gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                  placeholder={`Message ${selected.name}…`}
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors"
                />
                <button
                  onClick={sendMsg}
                  disabled={!text.trim() || sending}
                  className="bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white p-3 rounded-xl transition-colors flex-shrink-0"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Contact Forms ─────────────────────────────────────────────────────────────

function ContactForms() {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMsg | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[];
      setReadIds(new Set(stored));
    } catch { /* ignore */ }
  }, []);

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(READ_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  useEffect(() => {
    supabase.from("contact_messages").select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto h-full">
      {messages.length === 0 && (
        <div className="text-center py-20 text-white/30">No contact messages yet.</div>
      )}
      {messages.map((m) => {
        const isRead = readIds.has(m.id);
        return (
          <button
            key={m.id}
            onClick={() => { setSelected(m); markRead(m.id); }}
            className={`w-full text-left hover:bg-white/[0.06] border rounded-2xl p-5 transition-all ${
              isRead
                ? "bg-white/[0.02] border-white/[0.04]"
                : "bg-white/[0.05] border-white/[0.1]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 relative">
                  <Mail size={16} className="text-[#007bff]" />
                  {!isRead && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#007bff] rounded-full" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white font-semibold text-sm">{m.name}</p>
                    {m.inquiry_type && (
                      <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-2 py-0.5 rounded-full">
                        {m.inquiry_type}
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{m.email}</p>
                  {m.subject && <p className="text-white/60 text-sm mt-2 font-medium">{m.subject}</p>}
                  <p className="text-white/40 text-sm mt-1 truncate">{m.message}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-white/30 text-xs mt-1">
                  {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {isRead && <CheckCheck size={13} className="text-white/20" />}
              </div>
            </div>
          </button>
        );
      })}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} className="text-[#007bff] text-sm hover:underline mt-0.5 block">
                    {selected.email}
                  </a>
                </div>
                {selected.inquiry_type && (
                  <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-3 py-1 rounded-full">
                    {selected.inquiry_type}
                  </span>
                )}
              </div>
              {selected.subject && <p className="text-white/70 font-medium mt-4">{selected.subject}</p>}
              <p className="text-white/30 text-xs mt-1">{new Date(selected.created_at).toLocaleString()}</p>
            </div>
            <div className="p-6">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="p-6 border-t border-white/[0.06] flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 py-3 rounded-xl transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Your message to Orinlabí"}`}
                className="flex-1 text-sm font-semibold bg-[#007bff] hover:bg-[#0069d9] text-white py-3 rounded-xl transition-colors text-center flex items-center justify-center gap-2"
              >
                <Mail size={15} /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
