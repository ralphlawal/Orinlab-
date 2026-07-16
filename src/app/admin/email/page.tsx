"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Clock, ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type SentEmail = {
  id: string;
  to_address: string;
  cc_address: string | null;
  subject: string;
  body: string;
  sent_by: string;
  sent_at: string;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function EmailComposer({
  initialTo = "",
  onSent,
  adminEmail,
}: {
  initialTo?: string;
  onSent: (email: SentEmail) => void;
  adminEmail: string;
}) {
  const [to, setTo]           = useState(initialTo);
  const [cc, setCc]           = useState("");
  const [showCc, setShowCc]   = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail,
        },
        body: JSON.stringify({ to, cc: cc || undefined, subject, body }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to send."); setSending(false); return; }
      setSent(true);
      onSent({
        id: crypto.randomUUID(),
        to_address: to,
        cc_address: cc || null,
        subject,
        body,
        sent_by: adminEmail,
        sent_at: new Date().toISOString(),
      });
      setTimeout(() => {
        setSent(false);
        setTo(""); setCc(""); setSubject(""); setBody("");
      }, 3000);
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="flex flex-col gap-0 bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* To */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <span className="text-white/30 text-xs w-14 flex-shrink-0">To</span>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="recipient@example.com, another@example.com"
          required
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20"
        />
        <button
          type="button"
          onClick={() => setShowCc(!showCc)}
          className="text-white/30 hover:text-white/60 text-xs transition-colors flex-shrink-0"
        >
          {showCc ? "−Cc" : "+Cc"}
        </button>
      </div>

      {/* CC */}
      {showCc && (
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
          <span className="text-white/30 text-xs w-14 flex-shrink-0">Cc</span>
          <input
            type="text"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="cc@example.com"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20"
          />
        </div>
      )}

      {/* Subject */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <span className="text-white/30 text-xs w-14 flex-shrink-0">Subject</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          required
          className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20"
        />
      </div>

      {/* Body */}
      <textarea
        ref={bodyRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={"Write your message here…\n\nUse blank lines to separate paragraphs."}
        required
        rows={12}
        className="w-full bg-transparent outline-none text-white text-sm placeholder-white/20 px-5 py-4 resize-none leading-relaxed"
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06]">
        <p className="text-white/25 text-xs">Sending from info@orinlabi.com</p>
        <div className="flex items-center gap-3">
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {sent && <p className="text-green-400 text-xs">Email sent!</p>}
          <button
            type="submit"
            disabled={sending || sent}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066d6] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            {sending ? (
              <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</span>
            ) : sent ? (
              "Sent!"
            ) : (
              <><Send size={14} /> Send</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function SentLog({ emails }: { emails: SentEmail[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (emails.length === 0) {
    return (
      <div className="text-center py-12 text-white/20 text-sm">
        No emails sent yet — they&apos;ll appear here after you send one.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((e) => (
        <div key={e.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white text-sm font-medium truncate">{e.subject}</span>
              </div>
              <p className="text-white/35 text-xs truncate">To: {e.to_address}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-white/25 text-xs">{fmtDate(e.sent_at)}</span>
              {expanded === e.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
            </div>
          </button>
          {expanded === e.id && (
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
              {e.cc_address && <p className="text-white/40 text-xs mb-2">Cc: {e.cc_address}</p>}
              <p className="text-white/40 text-xs mb-3">Sent by: {e.sent_by}</p>
              <div className="bg-black/30 rounded-xl px-4 py-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {e.body}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EmailPageInner() {
  const searchParams = useSearchParams();
  const initialTo = searchParams.get("to") ?? "";

  const [adminEmail, setAdminEmail] = useState("");
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [view, setView] = useState<"compose" | "sent">("compose");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAdminEmail(data.session?.user?.email ?? "");
    });

    supabase
      .from("sent_emails")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setSentEmails((data ?? []) as SentEmail[]);
        setLoadingHistory(false);
      });
  }, []);

  function handleSent(email: SentEmail) {
    setSentEmails((prev) => [email, ...prev]);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-xl">Email</h1>
          <p className="text-white/40 text-sm mt-0.5">Compose and send emails from info@orinlabi.com</p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          <button
            onClick={() => setView("compose")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === "compose" ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Plus size={14} /> Compose
          </button>
          <button
            onClick={() => setView("sent")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === "sent" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Clock size={14} /> Sent ({sentEmails.length})
          </button>
        </div>
      </div>

      {view === "compose" ? (
        <EmailComposer
          initialTo={initialTo}
          onSent={handleSent}
          adminEmail={adminEmail}
        />
      ) : (
        loadingHistory ? (
          <div className="text-center py-12 text-white/30 text-sm">Loading…</div>
        ) : (
          <SentLog emails={sentEmails} />
        )
      )}
    </div>
  );
}

export default function AdminEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-white/30 text-sm">Loading…</div>}>
      <EmailPageInner />
    </Suspense>
  );
}
