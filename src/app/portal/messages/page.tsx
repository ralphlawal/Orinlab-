"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Send } from "lucide-react";

type Msg = {
  id: string;
  sender: "admin" | "artist";
  content: string;
  created_at: string;
};

export default function PortalMessagesPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [artistName, setArtistName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const e = session.user.email!;
      setEmail(e);

      const [{ data: rel }, { data: thread }] = await Promise.all([
        supabase.from("releases").select("artist_name").eq("email", e)
          .order("submitted_at", { ascending: false }).limit(1).single(),
        supabase.from("messages").select("*").eq("artist_email", e)
          .order("created_at", { ascending: true }),
      ]);

      setArtistName(rel?.artist_name ?? "");
      setMsgs((thread ?? []) as Msg[]);
      setLoading(false);

      // Mark all unread admin messages as read
      supabase.from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("artist_email", e).eq("sender", "admin").is("read_at", null)
        .then(() => {});
    }
    load();
  }, []);

  // Poll every 4 s for new messages (reliable fallback for realtime)
  useEffect(() => {
    if (!email) return;
    const poll = async () => {
      const { data } = await supabase
        .from("messages").select("*")
        .eq("artist_email", email)
        .order("created_at", { ascending: true });
      if (!data) return;
      setMsgs((prev) => {
        const ids = new Set(prev.map(m => m.id));
        const fresh = (data as Msg[]).filter(m => !ids.has(m.id));
        if (fresh.length === 0) return prev;
        // Mark newly arrived admin messages as read
        fresh.filter(m => m.sender === "admin").forEach(m => {
          supabase.from("messages").update({ read_at: new Date().toISOString() })
            .eq("id", m.id).then(() => {});
        });
        return [...prev, ...fresh];
      });
    };
    const id = setInterval(poll, 4000);
    return () => clearInterval(id);
  }, [email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const content = text.trim();
    if (!content || !email || sending) return;
    setSending(true);
    setSendError("");
    setText("");

    // Optimistic update — show message immediately
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Msg = {
      id: tempId,
      sender: "artist",
      content,
      created_at: new Date().toISOString(),
    };
    setMsgs((prev) => [...prev, tempMsg]);

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({ artist_email: email, sender: "artist", content, artist_name: artistName })
      .select()
      .single();

    if (error) {
      // Remove the optimistic message and show the error
      setMsgs((prev) => prev.filter((m) => m.id !== tempId));
      setSendError(error.message || "Failed to send. Please try again.");
      setText(content);
    } else if (inserted) {
      // Replace temp with the real persisted message
      setMsgs((prev) => prev.map((m) => m.id === tempId ? (inserted as Msg) : m));
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "artist-message",
          data: { artist_name: artistName, email, content },
        }),
      }).catch(() => {});
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: "calc(100svh - 7rem)" }}>
      <div className="mb-5 flex-shrink-0">
        <h1 className="text-white font-bold text-2xl">Messages</h1>
        <p className="text-white/40 text-sm mt-1">Chat directly with the Orinlabí team.</p>
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2 min-h-0">
        {msgs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">No messages yet.</p>
            <p className="text-white/20 text-xs mt-1">Send us a message — we reply within a few hours.</p>
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "artist" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.sender === "artist"
                ? "bg-[#007bff] text-white rounded-br-sm"
                : "bg-white/[0.07] text-white/85 rounded-bl-sm"
            }`}>
              {m.sender === "admin" && (
                <p className="text-[#007bff] text-[10px] font-bold uppercase tracking-widest mb-1">Orinlabí</p>
              )}
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
              <p className={`text-[10px] mt-1.5 ${m.sender === "artist" ? "text-white/50" : "text-white/30"}`}>
                {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 pt-4 border-t border-white/[0.06]">
      {sendError && (
        <p className="text-red-400 text-xs mb-2 px-1">{sendError}</p>
      )}
      <div className="flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message… (Enter to send)"
          className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white p-3 rounded-xl transition-colors flex-shrink-0"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      </div>
    </section>
  );
}
