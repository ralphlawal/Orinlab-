"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Clock, Plus, Inbox, ChevronDown, ChevronUp, Reply, Trash2, RefreshCw } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReceivedEmail = {
  id: string;
  message_id: string;
  from_address: string;
  to_address: string;
  subject: string;
  html_body: string | null;
  text_body: string | null;
  read_at: string | null;
  received_at: string;
};

type SentEmail = {
  id: string;
  to_address: string;
  cc_address: string | null;
  subject: string;
  body: string;
  sent_by: string;
  sent_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 24 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: diffH > 8760 ? "numeric" : undefined });
}

function senderName(from: string) {
  const m = from.match(/^"?([^"<]+)"?\s*</);
  return m ? m[1].trim() : from.split("@")[0];
}

function senderEmail(from: string) {
  const m = from.match(/<([^>]+)>/);
  return m ? m[1] : from;
}

// ── Composer ──────────────────────────────────────────────────────────────────

function EmailComposer({
  initialTo = "",
  initialSubject = "",
  adminEmail,
  onSent,
  onCancel,
}: {
  initialTo?: string;
  initialSubject?: string;
  adminEmail: string;
  onSent: (email: SentEmail) => void;
  onCancel?: () => void;
}) {
  const [to, setTo]           = useState(initialTo);
  const [cc, setCc]           = useState("");
  const [showCc, setShowCc]   = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
        body: JSON.stringify({ to, cc: cc || undefined, subject, body }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to send."); setSending(false); return; }
      setSent(true);
      onSent({ id: crypto.randomUUID(), to_address: to, cc_address: cc || null, subject, body, sent_by: adminEmail, sent_at: new Date().toISOString() });
      setTimeout(() => { setSent(false); setTo(""); setCc(""); setSubject(""); setBody(""); if (onCancel) onCancel(); }, 2000);
    } catch {
      setError("Network error.");
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <span className="text-white/30 text-xs w-14 shrink-0">To</span>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" required className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
        <button type="button" onClick={() => setShowCc(!showCc)} className="text-white/30 hover:text-white/60 text-xs transition-colors shrink-0">{showCc ? "−Cc" : "+Cc"}</button>
      </div>
      {showCc && (
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
          <span className="text-white/30 text-xs w-14 shrink-0">Cc</span>
          <input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com" className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
        </div>
      )}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <span className="text-white/30 text-xs w-14 shrink-0">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" required className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
      </div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={"Write your message…\n\nBlank lines become paragraphs."} required rows={10} className="w-full bg-transparent outline-none text-white text-sm placeholder-white/20 px-5 py-4 resize-none leading-relaxed" />
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06]">
        <p className="text-white/25 text-xs">From: info@orinlabi.com</p>
        <div className="flex items-center gap-3">
          {onCancel && <button type="button" onClick={onCancel} className="text-white/40 hover:text-white/70 text-sm transition-colors">Cancel</button>}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {sent && <p className="text-green-400 text-xs">Sent!</p>}
          <button type="submit" disabled={sending || sent} className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066d6] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
            {sending ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</> : sent ? "Sent!" : <><Send size={14} /> Send</>}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

function InboxView({
  emails,
  loading,
  onRefresh,
  onReply,
}: {
  emails: ReceivedEmail[];
  loading: boolean;
  onRefresh: () => void;
  onReply: (email: ReceivedEmail) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  async function markRead(email: ReceivedEmail) {
    if (email.read_at) return;
    await supabase.from("received_emails").update({ read_at: new Date().toISOString() }).eq("id", email.id);
  }

  function toggle(email: ReceivedEmail) {
    if (open !== email.id) markRead(email);
    setOpen(open === email.id ? null : email.id);
  }

  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading…</div>;
  if (emails.length === 0) return (
    <div className="text-center py-16">
      <Inbox size={32} className="text-white/15 mx-auto mb-3" />
      <p className="text-white/30 text-sm">Inbox empty — emails sent to info@orinlabi.com appear here.</p>
    </div>
  );

  return (
    <div className="space-y-1.5">
      {emails.map((email) => {
        const isOpen = open === email.id;
        const unread = !email.read_at;
        return (
          <div key={email.id} className={`rounded-xl border transition-colors ${isOpen ? "border-white/[0.12] bg-white/[0.05]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
            <button onClick={() => toggle(email)} className="w-full flex items-center gap-4 px-4 py-3.5 text-left">
              {/* Unread dot */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${unread ? "bg-[#007bff]" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm truncate ${unread ? "text-white font-semibold" : "text-white/70"}`}>{senderName(email.from_address)}</span>
                  <span className="text-white/25 text-xs truncate hidden sm:inline">{senderEmail(email.from_address)}</span>
                </div>
                <p className={`text-xs truncate ${unread ? "text-white/70" : "text-white/40"}`}>{email.subject}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-white/25 text-xs">{fmtDate(email.received_at)}</span>
                {isOpen ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/40 text-xs">From: <span className="text-white/70">{email.from_address}</span></p>
                    <p className="text-white/40 text-xs">To: <span className="text-white/70">{email.to_address}</span></p>
                  </div>
                  <button
                    onClick={() => onReply(email)}
                    className="flex items-center gap-1.5 bg-[#007bff]/10 hover:bg-[#007bff]/20 border border-[#007bff]/30 text-[#007bff] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Reply size={12} /> Reply
                  </button>
                </div>
                {email.html_body ? (
                  <iframe
                    srcDoc={email.html_body}
                    className="w-full rounded-xl bg-white"
                    style={{ minHeight: 200, border: "none" }}
                    sandbox="allow-same-origin"
                    onLoad={(e) => {
                      const iframe = e.currentTarget;
                      iframe.style.height = iframe.contentWindow?.document.body.scrollHeight + "px";
                    }}
                  />
                ) : (
                  <div className="bg-black/30 rounded-xl px-4 py-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {email.text_body ?? "(no body)"}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Sent log ──────────────────────────────────────────────────────────────────

function SentLog({ emails }: { emails: SentEmail[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (emails.length === 0) return <div className="text-center py-12 text-white/20 text-sm">No emails sent yet.</div>;
  return (
    <div className="space-y-2">
      {emails.map((e) => (
        <div key={e.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
          <button onClick={() => setExpanded(expanded === e.id ? null : e.id)} className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{e.subject}</p>
              <p className="text-white/35 text-xs truncate">To: {e.to_address}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-white/25 text-xs">{fmtDate(e.sent_at)}</span>
              {expanded === e.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
            </div>
          </button>
          {expanded === e.id && (
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
              {e.cc_address && <p className="text-white/40 text-xs mb-2">Cc: {e.cc_address}</p>}
              <div className="bg-black/30 rounded-xl px-4 py-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{e.body}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "inbox" | "compose" | "sent";

function EmailPageInner() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const initialTo     = searchParams.get("to") ?? "";

  const [adminEmail, setAdminEmail]   = useState("");
  const [tab, setTab]                 = useState<Tab>(initialTo ? "compose" : "inbox");
  const [received, setReceived]       = useState<ReceivedEmail[]>([]);
  const [sent, setSent]               = useState<SentEmail[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [replyTo, setReplyTo]         = useState<{ to: string; subject: string } | null>(null);
  const [setupState, setSetupState]   = useState<"idle" | "loading" | "done" | "error">("idle");
  const [setupMsg, setSetupMsg]       = useState("");

  // Realtime refresh for inbox
  const refreshInbox = async () => {
    setLoadingInbox(true);
    const { data } = await supabase.from("received_emails").select("*").order("received_at", { ascending: false }).limit(200);
    setReceived((data ?? []) as ReceivedEmail[]);
    setLoadingInbox(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAdminEmail(data.session?.user?.email ?? ""));

    refreshInbox();

    supabase.from("sent_emails").select("*").order("sent_at", { ascending: false }).limit(100)
      .then(({ data }) => setSent((data ?? []) as SentEmail[]));

    // Realtime: new email arrives
    const channel = supabase
      .channel("received-emails-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "received_emails" }, (payload) => {
        setReceived((prev) => [payload.new as ReceivedEmail, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = received.filter((e) => !e.read_at).length;

  async function setupInbound() {
    setSetupState("loading");
    setSetupMsg("");
    try {
      const res = await fetch("/api/admin/setup-inbound-route", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      });
      const json = await res.json();
      if (res.ok) {
        setSetupState("done");
        setSetupMsg("Inbound route created! Send a test email to info@orinlabi.com now.");
      } else {
        setSetupState("error");
        setSetupMsg(json.detail?.message ?? json.error ?? "Failed — check Vercel logs.");
      }
    } catch {
      setSetupState("error");
      setSetupMsg("Network error.");
    }
  }

  function handleReply(email: ReceivedEmail) {
    setReplyTo({
      to: senderEmail(email.from_address),
      subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
    });
    setTab("compose");
  }

  function handleSent(email: SentEmail) {
    setSent((prev) => [email, ...prev]);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-xl">Email</h1>
          <p className="text-white/40 text-sm mt-0.5">info@orinlabi.com</p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          <button onClick={() => setTab("inbox")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "inbox" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}>
            <Inbox size={14} />
            Inbox
            {unread > 0 && <span className="bg-[#007bff] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{unread}</span>}
          </button>
          <button onClick={() => { setReplyTo(null); setTab("compose"); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "compose" ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white/70"}`}>
            <Plus size={14} /> Compose
          </button>
          <button onClick={() => setTab("sent")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "sent" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}>
            <Clock size={14} /> Sent
          </button>
        </div>
      </div>

      {/* One-time inbound route setup */}
      {setupState !== "done" && (
        <div className="mb-5 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <div>
            <p className="text-amber-400 text-sm font-semibold">Inbound routing not configured yet</p>
            <p className="text-amber-400/60 text-xs mt-0.5">{setupMsg || "Click to wire up receiving from Resend — one-time setup."}</p>
          </div>
          <button
            onClick={setupInbound}
            disabled={setupState === "loading"}
            className="shrink-0 ml-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {setupState === "loading" ? "Setting up…" : setupState === "error" ? "Retry" : "Set up inbound"}
          </button>
        </div>
      )}
      {setupState === "done" && (
        <div className="mb-5 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm font-semibold">Inbound routing active</p>
          <p className="text-green-400/60 text-xs mt-0.5">{setupMsg}</p>
        </div>
      )}

      {tab === "inbox" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs">{received.length} email{received.length !== 1 ? "s" : ""}{unread > 0 ? ` · ${unread} unread` : ""}</p>
            <button onClick={refreshInbox} className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <InboxView emails={received} loading={loadingInbox} onRefresh={refreshInbox} onReply={handleReply} />
        </>
      )}

      {tab === "compose" && (
        <EmailComposer
          initialTo={replyTo?.to ?? initialTo}
          initialSubject={replyTo?.subject ?? ""}
          adminEmail={adminEmail}
          onSent={handleSent}
          onCancel={replyTo ? () => { setReplyTo(null); setTab("inbox"); } : undefined}
        />
      )}

      {tab === "sent" && <SentLog emails={sent} />}
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
