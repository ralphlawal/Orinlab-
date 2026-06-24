"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Send, MessagesSquare } from "lucide-react";

type Message = {
  id: string;
  sender_email: string;
  sender_name: string;
  message: string;
  created_at: string;
};

function senderInitials(name: string) {
  return name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function senderColor(email: string) {
  const colors = [
    "bg-[#007bff]", "bg-violet-500", "bg-emerald-500",
    "bg-amber-500", "bg-rose-500", "bg-sky-500", "bg-pink-500",
  ];
  let hash = 0;
  for (const c of email) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${time}`;
}

export default function AdminChatPage() {
  const [myEmail, setMyEmail]     = useState<string | null>(null);
  const [myName, setMyName]       = useState("");
  const [messages, setMessages]   = useState<Message[]>([]);
  const [draft, setDraft]         = useState("");
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  // Derive display name from email local-part
  function nameFromEmail(email: string) {
    return email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email ?? null;
      setMyEmail(email);
      if (email) setMyName(nameFromEmail(email));
    });
  }, []);

  // Load history
  useEffect(() => {
    if (!myEmail) return;
    supabase
      .from("admin_chat_messages")
      .select("id, sender_email, sender_name, message, created_at")
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data, error: err }) => {
        if (err) {
          setError("Could not load messages. Make sure the admin_chat_messages table exists.");
        } else {
          setMessages((data ?? []) as Message[]);
        }
        setLoading(false);
      });
  }, [myEmail]);

  // Real-time subscription
  useEffect(() => {
    if (!myEmail) return;
    const channel = supabase
      .channel("admin_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_chat_messages" },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates (optimistic insert already added it)
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myEmail]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = draft.trim();
    if (!text || !myEmail || sending) return;
    setSending(true);
    setDraft("");

    // Optimistic insert
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      sender_email: myEmail,
      sender_name: myName,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error: err } = await supabase
      .from("admin_chat_messages")
      .insert({ sender_email: myEmail, sender_name: myName, message: text })
      .select("id, sender_email, sender_name, message, created_at")
      .single();

    if (err) {
      // Roll back optimistic message and show error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setDraft(text);
      setError("Send failed. Check that the table exists and RLS allows inserts.");
    } else {
      // Replace optimistic with real row
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? (data as Message) : m)));
      // Notify other admins by email
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "team-chat", data: { sender_email: myEmail, sender_name: myName, message: text } }),
      }).catch(() => {});
    }

    setSending(false);
    inputRef.current?.focus();
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Group consecutive messages from the same sender
  type Group = { sender_email: string; sender_name: string; messages: Message[] };
  const groups: Group[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    if (last && last.sender_email === m.sender_email) {
      last.messages.push(m);
    } else {
      groups.push({ sender_email: m.sender_email, sender_name: m.sender_name, messages: [m] });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-[900px] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-9 h-9 bg-[#007bff]/15 rounded-xl flex items-center justify-center">
          <MessagesSquare size={18} className="text-[#007bff]" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Team Chat</p>
          <p className="text-white/35 text-xs">Internal — visible to all admins</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 flex-shrink-0 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 leading-relaxed">
          {error}
          <p className="mt-2 text-red-400/60">
            Run this SQL in Supabase → SQL Editor:
            <br />
            <code className="font-mono">
              CREATE TABLE admin_chat_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_email text NOT NULL, sender_name text NOT NULL DEFAULT &apos;&apos;, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()); ALTER TABLE admin_chat_messages ENABLE ROW LEVEL SECURITY; CREATE POLICY &quot;anon read&quot; ON admin_chat_messages FOR SELECT USING (true); CREATE POLICY &quot;anon insert&quot; ON admin_chat_messages FOR INSERT WITH CHECK (true);
            </code>
          </p>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 bg-[#007bff]/10 rounded-2xl flex items-center justify-center">
              <MessagesSquare size={26} className="text-[#007bff]/50" />
            </div>
            <p className="text-white/30 text-sm">No messages yet. Say hello!</p>
          </div>
        )}

        {groups.map((group, gi) => {
          const isMe = group.sender_email === myEmail;
          const initials = senderInitials(group.sender_name || group.sender_email);
          const color = senderColor(group.sender_email);
          return (
            <div key={gi} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${color}`}>
                {initials}
              </div>

              {/* Bubble column */}
              <div className={`flex flex-col gap-1 max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Sender name + timestamp of first message */}
                <div className={`flex items-baseline gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <p className="text-white/50 text-[11px] font-semibold">{isMe ? "You" : group.sender_name || group.sender_email.split("@")[0]}</p>
                  <p className="text-white/20 text-[10px]">{formatTime(group.messages[0].created_at)}</p>
                </div>
                {group.messages.map((m, mi) => (
                  <div
                    key={m.id}
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isMe
                        ? "bg-[#007bff] text-white rounded-tr-sm"
                        : "bg-white/[0.07] text-white/90 rounded-tl-sm"
                    } ${mi > 0 ? (isMe ? "rounded-tr-2xl" : "rounded-tl-2xl") : ""}`}
                  >
                    {m.message}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.06]">
        <div className="flex items-end gap-3 bg-white/[0.04] border border-white/[0.08] focus-within:border-[#007bff]/50 rounded-2xl px-4 py-3 transition-colors">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder="Message the team…"
            rows={1}
            style={{ resize: "none", maxHeight: "120px" }}
            className="flex-1 bg-transparent outline-none text-white placeholder-white/25 text-sm leading-relaxed overflow-y-auto"
          />
          <button
            onClick={send}
            disabled={!draft.trim() || sending}
            className="w-8 h-8 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-30 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          >
            {sending ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
        <p className="text-white/15 text-[10px] mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
